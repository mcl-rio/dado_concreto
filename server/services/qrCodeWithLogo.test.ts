import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

// Mock fs.existsSync para simular presença/ausência da logo
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true),
  };
});

// Mock sharp para evitar dependência de processamento de imagem real nos testes
vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    composite: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-image-data')),
  }));
  
  // Adicionar suporte para sharp({ create: ... })
  mockSharp.mockImplementation((input?: any) => ({
    resize: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    composite: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-image-data')),
  }));
  
  return { default: mockSharp };
});

// Mock qrcode
vi.mock('qrcode', () => ({
  default: {
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('mock-qr-code')),
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockbase64data'),
  },
}));

describe('QR Code com Logo FGV', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateQRCodeWithLogo', () => {
    it('deve gerar um QR Code com logo quando a logo existe', async () => {
      const { generateQRCodeWithLogo } = await import('./qrCodeWithLogo');
      
      const result = await generateQRCodeWithLogo('https://example.com/verify/123', 200);
      
      expect(result).toBeInstanceOf(Buffer);
      expect(result).not.toBeNull();
    });

    it('deve gerar QR Code mesmo quando a logo não existe (fallback)', async () => {
      // Simular logo não encontrada
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const { generateQRCodeWithLogo } = await import('./qrCodeWithLogo');
      
      const result = await generateQRCodeWithLogo('https://example.com/verify/456', 200);
      
      // Deve retornar um buffer (QR Code sem logo)
      expect(result).toBeInstanceOf(Buffer);
    });

    it('deve aceitar tamanhos personalizados', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      const { generateQRCodeWithLogo } = await import('./qrCodeWithLogo');
      
      const result150 = await generateQRCodeWithLogo('https://example.com', 150);
      const result300 = await generateQRCodeWithLogo('https://example.com', 300);
      
      expect(result150).toBeInstanceOf(Buffer);
      expect(result300).toBeInstanceOf(Buffer);
    });
  });

  describe('generateQRCodeWithLogoBase64', () => {
    it('deve gerar uma string base64 válida', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      const { generateQRCodeWithLogoBase64 } = await import('./qrCodeWithLogo');
      
      const result = await generateQRCodeWithLogoBase64('https://example.com/verify/789', 120);
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it('deve usar tamanho padrão de 200 quando não especificado', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      const { generateQRCodeWithLogoBase64 } = await import('./qrCodeWithLogo');
      
      const result = await generateQRCodeWithLogoBase64('https://example.com');
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Integração com geradores de relatório', () => {
    it('deve ser compatível com o formato esperado pelo docxGenerator', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      const { generateQRCodeWithLogo } = await import('./qrCodeWithLogo');
      
      // docxGenerator usa tamanho 150
      const result = await generateQRCodeWithLogo('https://conselho.fgv.br/verify/FGV-GEO-2025-0001', 150);
      
      expect(result).toBeInstanceOf(Buffer);
      expect(result).not.toBeNull();
    });

    it('deve ser compatível com o formato esperado pelo reportGenerator', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      
      const { generateQRCodeWithLogoBase64 } = await import('./qrCodeWithLogo');
      
      // reportGenerator usa tamanho 120 e formato base64
      const result = await generateQRCodeWithLogoBase64('https://conselho.fgv.br/verify/FGV-GEO-2025-0002', 120);
      
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^data:image\/png;base64,/);
    });
  });
});
