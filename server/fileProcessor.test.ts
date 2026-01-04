import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processUploadedFile, validateFileType, getSupportedMimeTypes, formatFileSize } from './services/fileProcessor';

// Mock storage
vi.mock('./storage', () => ({
  storagePut: vi.fn().mockResolvedValue({ url: 'https://example.com/test-file.pdf' }),
}));

describe('File Processor', () => {
  describe('validateFileType', () => {
    it('should accept PDF files', () => {
      expect(validateFileType('application/pdf')).toBe(true);
    });

    it('should accept TXT files', () => {
      expect(validateFileType('text/plain')).toBe(true);
    });

    it('should accept DOCX files', () => {
      expect(validateFileType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
    });

    it('should reject unsupported file types', () => {
      expect(validateFileType('image/png')).toBe(false);
      expect(validateFileType('application/json')).toBe(false);
      expect(validateFileType('video/mp4')).toBe(false);
    });
  });

  describe('getSupportedMimeTypes', () => {
    it('should return array of supported mime types', () => {
      const types = getSupportedMimeTypes();
      expect(types).toContain('text/plain');
      expect(types).toContain('application/pdf');
      expect(types).toContain('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(types.length).toBe(3);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });
  });

  describe('processUploadedFile', () => {
    it('should process TXT files correctly', async () => {
      const textContent = 'Este é um arquivo de texto para teste.';
      const buffer = Buffer.from(textContent, 'utf-8');
      
      const result = await processUploadedFile(buffer, 'test.txt', 'text/plain', 1);
      
      expect(result.fileName).toBe('test.txt');
      expect(result.mimeType).toBe('text/plain');
      expect(result.extractedText).toBe(textContent);
      expect(result.url).toBeDefined();
      expect(result.fileKey).toContain('analyses/1/');
    });

    it('should handle PDF files', async () => {
      // Create a minimal PDF buffer (this won't have extractable text but should not crash)
      const pdfHeader = Buffer.from('%PDF-1.4\n', 'utf-8');
      
      const result = await processUploadedFile(pdfHeader, 'test.pdf', 'application/pdf', 1);
      
      expect(result.fileName).toBe('test.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.extractedText).toBeDefined();
      expect(result.url).toBeDefined();
    }, 15000);

    it('should truncate very long text', async () => {
      const longText = 'A'.repeat(150000);
      const buffer = Buffer.from(longText, 'utf-8');
      
      const result = await processUploadedFile(buffer, 'long.txt', 'text/plain', 1);
      
      expect(result.extractedText.length).toBeLessThanOrEqual(100050); // 100000 + truncation message
      expect(result.extractedText).toContain('[Texto truncado');
    });
  });
});
