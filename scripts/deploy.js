#!/usr/bin/env node
/**
 * Deploy do Workflow DINT/FGV para Google Apps Script.
 *
 * Uso:
 *   npm run deploy
 *
 * O que faz:
 * 1. Verifica se .clasp.json está configurado
 * 2. Verifica se está logado no Google
 * 3. Executa clasp push para enviar todos os arquivos de apps-script/
 * 4. Mostra resultado e link para o editor
 */

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;

var ROOT = path.resolve(__dirname, '..');
var CLASP_JSON = path.join(ROOT, '.clasp.json');

function main() {
  console.log('');
  console.log('========================================');
  console.log('  Deploy - Workflow DINT/FGV v2.0');
  console.log('========================================');
  console.log('');

  // 1. Verificar .clasp.json
  if (!fs.existsSync(CLASP_JSON)) {
    console.error('[ERRO] .clasp.json nao encontrado.');
    console.error('       Execute primeiro: npm run setup -- --scriptId=SEU_ID');
    process.exit(1);
  }

  var config;
  try {
    config = JSON.parse(fs.readFileSync(CLASP_JSON, 'utf8'));
  } catch (e) {
    console.error('[ERRO] .clasp.json invalido: ' + e.message);
    process.exit(1);
  }

  if (!config.scriptId || config.scriptId === 'COLE_SEU_SCRIPT_ID_AQUI') {
    console.error('[ERRO] scriptId nao configurado.');
    console.error('       Execute: npm run setup -- --scriptId=SEU_ID');
    process.exit(1);
  }

  console.log('[OK] Projeto: ' + config.scriptId.substring(0, 20) + '...');
  console.log('[OK] rootDir: ' + (config.rootDir || '.'));

  // 2. Listar arquivos que serão enviados
  var rootDir = path.join(ROOT, config.rootDir || '.');
  var files = fs.readdirSync(rootDir).filter(function(f) {
    if (f.indexOf('CONSOLIDADO') !== -1) return false;
    return f.endsWith('.gs') || f.endsWith('.html') || f === 'appsscript.json';
  });
  console.log('');
  console.log('Arquivos a enviar (' + files.length + '):');
  files.forEach(function(f) {
    var stats = fs.statSync(path.join(rootDir, f));
    var kb = (stats.size / 1024).toFixed(1);
    console.log('  ' + f + ' (' + kb + ' KB)');
  });

  // 3. Push
  console.log('');
  console.log('Enviando para Google Apps Script...');
  console.log('');

  try {
    var output = execSync('npx clasp push --force', {
      cwd: ROOT,
      stdio: 'pipe',
      encoding: 'utf8'
    });
    console.log(output);
    console.log('[SUCESSO] Deploy concluido!');
  } catch (e) {
    var stderr = e.stderr ? e.stderr.toString() : '';
    var stdout = e.stdout ? e.stdout.toString() : '';

    if (stderr.indexOf('not logged in') !== -1 || stdout.indexOf('not logged in') !== -1) {
      console.error('[ERRO] Nao esta logado no Google.');
      console.error('       Execute: npm run login');
      process.exit(1);
    }

    console.error('[ERRO] Falha no deploy:');
    if (stdout) console.error(stdout);
    if (stderr) console.error(stderr);
    process.exit(1);
  }

  // 4. Link para o editor
  console.log('');
  console.log('Abrir no editor:');
  console.log('  https://script.google.com/d/' + config.scriptId + '/edit');
  console.log('');
  console.log('Ou execute: npm run open');
  console.log('');
}

main();
