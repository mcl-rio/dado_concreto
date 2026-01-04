import { drizzle } from "drizzle-orm/mysql2";
import { desc } from "drizzle-orm";
import { int, mysqlTable, varchar, text, decimal, boolean, timestamp } from "drizzle-orm/mysql-core";

// Define schema inline
const llmPricing = mysqlTable("llm_pricing", {
  id: int("id").autoincrement().primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(),
  modelName: varchar("modelName", { length: 100 }).notNull(),
  displayName: varchar("displayName", { length: 150 }),
  inputPricePerMillion: decimal("inputPricePerMillion", { precision: 10, scale: 6 }).notNull(),
  outputPricePerMillion: decimal("outputPricePerMillion", { precision: 10, scale: 6 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
});

// Get DATABASE_URL from environment
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const db = drizzle(dbUrl);

async function main() {
  const result = await db.select().from(llmPricing).orderBy(llmPricing.provider, llmPricing.modelName);
  console.log('Total models:', result.length);
  console.log('\n--- MODELS ---\n');
  result.forEach(m => {
    console.log(`${m.provider.padEnd(12)} | ${m.modelName.padEnd(35)} | ${(m.displayName || 'N/A').padEnd(30)} | Active: ${m.isActive}`);
  });
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
