import { createConnection } from 'mysql2/promise';

async function main() {
  const connection = await createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute(
    "SELECT `key`, `value`, `updatedAt` FROM system_parameters WHERE `key` LIKE 'image_url_%' ORDER BY `key`"
  );
  
  console.log('Image URLs in database:');
  for (const row of rows) {
    console.log(`${row.key}: ${row.value}`);
  }
  
  await connection.end();
}

main().catch(console.error);
