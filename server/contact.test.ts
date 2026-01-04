import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';

// Test contact form validation
describe('Contact Form', () => {
  const contactSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    subject: z.string().min(1, 'Assunto é obrigatório'),
    message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  });

  it('should validate valid contact form data', () => {
    const validData = {
      name: 'João Silva',
      email: 'joao@example.com',
      subject: 'access',
      message: 'Gostaria de solicitar acesso ao sistema de análise geopolítica.',
    };

    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const invalidData = {
      name: '',
      email: 'joao@example.com',
      subject: 'access',
      message: 'Gostaria de solicitar acesso ao sistema.',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      name: 'João Silva',
      email: 'invalid-email',
      subject: 'access',
      message: 'Gostaria de solicitar acesso ao sistema.',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject short message', () => {
    const invalidData = {
      name: 'João Silva',
      email: 'joao@example.com',
      subject: 'access',
      message: 'Curta',
    };

    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should map subject codes to labels correctly', () => {
    const subjectLabels: Record<string, string> = {
      'access': 'Solicitar Acesso ao Sistema',
      'support': 'Suporte Técnico',
      'partnership': 'Parcerias e Colaborações',
      'feedback': 'Feedback e Sugestões',
      'press': 'Imprensa e Comunicação',
      'other': 'Outro Assunto',
    };

    expect(subjectLabels['access']).toBe('Solicitar Acesso ao Sistema');
    expect(subjectLabels['support']).toBe('Suporte Técnico');
    expect(subjectLabels['partnership']).toBe('Parcerias e Colaborações');
    expect(subjectLabels['feedback']).toBe('Feedback e Sugestões');
    expect(subjectLabels['press']).toBe('Imprensa e Comunicação');
    expect(subjectLabels['other']).toBe('Outro Assunto');
  });
});
