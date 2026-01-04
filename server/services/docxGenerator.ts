import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ImageRun,
  ShadingType,
  convertInchesToTwip,
} from "docx";
import * as fs from "fs";
import * as path from "path";
import { generateQRCodeWithLogo } from './qrCodeWithLogo';

// Logo FGV em base64 (versão colorida)
const FGV_LOGO_BASE64 = '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';

// Cores FGV
const FGV_COLORS = {
  primary1: "002D4D",
  primary2: "003A79",
  accent1: "008BC9",
  accent2: "73BFE8",
  secondary1: "5C5B5F",
  secondary2: "88868B",
  secondary3: "AFAEB4",
  secondary4: "D7D9DD",
  white: "FFFFFF",
};

interface ReportSection {
  title: string;
  content: string;
}

interface ReportData {
  title: string;
  objective: string;
  context?: string;
  analysts: string[];
  sections: ReportSection[];
  sources: string[];
  generatedAt: Date;
  estimatedCost: number;
  sessionCode?: string; // Código único da sessão (ex: FGV-GEO-2025-0042)
  baseUrl?: string; // URL base para geração do QR Code de verificação
}

// Função para gerar QR Code com logo FGV como buffer PNG
async function generateQRCodeBuffer(url: string): Promise<Buffer | null> {
  return generateQRCodeWithLogo(url, 150);
}

/**
 * Gera um documento Word (DOCX) com identidade visual FGV
 */
