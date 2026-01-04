import { createConnection } from 'mysql2/promise';

async function main() {
  const connection = await createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute(
    "SELECT `key`, `value` FROM system_parameters WHERE `key` LIKE 'image_url_stamp%' ORDER BY `key`"
  );
  
  console.log('Stamp URLs in database:');
  for (const row of rows) {
    console.log(`${row.key}:`);
    console.log(`  ${row.value}`);
    console.log('');
  }
  
  await connection.end();
}

main().catch(console.error);
