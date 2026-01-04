/**
 * Script para corrigir campos writingStyle e analysisApproach que foram salvos como [object Object]
 * Execute com: node scripts/fix-counselor-fields.mjs
 */

import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Buscando conselheiros com campos problemáticos...');
  
  // Buscar todos os conselheiros
  const [rows] = await connection.execute('SELECT id, counselorId, writingStyle, analysisApproach FROM counselors');
  
  let fixedCount = 0;
  
  for (const row of rows) {
    let needsUpdate = false;
    const updates = {};
    
    // Verificar writingStyle
    if (row.writingStyle === '[object Object]' || row.writingStyle === 'undefined') {
      updates.writingStyle = '';
      needsUpdate = true;
      console.log(`  - ${row.counselorId}: writingStyle será limpo`);
    }
    
    // Verificar analysisApproach
    if (row.analysisApproach === '[object Object]' || row.analysisApproach === 'undefined') {
      updates.analysisApproach = '';
      needsUpdate = true;
      console.log(`  - ${row.counselorId}: analysisApproach será limpo`);
    }
    
    if (needsUpdate) {
      const setClauses = [];
      const values = [];
      
      if (updates.writingStyle !== undefined) {
        setClauses.push('writingStyle = ?');
        values.push(updates.writingStyle);
      }
      if (updates.analysisApproach !== undefined) {
        setClauses.push('analysisApproach = ?');
        values.push(updates.analysisApproach);
      }
      
      values.push(row.id);
      
      await connection.execute(
        `UPDATE counselors SET ${setClauses.join(', ')} WHERE id = ?`,
        values
      );
      fixedCount++;
    }
  }
  
  console.log(`\nTotal de conselheiros corrigidos: ${fixedCount}`);
  
  await connection.end();
}

main().catch(console.error);
