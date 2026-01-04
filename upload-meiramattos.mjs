import fs from 'fs';
import path from 'path';

// Configuração do S3 via Manus Forge API
const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}

async function uploadToS3(filePath, relKey) {
  const baseUrl = ensureTrailingSlash(FORGE_API_URL);
  const key = normalizeKey(relKey);
  
  // Build upload URL
  const uploadUrl = new URL("v1/storage/upload", baseUrl);
  uploadUrl.searchParams.set("path", key);
  
  // Read file and create FormData
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'image/png' });
  const form = new FormData();
  form.append("file", blob, key.split("/").pop() ?? key);
  
  console.log(`Uploading to: ${uploadUrl.toString()}`);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FORGE_API_KEY}`
    },
    body: form
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Upload failed (${response.status}): ${error}`);
  }
  
  const result = await response.json();
  return result.url;
}

async function main() {
  try {
    console.log('Iniciando upload das imagens de Meira Mattos...');
    console.log(`API URL: ${FORGE_API_URL}`);
    
    // Upload da imagem preto e branco
    const bwPath = '/home/ubuntu/meiramattos_bw.png';
    const bwKey = `counselors/meiramattos-bw-${Date.now()}.png`;
    console.log(`\nUploading BW image: ${bwPath}`);
    const bwUrl = await uploadToS3(bwPath, bwKey);
    console.log(`BW URL: ${bwUrl}`);
    
    // Upload da imagem colorida
    const colorPath = '/home/ubuntu/meiramattos_color.png';
    const colorKey = `counselors/meiramattos-color-${Date.now()}.png`;
    console.log(`\nUploading color image: ${colorPath}`);
    const colorUrl = await uploadToS3(colorPath, colorKey);
    console.log(`Color URL: ${colorUrl}`);
    
    console.log('\n=== URLs das imagens ===');
    console.log(`BW_URL=${bwUrl}`);
    console.log(`COLOR_URL=${colorUrl}`);
    
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

main();
