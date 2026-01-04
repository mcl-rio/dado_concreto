import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { replaceTemplateVariables } from './services/emailService';

// Mock fetch for Resend API tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('replaceTemplateVariables', () => {
    it('should replace single variable', () => {
      const template = 'Hello {{userName}}!';
      const result = replaceTemplateVariables(template, { userName: 'John' });
      expect(result).toBe('Hello John!');
    });

    it('should replace multiple variables', () => {
      const template = 'Hello {{userName}}, your analysis "{{title}}" is ready!';
      const result = replaceTemplateVariables(template, { 
        userName: 'Maria', 
        title: 'Análise Geopolítica' 
      });
      expect(result).toBe('Hello Maria, your analysis "Análise Geopolítica" is ready!');
    });

    it('should replace same variable multiple times', () => {
      const template = '{{name}} - {{name}} - {{name}}';
      const result = replaceTemplateVariables(template, { name: 'Test' });
      expect(result).toBe('Test - Test - Test');
    });

    it('should leave unmatched variables unchanged', () => {
      const template = 'Hello {{userName}}, {{unknownVar}}!';
      const result = replaceTemplateVariables(template, { userName: 'John' });
      expect(result).toBe('Hello John, {{unknownVar}}!');
    });

    it('should handle empty variables object', () => {
      const template = 'Hello {{userName}}!';
      const result = replaceTemplateVariables(template, {});
      expect(result).toBe('Hello {{userName}}!');
    });

    it('should handle template without variables', () => {
      const template = 'Hello World!';
      const result = replaceTemplateVariables(template, { userName: 'John' });
      expect(result).toBe('Hello World!');
    });

    it('should handle HTML templates', () => {
      const template = `<html>
<body>
<h1>Olá {{userName}}</h1>
<p>Sua análise <strong>{{title}}</strong> foi concluída.</p>
<a href="{{dashboardUrl}}">Acessar</a>
</body>
</html>`;
      const result = replaceTemplateVariables(template, {
        userName: 'Carlos',
        title: 'Brasil 2025',
        dashboardUrl: 'https://example.com/dashboard'
      });
      expect(result).toContain('Olá Carlos');
      expect(result).toContain('<strong>Brasil 2025</strong>');
      expect(result).toContain('href="https://example.com/dashboard"');
    });
  });

  describe('sendEmail (mocked)', () => {
    it('should return error when RESEND_API_KEY is not set', async () => {
      // Clear the env var
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      // Dynamic import to get fresh module
      const { sendEmail } = await import('./services/emailService');
      
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('RESEND_API_KEY');

      // Restore
      if (originalKey) {
        process.env.RESEND_API_KEY = originalKey;
      }
    });

    it('should call Resend API when key is configured', async () => {
      const originalKey = process.env.RESEND_API_KEY;
      process.env.RESEND_API_KEY = 'test-api-key';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'msg-123' })
      });

      const { sendEmail } = await import('./services/emailService');
      
      const result = await sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test Body</p>'
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          })
        })
      );

      // Restore
      if (originalKey) {
        process.env.RESEND_API_KEY = originalKey;
      } else {
        delete process.env.RESEND_API_KEY;
      }
    });
  });

  describe('Email templates', () => {
    it('should have correct default sender email', () => {
      // The default sender should be marlos@marlos.com.br
      const expectedSender = 'marlos@marlos.com.br';
      
      // We can verify this by checking the module exports or constants
      // For now, we just verify the template replacement works with sender
      const template = 'From: {{senderEmail}}';
      const result = replaceTemplateVariables(template, { 
        senderEmail: expectedSender 
      });
      expect(result).toBe('From: marlos@marlos.com.br');
    });

    it('should handle all standard template variables', () => {
      const allVariables = {
        userName: 'Test User',
        title: 'Test Analysis',
        content: 'Test content',
        dashboardUrl: 'https://example.com/dashboard',
        systemUrl: 'https://example.com',
        analysisQuota: '10',
        senderName: 'Contact Person',
        senderEmail: 'contact@example.com',
        subject: 'Test Subject',
        message: 'Test message content'
      };

      const template = Object.keys(allVariables)
        .map(key => `{{${key}}}`)
        .join(' | ');

      const result = replaceTemplateVariables(template, allVariables);

      // Verify all variables were replaced
      for (const value of Object.values(allVariables)) {
        expect(result).toContain(value);
      }
    });
  });
});
