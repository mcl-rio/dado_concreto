import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const db = drizzle(dbUrl);

async function main() {
  // Verificar dados da tabela counselors
  const counselorsData = await db.execute(sql`SELECT id, counselorId, name, llmProvider, llmModel, isActive FROM counselors`);
  console.log('Conselheiros cadastrados:', counselorsData[0].length);
  if (counselorsData[0].length > 0) {
    counselorsData[0].forEach((c) => {
      console.log(`${String(c.counselorId).padEnd(20)} | ${String(c.name).padEnd(25)} | ${String(c.llmProvider).padEnd(12)} | ${c.llmModel} | Active: ${c.isActive}`);
    });
  } else {
    console.log('Nenhum conselheiro cadastrado na tabela counselors');
  }
  
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
