import { describe, expect, it } from "vitest";
import { generateDocx, ReportData } from "./services/docxGenerator";

describe("DOCX Generator", () => {
  it("should generate a valid DOCX buffer", async () => {
    const reportData: ReportData = {
      title: "Análise Geopolítica de Teste",
      objective: "Testar a geração de documentos Word",
      context: "Este é um contexto de teste para validar a funcionalidade",
      analysts: ["Conselheiro A", "Conselheiro B"],
      sections: [
        {
          title: "Introdução",
          content: "Esta é a seção de introdução do relatório de teste.",
        },
        {
          title: "Análise Principal",
          content: "Esta é a análise principal com múltiplos parágrafos.\n\nSegundo parágrafo da análise.\n\n- Item de lista 1\n- Item de lista 2",
        },
        {
          title: "Conclusão",
          content: "Esta é a conclusão do relatório de teste.",
        },
      ],
      sources: [
        "Fonte 1: Documento oficial",
        "Fonte 2: Artigo de notícia",
        "Fonte 3: Relatório acadêmico",
      ],
      generatedAt: new Date(),
      estimatedCost: 0.15,
    };

    const buffer = await generateDocx(reportData);

    // Verify buffer is not empty
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);

    // Verify it's a valid DOCX file (starts with PK - ZIP signature)
    expect(buffer[0]).toBe(0x50); // 'P'
    expect(buffer[1]).toBe(0x4b); // 'K'
  });

  it("should handle empty sections", async () => {
    const reportData: ReportData = {
      title: "Relatório Mínimo",
      objective: "Objetivo mínimo",
      analysts: [],
      sections: [],
      sources: [],
      generatedAt: new Date(),
      estimatedCost: 0,
    };

    const buffer = await generateDocx(reportData);

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should handle special characters in content", async () => {
    const reportData: ReportData = {
      title: "Análise com Caracteres Especiais: áéíóú ç ñ",
      objective: "Testar caracteres: @#$%^&*()",
      context: "Contexto com 'aspas' e \"aspas duplas\"",
      analysts: ["Analista com Ç", "Analista com Ñ"],
      sections: [
        {
          title: "Seção com Acentos: Análise Geopolítica",
          content: "Conteúdo com caracteres especiais: € £ ¥ © ® ™",
        },
      ],
      sources: ["Fonte com URL: https://example.com/path?param=value&other=123"],
      generatedAt: new Date(),
      estimatedCost: 0.05,
    };

    const buffer = await generateDocx(reportData);

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should include all analysts in the document", async () => {
    const analysts = [
      "Conselheiro A",
      "Conselheiro B",
      "Conselheiro C",
      "Conselheiro D",
    ];

    const reportData: ReportData = {
      title: "Análise Multi-Agentes",
      objective: "Testar todos os analistas",
      analysts,
      sections: [
        {
          title: "Perspectivas Combinadas",
          content: "Análise combinando múltiplas perspectivas geopolíticas.",
        },
      ],
      sources: ["Fonte de teste"],
      generatedAt: new Date(),
      estimatedCost: 0.25,
    };

    const buffer = await generateDocx(reportData);

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("should handle long content", async () => {
    const longContent = Array(50)
      .fill("Este é um parágrafo de teste para verificar o comportamento com conteúdo longo.")
      .join("\n\n");

    const reportData: ReportData = {
      title: "Relatório Extenso",
      objective: "Testar conteúdo longo",
      analysts: ["Analista Teste"],
      sections: [
        {
          title: "Seção Extensa",
          content: longContent,
        },
      ],
      sources: ["Fonte de teste"],
      generatedAt: new Date(),
      estimatedCost: 0.10,
    };

    const buffer = await generateDocx(reportData);

    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000); // Should be larger due to content
  });
});
