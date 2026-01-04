import { generateImage } from './server/_core/imageGeneration.ts';

async function testImage() {
  try {
    console.log('Testando geração de imagem...');
    
    const result = await generateImage({
      prompt: 'A simple blue circle on white background'
    });
    
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
  }
}

testImage();
