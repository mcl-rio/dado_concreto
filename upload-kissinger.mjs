import { storagePut } from './server/storage.ts';
import { readFileSync } from 'fs';

// Ler as imagens
const pbImage = readFileSync('/home/ubuntu/kissinger-pb.png');
const colorImage = readFileSync('/home/ubuntu/kissinger-color.png');

// Upload da imagem PB (galeria)
const pbResult = await storagePut(
  `counselors/kissinger-home-${Date.now()}.png`,
  pbImage,
  'image/png'
);
console.log('Imagem PB (galeria):', pbResult.url);

// Upload da imagem colorida (perfil)
const colorResult = await storagePut(
  `counselors/kissinger-bio-${Date.now()}.png`,
  colorImage,
  'image/png'
);
console.log('Imagem colorida (perfil):', colorResult.url);

console.log('');
console.log('URLs para atualizar no banco:');
console.log('homePhotoUrl:', pbResult.url);
console.log('bioPhotoUrl:', colorResult.url);

process.exit(0);
