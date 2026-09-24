import { db } from "@/lib/db/client";
import { knowledgeChunks as knowledgeChunksTable } from "@/lib/db/schema";
import { knowledgeChunks } from "./content";

async function seed() {
  await db.delete(knowledgeChunksTable);
  await db.insert(knowledgeChunksTable).values(
    knowledgeChunks.map((chunk) => ({
      title: chunk.title,
      content: chunk.content,
    })),
  );
  console.log(`Seeded ${knowledgeChunks.length} knowledge chunks.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
