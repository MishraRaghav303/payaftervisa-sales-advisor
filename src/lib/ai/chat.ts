import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, CONVERSATION_MODEL } from "./client";
import { buildSystemPrompt } from "./systemPrompt";
import { createLeadTool } from "./tools";
import { logUsage } from "./usage";
import { createLead } from "@/lib/leads/createLead";

export type ChatTurnResult = {
  replyText: string;
  leadCreated: boolean;
};

export async function runConversationTurn(
  customerId: string,
  history: Anthropic.MessageParam[],
  latestUserMessage: string,
): Promise<ChatTurnResult> {
  const system = await buildSystemPrompt(latestUserMessage);

  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: "user", content: latestUserMessage },
  ];

  let leadCreated = false;
  let replyText = "";

  // Small bounded loop: in practice this resolves in 1-2 iterations (a
  // reply, or a single create_lead tool call followed by a reply).
  for (let iteration = 0; iteration < 4; iteration++) {
    const response = await anthropic.messages.create({
      model: CONVERSATION_MODEL,
      max_tokens: 1024,
      system,
      tools: [createLeadTool],
      messages,
    });

    await logUsage({
      customerId,
      model: CONVERSATION_MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
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
        await createLead({ customerId, ...input });
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

  return { replyText, leadCreated };
}