export async function generateDocx(data: ReportData): Promise<Buffer> {
  // Gerar QR Code se houver sessionCode e baseUrl
  let qrCodeBuffer: Buffer | null = null;
  if (data.sessionCode && data.baseUrl) {
    const verificationUrl = `${data.baseUrl}/verify/${data.sessionCode}`;
    qrCodeBuffer = await generateQRCodeBuffer(verificationUrl);
  }
  
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri", // Fallback para Gotham (não disponível nativamente)
            size: 24, // 12pt
          },
        },
        heading1: {
          run: {
            font: "Calibri",
            size: 36, // 18pt
            bold: true,
            color: FGV_COLORS.primary2,
          },
          paragraph: {
            spacing: { before: 400, after: 200 },
          },
        },
        heading2: {
          run: {
            font: "Calibri",
            size: 28, // 14pt
            bold: true,
            color: FGV_COLORS.primary1,
          },
          paragraph: {
            spacing: { before: 300, after: 150 },
          },
        },
        heading3: {
          run: {
            font: "Calibri",
            size: 24, // 12pt
            bold: true,
            color: FGV_COLORS.accent1,
          },
          paragraph: {
            spacing: { before: 200, after: 100 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Conselho de Geopolítica da FGV",
                    font: "Calibri",
                    size: 20,
                    color: FGV_COLORS.secondary2,
                  }),
                  new TextRun({
                    text: "  |  ",
                    font: "Calibri",
                    size: 20,
                    color: FGV_COLORS.secondary3,
                  }),
                  new TextRun({
                    text: "Plataforma de Análise Geopolítica",
                    font: "Calibri",
                    size: 20,
                    color: FGV_COLORS.secondary2,
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
                border: {
                  bottom: {
                    color: FGV_COLORS.accent1,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "FGV - Fundação Getulio Vargas  |  ",
                    font: "Calibri",
                    size: 18,
                    color: FGV_COLORS.secondary2,
                  }),
                  new TextRun({
                    text: "Página ",
                    font: "Calibri",
                    size: 18,
                    color: FGV_COLORS.secondary2,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Calibri",
                    size: 18,
                    color: FGV_COLORS.secondary2,
                  }),
                  new TextRun({
                    text: " de ",
                    font: "Calibri",
                    size: 18,
                    color: FGV_COLORS.secondary2,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: "Calibri",
                    size: 18,
                    color: FGV_COLORS.secondary2,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                border: {
                  top: {
                    color: FGV_COLORS.accent1,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              }),
            ],
          }),
        },
        children: [
          // Logo FGV no topo
          new Paragraph({
            children: [
              new ImageRun({
                data: Buffer.from(FGV_LOGO_BASE64, 'base64'),
                transformation: {
                  width: 200,
                  height: 50,
                },
                type: 'png',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
          }),

          // Título do Relatório
          new Paragraph({
            children: [
              new TextRun({
                text: data.title,
                font: "Calibri",
                size: 48, // 24pt
                bold: true,
                color: FGV_COLORS.primary2,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
          }),

          // Subtítulo
          new Paragraph({
            children: [
              new TextRun({
                text: "Análise Geopolítica Multi-Perspectiva",
                font: "Calibri",
                size: 28,
                color: FGV_COLORS.accent1,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          // Código de Sessão (se disponível)
          ...(data.sessionCode ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: data.sessionCode,
                  font: "Calibri",
                  size: 24,
                  color: FGV_COLORS.primary1,
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
          ] : []),

          // Linha divisória
          new Paragraph({
            border: {
              bottom: {
                color: FGV_COLORS.accent1,
                space: 1,
                style: BorderStyle.SINGLE,
                size: 12,
              },
            },
            spacing: { after: 400 },
          }),

          // Informações do Relatório
          createInfoTable(data),

          // Espaçamento
          new Paragraph({ spacing: { after: 400 } }),

          // Objetivo
          new Paragraph({
            text: "Objetivo da Análise",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.objective,
                font: "Calibri",
                size: 24,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Contexto (se houver)
          ...(data.context
            ? [
                new Paragraph({
                  text: "Contexto",
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: data.context,
                      font: "Calibri",
                      size: 24,
                    }),
                  ],
                  spacing: { after: 300 },
                }),
              ]
            : []),

          // Equipe de Analistas
          new Paragraph({
            text: "Equipe de Analistas",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.analysts.join(", "),
                font: "Calibri",
                size: 24,
                italics: true,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Seções do Relatório
          ...data.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_1,
            }),
            ...parseContentToParagraphs(section.content),
          ]),

          // Fontes
          new Paragraph({
            text: "Fontes Consultadas",
            heading: HeadingLevel.HEADING_1,
          }),
          ...data.sources.map(
            (source, index) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${source}`,
                    font: "Calibri",
                    size: 22,
                    color: FGV_COLORS.secondary1,
                  }),
                ],
                spacing: { after: 100 },
              })
          ),

          // Rodapé com informações de geração
          new Paragraph({ spacing: { before: 600 } }),
          new Paragraph({
            border: {
              top: {
                color: FGV_COLORS.secondary3,
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Relatório gerado em ${formatDate(data.generatedAt)} pelo Conselho de Geopolítica da FGV`,
                font: "Calibri",
                size: 20,
                color: FGV_COLORS.secondary2,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Custo estimado da análise: $${data.estimatedCost.toFixed(4)}`,
                font: "Calibri",
                size: 20,
                color: FGV_COLORS.secondary2,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100 },
          }),
          
          // QR Code de verificação (se disponível)
          ...(qrCodeBuffer ? [
            new Paragraph({ spacing: { before: 400 } }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: qrCodeBuffer,
                  transformation: {
                    width: 100,
                    height: 100,
                  },
                  type: 'png',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Escaneie o QR Code para verificar a autenticidade deste documento",
                  font: "Calibri",
                  size: 16,
                  color: FGV_COLORS.secondary2,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 100 },
            }),
          ] : []),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

/**
 * Cria tabela de informações do relatório
 */
function createInfoTable(data: ReportData): Table {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Data de Geração:",
                    font: "Calibri",
                    size: 22,
                    bold: true,
                    color: FGV_COLORS.primary1,
                  }),
                ],
              }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: {
              type: ShadingType.CLEAR,
              fill: FGV_COLORS.secondary4,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: formatDate(data.generatedAt),
                    font: "Calibri",
                    size: 22,
                  }),
                ],
              }),
            ],
            width: { size: 70, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Analistas:",
                    font: "Calibri",
                    size: 22,
                    bold: true,
                    color: FGV_COLORS.primary1,
                  }),
                ],
              }),
            ],
            shading: {
              type: ShadingType.CLEAR,
              fill: FGV_COLORS.secondary4,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${data.analysts.length} especialistas`,
                    font: "Calibri",
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Fontes:",
                    font: "Calibri",
                    size: 22,
                    bold: true,
                    color: FGV_COLORS.primary1,
                  }),
                ],
              }),
            ],
            shading: {
              type: ShadingType.CLEAR,
              fill: FGV_COLORS.secondary4,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${data.sources.length} fontes consultadas`,
                    font: "Calibri",
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * Converte conteúdo de texto em parágrafos formatados
 * Suporta markdown com negrito (**texto**) e listas
 */
function parseContentToParagraphs(content: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = content.split("\n\n");

  for (const line of lines) {
    if (!line.trim()) continue;

    // Verifica se é uma linha horizontal (---)
    if (line.trim() === '---') {
      paragraphs.push(
        new Paragraph({
          border: {
            bottom: {
              color: FGV_COLORS.accent1,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 12,
            },
          },
          spacing: { before: 200, after: 200 },
        })
      );
      continue;
    }

    // Verifica se é um título principal (começa com #)
    if (line.startsWith("# ") && !line.startsWith("## ") && !line.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace("# ", ""),
          heading: HeadingLevel.HEADING_1,
        })
      );
    }
    // Verifica se é um subtítulo (começa com ##)
    else if (line.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace("## ", ""),
          heading: HeadingLevel.HEADING_2,
        })
      );
    }
    // Verifica se é um subtítulo de nível 3 (começa com ###)
    else if (line.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          text: line.replace("### ", ""),
          heading: HeadingLevel.HEADING_3,
        })
      );
    }
    // Verifica se é um item de lista
    else if (line.startsWith("- ") || line.startsWith("• ")) {
      // Processar texto com negrito na lista
      const listText = line.replace(/^[-•]\s*/, "");
      const textRuns = parseTextWithBold(listText);
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "• ",
              font: "Calibri",
              size: 24,
            }),
            ...textRuns,
          ],
          indent: { left: convertInchesToTwip(0.5) },
          spacing: { after: 100 },
        })
      );
    }
    // Parágrafo normal (com suporte a negrito)
    else {
      const textRuns = parseTextWithBold(line.trim());
      paragraphs.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  return paragraphs;
}

/**
 * Processa texto com marcação de negrito (**texto**)
 */
function parseTextWithBold(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Texto antes do negrito
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: text.substring(lastIndex, match.index),
          font: "Calibri",
          size: 24,
        })
      );
    }
    // Texto em negrito
    runs.push(
      new TextRun({
        text: match[1],
        font: "Calibri",
        size: 24,
        bold: true,
      })
    );
    lastIndex = regex.lastIndex;
  }

  // Texto restante após o último negrito
  if (lastIndex < text.length) {
    runs.push(
      new TextRun({
        text: text.substring(lastIndex),
        font: "Calibri",
        size: 24,
      })
    );
  }

  // Se não houver nenhum negrito, retornar o texto completo
  if (runs.length === 0) {
    runs.push(
      new TextRun({
        text: text,
        font: "Calibri",
        size: 24,
      })
    );
  }

  return runs;
}

/**
 * Formata data para exibição
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export type { ReportData, ReportSection };
