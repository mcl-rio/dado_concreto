import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const db = drizzle(dbUrl);

async function main() {
  // Listar tabelas com counselor
  const tables = await db.execute(sql`SHOW TABLES LIKE '%counselor%'`);
  console.log('Tabelas com counselor:', tables[0]);
  
  // Verificar estrutura da tabela counselors
  const counselorsStruct = await db.execute(sql`DESCRIBE counselors`);
  console.log('\nEstrutura da tabela counselors:', counselorsStruct[0]);
  
  // Verificar dados da tabela counselors
  const counselorsData = await db.execute(sql`SELECT * FROM counselors`);
  console.log('\nDados da tabela counselors:', counselorsData[0]);
  
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
