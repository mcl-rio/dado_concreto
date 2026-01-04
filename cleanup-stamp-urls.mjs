import { createConnection } from 'mysql2/promise';

async function main() {
  console.log('=== Limpando URLs de carimbos incorretas ===\n');
  
  const connection = await createConnection(process.env.DATABASE_URL);
  
  // Verificar URLs atuais
  const [rows] = await connection.execute(
    "SELECT `key`, `value` FROM system_parameters WHERE `key` LIKE 'image_url_stamp%' ORDER BY `key`"
  );
  
  console.log('URLs atuais no banco:');
  for (const row of rows) {
    console.log(`  ${row.key}: ${row.value.substring(0, 80)}...`);
  }
  
  // Deletar todas as URLs de stamps (para usar fallback local)
  await connection.execute(
    "DELETE FROM system_parameters WHERE `key` LIKE 'image_url_stamp_%'"
  );
  console.log('\nDeletadas todas as URLs de stamps');
  
  // Verificar resultado
  const [remaining] = await connection.execute(
    "SELECT `key`, `value` FROM system_parameters WHERE `key` LIKE 'image_url_stamp%' ORDER BY `key`"
  );
  
  console.log('\nURLs restantes no banco:', remaining.length);
  
  await connection.end();
  console.log('\n=== Limpeza concluída! ===');
}

main().catch(console.error);
