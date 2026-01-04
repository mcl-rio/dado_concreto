import Database from 'better-sqlite3';
const db = new Database('./data/sqlite.db');
const rows = db.prepare('SELECT id, provider, displayName, modelName, inputPricePerMillion, outputPricePerMillion, priceUpdatedAt FROM llm_pricing ORDER BY provider, displayName').all();

console.log('\n=== MODELOS CADASTRADOS NA TABELA DE PREÇOS ===\n');
for (const row of rows as any[]) {
  const updated = row.priceUpdatedAt ? new Date(row.priceUpdatedAt).toISOString().split('T')[0] : 'never';
  console.log(`${row.provider.padEnd(12)} | ${row.displayName.padEnd(35)} | ${row.modelName.padEnd(40)} | $${row.inputPricePerMillion}/$${row.outputPricePerMillion} | ${updated}`);
}
console.log(`\nTotal: ${rows.length} modelos`);
db.close();
