import { drizzle } from "drizzle-orm/mysql2";
import { int, mysqlTable, varchar, text, boolean, timestamp } from "drizzle-orm/mysql-core";

const counselorLlmConfig = mysqlTable("counselor_llm_config", {
  id: int("id").autoincrement().primaryKey(),
  counselorId: varchar("counselorId", { length: 50 }).notNull(),
  counselorName: varchar("counselorName", { length: 100 }).notNull(),
  llmProvider: varchar("llmProvider", { length: 50 }).notNull(),
  llmModel: varchar("llmModel", { length: 100 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const db = drizzle(dbUrl);

async function main() {
  const result = await db.select().from(counselorLlmConfig);
  console.log('Configuração LLM dos Conselheiros:');
  console.log('-----------------------------------');
  result.forEach(c => {
    console.log(`${c.counselorId.padEnd(20)} | ${c.counselorName.padEnd(25)} | ${c.llmProvider.padEnd(12)} | ${c.llmModel}`);
  });
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
