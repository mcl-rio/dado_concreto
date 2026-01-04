import { storagePut } from './server/storage.ts';
import { readFileSync } from 'fs';

console.log('Iniciando upload...');

try {
  // Ler as imagens
  console.log('Lendo imagens...');
  const pbImage = readFileSync('/home/ubuntu/kissinger-pb.png');
  const colorImage = readFileSync('/home/ubuntu/kissinger-color.png');
  console.log('Imagens lidas:', pbImage.length, 'bytes PB,', colorImage.length, 'bytes colorida');

  // Upload da imagem PB (galeria)
  console.log('Fazendo upload da imagem PB...');
  const pbResult = await storagePut(
    `counselors/kissinger-home-${Date.now()}.png`,
    pbImage,
    'image/png'
  );
  console.log('Imagem PB (galeria):', pbResult.url);

  // Upload da imagem colorida (perfil)
  console.log('Fazendo upload da imagem colorida...');
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
} catch (error) {
  console.error('Erro:', error);
}

process.exit(0);
