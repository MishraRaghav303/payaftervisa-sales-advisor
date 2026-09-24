import { db } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";

export type CreateLeadInput = {
  customerId: string;
  serviceType: string;
  status: "hot" | "warm" | "incomplete" | "human_review";
  qualityScore: number;
  recommendedAction: string;
  humanInterventionRequired: boolean;
  summary: string;
};

// The real backend action: this is what actually gets a database row
// written when the advisor decides a customer is qualified. Called from
// the create_lead tool handler, never invoked just because the model said
// it would be.
export async function createLead(input: CreateLeadInput) {
  const [lead] = await db
    .insert(leads)
    .values({
      customerId: input.customerId,
      serviceType: input.serviceType,
      status: input.status,
      qualityScore: input.qualityScore,
      recommendedAction: input.recommendedAction,
      humanInterventionRequired: input.humanInterventionRequired,
      summary: input.summary,
    })
    .returning();

  return lead;
}
