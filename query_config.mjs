import { createConnection } from 'mysql2/promise';

const conn = await createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute('SELECT * FROM counselor_llm_config WHERE counselorId = ?', ['counselor_autofill']);
console.log('Config:', JSON.stringify(rows, null, 2));
await conn.end();
