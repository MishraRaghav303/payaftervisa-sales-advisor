import { db } from "@/lib/db/client";
import { knowledgeChunks } from "@/lib/db/schema";

export async function getAllKnowledge() {
  return db
    .select({ title: knowledgeChunks.title, content: knowledgeChunks.content })
    .from(knowledgeChunks);
}
