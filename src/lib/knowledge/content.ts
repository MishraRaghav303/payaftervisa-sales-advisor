// Controlled knowledge base. The advisor must only answer from this content.
// Anything not covered here should be flagged for human verification rather
// than answered from general knowledge.

export type KnowledgeChunk = {
  title: string;
  content: string;
};

export const knowledgeChunks: KnowledgeChunk[] = [
  {
    title: "UK Tourist Visa - Overview and Pricing",
    content: `Service: Tourist / Visitor Visa Assistance for the United Kingdom.
Initial PayAfterVisa payment: USD 200. This activates the customer's application/account and document-processing workflow.
Remaining service fee: USD 2,000, due after visa approval.
AI restriction: never guarantee visa approval for this or any service.`,
  },
  {
    title: "UK Tourist Visa - Information and Documents Required",
    content: `Basic information required from the customer for a UK Tourist Visa assessment:
Nationality, country of residence, intended travel date, intended duration, purpose of visit, employment/business status, approximate monthly income, available travel budget, previous international travel, previous visa refusals if any.

Documents normally requested for initial assessment: passport, residence permit if applying outside country of citizenship, bank/financial evidence, employment/business evidence, proposed travel details, previous visa/refusal information where applicable.`,
  },
  {
    title: "Canada Tourist Visa - Overview and Pricing",
    content: `Service: Visitor Visa Assistance for Canada.
Initial PayAfterVisa payment: USD 200.
Remaining service fee: USD 3,000, due after visa approval.
AI restriction: visa approval cannot be promised or guaranteed.`,
  },
  {
    title: "Canada Tourist Visa - Information and Documents Required",
    content: `Information required for initial assessment: nationality, residence country, age, purpose of visit, proposed travel period, employment/business situation, financial position, family situation, international travel history, previous Canadian or other visa refusals.

Documents normally requested: passport, residence permit where applicable, financial evidence, employment/business evidence, travel history, proposed itinerary, previous refusal documents where applicable.`,
  },
  {
    title: "Dubai/UAE Tourist Visa - Overview and Pricing",
    content: `Service: UAE Tourist Visa Assistance.
Initial PayAfterVisa payment: USD 200.
Remaining service fee: USD 500, due after approval.`,
  },
  {
    title: "Dubai/UAE Tourist Visa - Information and Documents Required",
    content: `Information required: nationality, country of residence, intended travel date, intended duration, purpose of travel, previous UAE travel if applicable.

Initial documents: passport, photograph, residence information where applicable, travel details.`,
  },
  {
    title: "General PayAfterVisa Rules",
    content: `PayAfterVisa is an online platform providing visa-related application assistance.
The initial payment for the UK, Canada, and UAE tourist visa products above is USD 200.
Payment of USD 200 does not guarantee visa approval. Visa decisions are made solely by the relevant government/immigration/consular authority.

The AI must never say: "Your visa will definitely be approved," "We guarantee your visa," or "You have a 100% chance."

If a customer asks something not covered in this knowledge base, the AI must not invent an answer. It should say this requires verification by the PayAfterVisa team and offer to have a human follow up.`,
  },
  {
    title: "Lead Classification Rules",
    content: `HOT LEAD: customer has selected a destination, has an approximate travel period, appears ready to proceed, and agrees to registration/payment.
WARM LEAD: customer has genuine travel intention but requires additional information or is not yet ready to proceed.
INCOMPLETE LEAD: important information required for assessment is missing.
HUMAN REVIEW: the AI cannot confidently answer the customer's question from the knowledge base, or the case requires individual assessment.`,
  },
  {
    title: "Recommended Next Actions",
    content: `Depending on the conversation, the recommended next action must be one of exactly these values: CONTINUE_ASSESSMENT, CREATE_ACCOUNT, PROCEED_TO_PAYMENT, REQUEST_DOCUMENTS, HUMAN_REVIEW, NOT_READY.`,
  },
];
