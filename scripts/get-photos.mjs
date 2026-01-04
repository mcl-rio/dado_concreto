import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const url = new URL(DATABASE_URL);
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true }
  });

  const [rows] = await connection.execute(
    "SELECT id, name, homePhotoUrl, bioPhotoUrl FROM counselors WHERE name LIKE '%Meira%' OR name LIKE '%Kissinger%' OR name LIKE '%Hitler%'"
  );

  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

main().catch(console.error);
