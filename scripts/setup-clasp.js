#!/usr/bin/env node
/**
 * Setup do clasp para o projeto Workflow DINT/FGV.
 *
 * Uso:
 *   npm run setup                          # interativo
 *   npm run setup -- --scriptId=SEU_ID     # direto
 *
 * O que faz:
 * 1. Verifica se clasp está instalado
 * 2. Cria/atualiza .clasp.json com o scriptId
 * 3. Configura rootDir para apps-script/
 * 4. Verifica se appsscript.json existe
 */

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;

var ROOT = path.resolve(__dirname, '..');
var CLASP_JSON = path.join(ROOT, '.clasp.json');
var APPS_SCRIPT_DIR = path.join(ROOT, 'apps-script');
var MANIFEST = path.join(APPS_SCRIPT_DIR, 'appsscript.json');

function main() {
  console.log('');
  console.log('=== Setup Clasp - Workflow DINT/FGV ===');
  console.log('');

  // 1. Verificar clasp
  try {
    execSync('npx clasp --version', { cwd: ROOT, stdio: 'pipe' });
    console.log('[OK] clasp instalado');
  } catch (e) {
    console.error('[ERRO] clasp nao encontrado. Execute: npm install');
    process.exit(1);
  }

  // 2. Obter scriptId
  var scriptId = '';

  // Tentar ler do argumento --scriptId=...
  var args = process.argv.slice(2);
  for (var i = 0; i < args.length; i++) {
    if (args[i].startsWith('--scriptId=')) {
      scriptId = args[i].split('=')[1];
    }
  }

  // Tentar ler do .clasp.json existente
  if (!scriptId && fs.existsSync(CLASP_JSON)) {
    try {
      var existing = JSON.parse(fs.readFileSync(CLASP_JSON, 'utf8'));
      if (existing.scriptId && existing.scriptId !== 'COLE_SEU_SCRIPT_ID_AQUI') {
        scriptId = existing.scriptId;
        console.log('[INFO] Usando scriptId existente: ' + scriptId.substring(0, 20) + '...');
      }
    } catch (e) { /* ignore */ }
  }

  // Se ainda não tem, pedir
  if (!scriptId) {
    console.log('');
    console.log('COMO ENCONTRAR O SCRIPT ID:');
    console.log('  1. Abra a planilha no Google Sheets');
    console.log('  2. Va em Extensoes > Apps Script');
    console.log('  3. Clique na engrenagem (Configuracoes do projeto)');
    console.log('  4. Copie o "ID do script"');
    console.log('');
    console.log('Depois execute:');
    console.log('  npm run setup -- --scriptId=SEU_ID_AQUI');
    console.log('');

    // Criar .clasp.json com placeholder
    var placeholder = {
      scriptId: 'COLE_SEU_SCRIPT_ID_AQUI',
      rootDir: 'apps-script'
    };
    fs.writeFileSync(CLASP_JSON, JSON.stringify(placeholder, null, 2) + '\n');
    console.log('[INFO] .clasp.json criado com placeholder.');
    console.log('       Edite o arquivo ou use --scriptId=...');
    process.exit(0);
  }

  // 3. Criar/atualizar .clasp.json
  var claspConfig = {
    scriptId: scriptId,
    rootDir: 'apps-script'
  };
  fs.writeFileSync(CLASP_JSON, JSON.stringify(claspConfig, null, 2) + '\n');
  console.log('[OK] .clasp.json configurado');
  console.log('     scriptId: ' + scriptId);
  console.log('     rootDir:  apps-script/');

  // 4. Verificar manifest
  if (fs.existsSync(MANIFEST)) {
    console.log('[OK] appsscript.json encontrado');
  } else {
    console.log('[AVISO] appsscript.json NAO encontrado em apps-script/');
  }

  // 5. Verificar login
  console.log('');
  console.log('Proximo passo:');
  console.log('  1. npm run login    (se ainda nao fez login no Google)');
  console.log('  2. npm run deploy   (para enviar o codigo para a planilha)');
  console.log('');
}

main();
