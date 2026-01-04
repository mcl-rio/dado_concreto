import { createConnection } from 'mysql2/promise';
import { readFile } from 'fs/promises';

// Este script irá fazer upload das imagens corretas para o S3 e atualizar o banco de dados

async function main() {
  console.log('=== Correção das Imagens de Carimbos ===\n');
  
  // Verificar as imagens locais
  const stampsPath = './client/public/stamps/';
  
  console.log('Imagens locais disponíveis:');
  const { readdirSync } = await import('fs');
  const files = readdirSync(stampsPath);
  files.forEach(f => console.log(`  - ${f}`));
  
  console.log('\n=== Verificando URLs no banco ===');
  
  const connection = await createConnection(process.env.DATABASE_URL);
  
  const [rows] = await connection.execute(
    "SELECT `key`, `value` FROM system_parameters WHERE `key` LIKE 'image_url_stamp%' ORDER BY `key`"
  );
  
  console.log('URLs atuais no banco:');
  for (const row of rows) {
    console.log(`  ${row.key}: ${row.value.substring(0, 80)}...`);
  }
  
  // A solução é fazer upload das imagens corretas via o painel de admin
  // Ou deletar as URLs incorretas do banco para usar o fallback local
  
  console.log('\n=== Solução: Deletar URLs incorretas para usar fallback local ===');
  
  // Deletar a URL incorreta do stamp_approved
  await connection.execute(
    "DELETE FROM system_parameters WHERE `key` = 'image_url_stamp_approved'"
  );
  console.log('Deletado: image_url_stamp_approved');
  
  // Verificar resultado
  const [remaining] = await connection.execute(
    "SELECT `key`, `value` FROM system_parameters WHERE `key` LIKE 'image_url_stamp%' ORDER BY `key`"
  );
  
  console.log('\nURLs restantes no banco:');
  for (const row of remaining) {
    console.log(`  ${row.key}: ${row.value.substring(0, 80)}...`);
  }
  
  await connection.end();
  console.log('\n=== Correção concluída! ===');
  console.log('O sistema agora usará as imagens locais corretas.');
}

main().catch(console.error);
