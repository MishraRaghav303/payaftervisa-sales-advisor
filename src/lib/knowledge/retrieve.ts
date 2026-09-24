import { db } from "@/lib/db/client";
import { knowledgeChunks } from "@/lib/db/schema";

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "do", "does", "did",
  "how", "what", "when", "where", "which", "who", "why", "will",
  "i", "you", "he", "she", "it", "we", "they", "my", "your",
  "to", "of", "for", "in", "on", "at", "by", "with", "about",
  "and", "or", "but", "if", "than", "so", "as", "can", "could",
  "would", "should", "much", "many", "this", "that", "these", "those",
]);

function extractTerms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word));
}

// The knowledge base is small enough (under a dozen chunks) that scoring
// all chunks in-process is simpler and more reliable than SQL full-text
// query syntax, while keeping the same retrieval interface a larger-scale
// (e.g. embeddings-based) implementation would expose.
export async function retrieveKnowledge(query: string, limit = 4) {
  const allChunks = await db
    .select({ title: knowledgeChunks.title, content: knowledgeChunks.content })
    .from(knowledgeChunks);

  const queryTerms = extractTerms(query);
  if (queryTerms.length === 0) return [];

  const scored = allChunks.map((chunk) => {
    const chunkTerms = extractTerms(`${chunk.title} ${chunk.content}`);
    const score = queryTerms.reduce(
      (sum, term) => sum + (chunkTerms.includes(term) ? 1 : 0),
      0,
    );
    return { ...chunk, score };
  });

  return scored
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Always-included baseline chunks (business rules that apply to every
// conversation regardless of what the customer asks about).
export async function getBaselineKnowledge() {
  const baselineTitles = new Set([
    "General PayAfterVisa Rules",
    "Lead Classification Rules",
    "Recommended Next Actions",
  ]);

  const allChunks = await db
    .select({ title: knowledgeChunks.title, content: knowledgeChunks.content })
    .from(knowledgeChunks);

  return allChunks.filter((chunk) => baselineTitles.has(chunk.title));
}
