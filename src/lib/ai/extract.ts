import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, EXTRACTION_MODEL } from "./client";
import { logUsage } from "./usage";

export const ProfileExtractionSchema = z.object({
  name: z.string().nullable(),
  nationality: z.string().nullable(),
  residenceCountry: z.string().nullable(),
  destinationCountry: z.string().nullable(),
  purpose: z.string().nullable(),
  age: z.number().int().nullable(),
  travelHistory: z.string().nullable(),
  educationWorkProfile: z.string().nullable(),
  approxBudget: z.string().nullable(),
  travelTimeline: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  leadStatus: z.enum(["hot", "warm", "incomplete", "human_review"]),
  qualityScore: z.number().int().min(0).max(100),
  recommendedAction: z.enum([
    "CONTINUE_ASSESSMENT",
    "CREATE_ACCOUNT",
    "PROCEED_TO_PAYMENT",
    "REQUEST_DOCUMENTS",
    "HUMAN_REVIEW",
    "NOT_READY",
  ]),
  humanInterventionRequired: z.boolean(),
  conversationSummary: z
    .string()
    .describe("2-4 sentence summary for a human sales agent"),
});

export type ProfileExtraction = z.infer<typeof ProfileExtractionSchema>;

export async function extractProfile(
  customerId: string,
  transcript: { role: string; content: string }[],
): Promise<ProfileExtraction> {
  const transcriptText = transcript
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const response = await anthropic.messages.parse({
    model: EXTRACTION_MODEL,
    max_tokens: 1024,
    system:
      "Extract structured customer/lead information from this PayAfterVisa sales conversation transcript. Use null for anything not yet mentioned. approxBudget means the CUSTOMER's own stated travel/study budget - never PayAfterVisa's service pricing (the USD 200 upfront fee or the remaining service fee are not the customer's budget). Apply these lead rules: HOT = destination + approximate travel period + ready to proceed; WARM = genuine intent but missing info or not ready; INCOMPLETE = key assessment info missing; HUMAN_REVIEW = advisor could not confidently answer from the knowledge base or the case needs individual assessment.",
    messages: [{ role: "user", content: transcriptText }],
    output_config: {
      format: zodOutputFormat(ProfileExtractionSchema),
    },
  });

  await logUsage({
    customerId,
    model: EXTRACTION_MODEL,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    purpose: "extraction",
  });

  if (!response.parsed_output) {
    throw new Error("Profile extraction failed to parse");
  }

  return response.parsed_output;
}
