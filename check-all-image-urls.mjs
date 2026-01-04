import { createConnection } from 'mysql2/promise';

async function main() {
  const connection = await createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute(
    "SELECT `key`, `value` FROM system_parameters WHERE `key` LIKE 'image_url_%' ORDER BY `key`"
  );
  
  console.log('All image URLs in database:');
  console.log('Total rows:', rows.length);
  for (const row of rows) {
    console.log(`\n${row.key}:`);
    console.log(`  ${row.value}`);
  }
  
  await connection.end();
}

main().catch(console.error);
