import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { int, mysqlTable, varchar, text, decimal, boolean, timestamp } from "drizzle-orm/mysql-core";

const llmPricing = mysqlTable("llm_pricing", {
  id: int("id").autoincrement().primaryKey(),
  provider: varchar("provider", { length: 50 }).notNull(),
  modelName: varchar("modelName", { length: 100 }).notNull(),
  displayName: varchar("displayName", { length: 150 }),
  inputPricePerMillion: decimal("inputPricePerMillion", { precision: 10, scale: 6 }).notNull(),
  outputPricePerMillion: decimal("outputPricePerMillion", { precision: 10, scale: 6 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const db = drizzle(dbUrl);

async function main() {
  const result = await db.select().from(llmPricing).where(eq(llmPricing.provider, 'anthropic'));
  console.log('Modelos Claude cadastrados:');
  result.forEach(m => {
    console.log(`ID: ${m.id} | ${m.modelName} | ${m.displayName || 'N/A'} | Active: ${m.isActive}`);
  });
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
