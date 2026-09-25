import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, CONVERSATION_MODEL } from "./client";
import { buildSystemPrompt } from "./systemPrompt";
import { createLeadTool } from "./tools";
import { logUsage } from "./usage";
import { createLead } from "@/lib/leads/createLead";
import type { leads as leadsTable } from "@/lib/db/schema";

export type ChatTurnResult = {
  replyText: string;
  leadCreated: boolean;
  lead: typeof leadsTable.$inferSelect | null;
};

export async function runConversationTurn(
  customerId: string,
  history: Anthropic.MessageParam[],
  latestUserMessage: string,
): Promise<ChatTurnResult> {
  const systemText = await buildSystemPrompt();

  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: "user", content: latestUserMessage },
  ];

  let leadCreated = false;
  let replyText = "";
  let createdLead: typeof leadsTable.$inferSelect | null = null;

  // Small bounded loop: in practice this resolves in 1-2 iterations (a
  // reply, or a single create_lead tool call followed by a reply).
  for (let iteration = 0; iteration < 4; iteration++) {
    const response = await anthropic.messages.create({
      model: CONVERSATION_MODEL,
      max_tokens: 1024,
      // Low effort: this is a straightforward conversational task, not
      // deep reasoning - keeps latency and cost down without hurting
      // response quality here.
      output_config: { effort: "low" },
      // Cached: this text is byte-identical across every call, for every
      // customer, so after the first write subsequent calls pay roughly
      // 10% of normal input-token price for this block.
      system: [
        { type: "text", text: systemText, cache_control: { type: "ephemeral" } },
      ],
      tools: [createLeadTool],
      messages,
    });

    await logUsage({
      customerId,
      model: CONVERSATION_MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheCreationTokens: response.usage.cache_creation_input_tokens ?? undefined,
      cacheReadTokens: response.usage.cache_read_input_tokens ?? undefined,
      purpose: "conversation",
    });

    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (textBlocks.length > 0) {
      replyText = textBlocks.map((b) => b.text).join("\n");
    }

    if (response.stop_reason !== "tool_use") {
      break;
    }

    messages.push({ role: "assistant", content: response.content });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      if (block.name === "create_lead") {
        const input = block.input as {
          serviceType: string;
          status: "hot" | "warm" | "incomplete" | "human_review";
          qualityScore: number;
          recommendedAction: string;
          humanInterventionRequired: boolean;
          summary: string;
        };
        createdLead = await createLead({ customerId, ...input });
        leadCreated = true;
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: "Lead record created successfully.",
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  return { replyText, leadCreated, lead: createdLead };
}
