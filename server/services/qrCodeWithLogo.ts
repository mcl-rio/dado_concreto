import QRCode from 'qrcode';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

// Cores FGV
const FGV_BLUE = '#003366';

// Caminho para a logo FGV (globo)
const FGV_LOGO_PATH = path.join(process.cwd(), 'client/public/favicon-64x64.png');
const FGV_LOGO_FALLBACK_PATH = path.join(process.cwd(), 'dist/public/favicon-64x64.png');

/**
 * Gera um QR Code com a logo FGV centralizada
 * @param url URL a ser codificada no QR Code
 * @param size Tamanho do QR Code em pixels (padrão: 200)
 * @returns Buffer PNG do QR Code com logo ou null em caso de erro
 */
export async function generateQRCodeWithLogo(url: string, size: number = 200): Promise<Buffer | null> {
  try {
    // Gerar QR Code base com correção de erro alta (permite até 30% de obstrução)
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'H', // Alto nível de correção para permitir logo no centro
      color: {
        dark: FGV_BLUE,
        light: '#FFFFFF'
      }
    });

    // Tentar carregar a logo FGV
    let logoPath = FGV_LOGO_PATH;
    if (!fs.existsSync(logoPath)) {
      logoPath = FGV_LOGO_FALLBACK_PATH;
    }
    
    if (!fs.existsSync(logoPath)) {
      console.warn('Logo FGV não encontrada, retornando QR Code sem logo');
      return qrCodeBuffer;
    }

    // Calcular tamanho da logo (aproximadamente 20% do QR Code)
    const logoSize = Math.round(size * 0.22);
    const logoPosition = Math.round((size - logoSize) / 2);

    // Redimensionar a logo
    const logoBuffer = await sharp(logoPath)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toBuffer();

    // Criar um fundo branco circular para a logo (para melhor legibilidade)
    const padding = Math.round(logoSize * 0.1);
    const backgroundSize = logoSize + padding * 2;
    const backgroundPosition = Math.round((size - backgroundSize) / 2);
    
    const whiteBackground = await sharp({
      create: {
        width: backgroundSize,
        height: backgroundSize,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .png()
    .toBuffer();

    // Compor a imagem final: QR Code + fundo branco + logo
    const finalImage = await sharp(qrCodeBuffer)
      .composite([
        {
          input: whiteBackground,
          top: backgroundPosition,
          left: backgroundPosition
        },
        {
          input: logoBuffer,
          top: logoPosition,
          left: logoPosition
        }
      ])
      .png()
      .toBuffer();

    return finalImage;
  } catch (error) {
    console.error('Erro ao gerar QR Code com logo:', error);
    // Fallback: retornar QR Code simples sem logo
    try {
      const fallbackBuffer = await QRCode.toBuffer(url, {
        width: size,
        margin: 2,
        color: {
          dark: FGV_BLUE,
          light: '#FFFFFF'
        }
      });
      return fallbackBuffer;
    } catch (fallbackError) {
      console.error('Erro ao gerar QR Code fallback:', fallbackError);
      return null;
    }
  }
}

/**
 * Gera um QR Code com logo FGV como string base64 (para uso em HTML)
 * @param url URL a ser codificada no QR Code
 * @param size Tamanho do QR Code em pixels (padrão: 200)
 * @returns String base64 do QR Code com logo ou string vazia em caso de erro
 */
export async function generateQRCodeWithLogoBase64(url: string, size: number = 200): Promise<string> {
  try {
    const buffer = await generateQRCodeWithLogo(url, size);
    if (!buffer) return '';
    
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Erro ao gerar QR Code base64 com logo:', error);
    return '';
  }
}
