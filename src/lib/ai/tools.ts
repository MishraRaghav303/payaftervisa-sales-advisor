import type Anthropic from "@anthropic-ai/sdk";

// The one real backend action the advisor can trigger. Only call this after
// the customer has explicitly confirmed they want to proceed - never
// speculatively, and never more than once per customer.
export const createLeadTool: Anthropic.Tool = {
  name: "create_lead",
  description:
    "Create a lead record in the CRM once the customer has confirmed interest in proceeding with a specific PayAfterVisa service. Only call this after explicit customer confirmation (e.g. they agree to register or move forward) - not just because they asked a question about a service.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      serviceType: {
        type: "string",
        description:
          "The specific service, e.g. 'UK Tourist Visa', 'Canada Tourist Visa', 'UAE Tourist Visa'",
      },
      status: {
        type: "string",
        enum: ["hot", "warm", "incomplete", "human_review"],
      },
      qualityScore: {
        type: "integer",
        description: "Lead quality score from 0-100",
      },
      recommendedAction: {
        type: "string",
        enum: [
          "CONTINUE_ASSESSMENT",
          "CREATE_ACCOUNT",
          "PROCEED_TO_PAYMENT",
          "REQUEST_DOCUMENTS",
          "HUMAN_REVIEW",
          "NOT_READY",
        ],
      },
      humanInterventionRequired: { type: "boolean" },
      summary: {
        type: "string",
        description:
          "2-4 sentence summary of the conversation for the human sales agent",
      },
    },
    required: [
      "serviceType",
      "status",
      "qualityScore",
      "recommendedAction",
      "humanInterventionRequired",
      "summary",
    ],
    additionalProperties: false,
  },
};
