import fs from 'fs';
import path from 'path';

const photosDir = '/home/ubuntu/temp_photos';

// Get env vars
const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

if (!FORGE_API_URL || !FORGE_API_KEY) {
  console.error('Missing BUILT_IN_FORGE_API_URL or BUILT_IN_FORGE_API_KEY');
  process.exit(1);
}

async function uploadPhoto(localPath, s3Key) {
  const buffer = fs.readFileSync(localPath);
  const blob = new Blob([buffer], { type: 'image/png' });
  
  const baseUrl = FORGE_API_URL.replace(/\/+$/, '');
  const uploadUrl = new URL('v1/storage/upload', baseUrl + '/');
  uploadUrl.searchParams.set('path', s3Key);
  
  const formData = new FormData();
  formData.append('file', blob, path.basename(s3Key));
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${FORGE_API_KEY}` },
    body: formData
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${text}`);
  }
  
  const result = await response.json();
  console.log(`Uploaded ${localPath} -> ${result.url}`);
  return result.url;
}

async function main() {
  const timestamp = Date.now();
  
  // Upload Meira Mattos
  const meiraUrl = await uploadPhoto(
    path.join(photosDir, 'meiramattos-bw-fixed.png'),
    `counselors/meiramattos-bw-fixed-${timestamp}.png`
  );
  
  // Upload Kissinger
  const kissingerUrl = await uploadPhoto(
    path.join(photosDir, 'kissinger-bw-fixed.png'),
    `counselors/kissinger-bw-fixed-${timestamp}.png`
  );
  
  // Upload Hitler home
  const hitlerHomeUrl = await uploadPhoto(
    path.join(photosDir, 'hitler-home-fixed.png'),
    `counselors/hitler-home-fixed-${timestamp}.png`
  );
  
  // Upload Hitler bio
  const hitlerBioUrl = await uploadPhoto(
    path.join(photosDir, 'hitler-bio-fixed.png'),
    `counselors/hitler-bio-fixed-${timestamp}.png`
  );
  
  console.log('\n=== URLs para atualizar no banco ===');
  console.log(JSON.stringify({
    meiraMattos: { homePhotoUrl: meiraUrl },
    kissinger: { homePhotoUrl: kissingerUrl },
    hitler: { homePhotoUrl: hitlerHomeUrl, bioPhotoUrl: hitlerBioUrl }
  }, null, 2));
}

main().catch(console.error);
