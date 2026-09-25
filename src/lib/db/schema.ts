import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  numeric,
  boolean,
  vector,
} from "drizzle-orm/pg-core";

// A customer is identified by an anonymous session token stored in their
// browser (localStorage). No login required for the prototype — this is
// what lets them close the browser and resume later on the same device.
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Full message-by-message transcript.
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "customer" | "advisor" | "system"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// The structured profile extracted from conversation, updated incrementally
// as new information is learned. One row per customer.
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" })
    .unique(),
  nationality: text("nationality"),
  residenceCountry: text("residence_country"),
  destinationCountry: text("destination_country"),
  purpose: text("purpose"), // e.g. tourism, study, work
  age: integer("age"),
  travelHistory: text("travel_history"),
  educationWorkProfile: text("education_work_profile"),
  approxBudget: text("approx_budget"),
  travelTimeline: text("travel_timeline"),
  raw: jsonb("raw"), // full extracted JSON, for anything not in fixed columns
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Lead record — created by the actual backend action when the advisor
// determines a customer is qualified and they confirm interest.
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  serviceType: text("service_type"), // e.g. "UK Tourist Visa"
  status: text("status").notNull(), // hot | warm | incomplete | human_review
  qualityScore: integer("quality_score"), // 0-100
  recommendedAction: text("recommended_action"), // CONTINUE_ASSESSMENT | CREATE_ACCOUNT | ...
  humanInterventionRequired: boolean("human_intervention_required")
    .notNull()
    .default(false),
  summary: text("summary"), // short conversation summary for the sales agent
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Per-call AI usage/cost logging.
export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  estimatedCostUsd: numeric("estimated_cost_usd", {
    precision: 10,
    scale: 6,
  }).notNull(),
  purpose: text("purpose").notNull(), // "conversation" | "extraction" | "scoring"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Errors from the conversation API, surfaced in the admin panel and
// emailed to the team.
export const errorLogs = pgTable("error_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(), // e.g. "conversation_api"
  message: text("message").notNull(),
  stack: text("stack"),
  customerId: uuid("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Knowledge base chunks with embeddings for retrieval (RAG).
export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
