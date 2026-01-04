import { storagePut } from '../storage';
import { nanoid } from 'nanoid';
import { generateQRCodeWithLogoBase64 } from './qrCodeWithLogo';

// FGV Brand Colors
const FGV_BLUE = '#003366';
const FGV_YELLOW = '#FFB81C';

// Logo FGV Diretoria Internacional em base64 (versão branca para fundo escuro)
const FGV_LOGO_WHITE_BASE64 = 'data:image/png;base64,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';

export interface ReportConfig {
  title: string;
  subtitle?: string;
  author?: string;
  date: string;
  content: string;
  structure: any;
  format: 'pdf' | 'docx';
  userSources?: { title: string; url?: string; type: string }[]; // Fontes fornecidas pelo usuário
  sessionCode?: string; // Código único da sessão (ex: FGV-GEO-2025-0042)
  baseUrl?: string; // URL base para geração do QR Code de verificação
}

// Função para gerar QR Code com logo FGV como base64
async function generateQRCodeBase64(url: string): Promise<string> {
  return generateQRCodeWithLogoBase64(url, 120);
}

export async function generateReport(config: ReportConfig, userId: number): Promise<{ url: string; fileKey: string }> {
  const html = await generateReportHTML(config);
  
  const fileKey = `reports/${userId}/${nanoid()}-${config.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  
  // Store HTML version
  const { url } = await storagePut(fileKey, Buffer.from(html, 'utf-8'), 'text/html');
  
  return { url, fileKey };
}

async function generateReportHTML(config: ReportConfig): Promise<string> {
  const { title, subtitle, author, date, content, structure, userSources, sessionCode, baseUrl } = config;
  
  // Gerar QR Code se houver sessionCode e baseUrl
  let qrCodeBase64 = '';
  if (sessionCode && baseUrl) {
    const verificationUrl = `${baseUrl}/verify/${sessionCode}`;
    qrCodeBase64 = await generateQRCodeBase64(verificationUrl);
  }
  
  // Convert markdown-like content to HTML
  const htmlContent = convertMarkdownToHTML(content);
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm 3.5cm 3cm; /* Margem inferior aumentada para evitar sobreposição com rodapé */
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Montserrat', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      background: white;
    }
    
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      page-break-after: always;
      background: linear-gradient(135deg, ${FGV_BLUE} 0%, #004080 100%);
      color: white;
      padding: 3cm;
    }
    
    .cover-logo {
      width: 150px;
      height: auto;
      margin-bottom: 2cm;
    }
    
    .cover-title {
      font-size: 28pt;
      font-weight: 700;
      margin-bottom: 1cm;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .cover-subtitle {
      font-size: 16pt;
      font-weight: 400;
      margin-bottom: 2cm;
      opacity: 0.9;
    }
    
    .cover-divider {
      width: 100px;
      height: 4px;
      background: ${FGV_YELLOW};
      margin: 1cm 0;
    }
    
    .cover-meta {
      font-size: 12pt;
      margin-top: 2cm;
    }
    
    .cover-meta p {
      margin: 0.3cm 0;
    }
    
    .content-page {
      padding: 1cm 0 2cm 0; /* Padding inferior aumentado para evitar sobreposição com rodapé */
    }
    
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 1.5cm;
      background: ${FGV_BLUE};
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2cm;
      font-size: 9pt;
    }
    
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1.2cm;
      border-top: 2px solid ${FGV_YELLOW};
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2cm;
      font-size: 8pt;
      color: #666;
      background: white;
    }
    
    .footer-left {
      text-align: left;
    }
    
    .footer-center {
      text-align: center;
    }
    
    .footer-right {
      text-align: right;
    }
    
    .references-section {
      page-break-before: always;
      margin-top: 2cm;
    }
    
    .references-section h1 {
      margin-bottom: 1cm;
    }
    
    .reference-item {
      margin: 0.5cm 0;
      padding-left: 1.5cm;
      text-indent: -1.5cm;
      text-align: left;
    }
    
    h1 {
      font-size: 18pt;
      font-weight: 700;
      color: ${FGV_BLUE};
      margin: 1.5cm 0 0.5cm 0;
      padding-bottom: 0.3cm;
      border-bottom: 3px solid ${FGV_YELLOW};
    }
    
    h2 {
      font-size: 14pt;
      font-weight: 600;
      color: ${FGV_BLUE};
      margin: 1cm 0 0.4cm 0;
    }
    
    h3 {
      font-size: 12pt;
      font-weight: 600;
      color: #444;
      margin: 0.8cm 0 0.3cm 0;
    }
    
    p {
      margin: 0.4cm 0;
      text-align: justify;
    }
    
    ul, ol {
      margin: 0.4cm 0 0.4cm 1cm;
    }
    
    li {
      margin: 0.2cm 0;
    }
    
    blockquote {
      margin: 0.5cm 0;
      padding: 0.5cm 1cm;
      background: #f5f5f5;
      border-left: 4px solid ${FGV_YELLOW};
      font-style: italic;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5cm 0;
    }
    
    th {
      background: ${FGV_BLUE};
      color: white;
      padding: 0.3cm;
      text-align: left;
      font-weight: 600;
    }
    
    td {
      padding: 0.3cm;
      border-bottom: 1px solid #ddd;
    }
    
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    
    .executive-summary {
      background: linear-gradient(to right, ${FGV_BLUE}10, transparent);
      padding: 1cm;
      margin: 1cm 0;
      border-left: 4px solid ${FGV_BLUE};
    }
    
    .executive-summary h2 {
      margin-top: 0;
    }
    
    .toc {
      page-break-after: always;
    }
    
    .toc h1 {
      text-align: center;
      border-bottom: none;
    }
    
    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 0.2cm 0;
      border-bottom: 1px dotted #ccc;
    }
    
    .toc-item.level-1 {
      font-weight: 600;
      margin-top: 0.3cm;
    }
    
    .toc-item.level-2 {
      padding-left: 1cm;
    }
    
    .highlight {
      background: ${FGV_YELLOW}30;
      padding: 0.1cm 0.2cm;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    @media print {
      .cover-page {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .header, .footer {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover-page">
    <img src="${FGV_LOGO_WHITE_BASE64}" alt="FGV Diretoria Internacional" class="cover-logo" style="width: 200px; height: auto; margin-bottom: 1.5cm;" />
    <div class="cover-divider"></div>
    <h1 class="cover-title">${escapeHtml(title)}</h1>
    ${subtitle ? `<p class="cover-subtitle">${escapeHtml(subtitle)}</p>` : ''}
    <div class="cover-divider"></div>
    <div class="cover-meta">
      ${author ? `<p><strong>Autor:</strong> ${escapeHtml(author)}</p>` : ''}
      <p><strong>Data:</strong> ${escapeHtml(date)}</p>
      <p style="margin-top: 1cm; font-size: 10pt; opacity: 0.8;">Conselho de Geopolítica da FGV</p>
    </div>
  </div>
  
  <!-- Footer (appears on all pages) -->
  <div class="footer">
    <div class="footer-left">${sessionCode ? `<strong>${escapeHtml(sessionCode)}</strong> | ` : ''}Conselho IA de Geopolítica da FGV</div>
    <div class="footer-center">Texto gerado por Inteligência Artificial</div>
    <div class="footer-right">${escapeHtml(date)}</div>
  </div>
  
  <!-- Content -->
  <div class="content-page">
    ${htmlContent}
  </div>
  
  <!-- References Section - APA 7 Format -->
  <div class="references-section">
    <h1>Referências Bibliográficas</h1>
    <p style="margin-bottom: 1cm; font-style: italic; color: #666;">
      As referências abaixo seguem o formato APA 7ª edição (American Psychological Association, 2020).
    </p>
    ${generateReferencesSection(structure, userSources)}
  </div>
  
  <!-- Disclaimer with QR Code -->
  <div style="margin-top: 2cm; padding: 1cm; background: #f5f5f5; border-left: 4px solid ${FGV_YELLOW}; display: flex; gap: 1.5cm;">
    <div style="flex: 1;">
      ${sessionCode ? `<p style="font-size: 10pt; color: ${FGV_BLUE}; margin: 0 0 0.5cm 0; font-weight: bold;">
        Código de Sessão: ${escapeHtml(sessionCode)}
      </p>` : ''}
      <p style="font-size: 9pt; color: #666; margin: 0;">
        <strong>Aviso:</strong> Este documento foi gerado pelo Conselho IA de Geopolítica da FGV, 
        um sistema multiagente de inteligência artificial. As análises e conclusões apresentadas 
        refletem a síntese de múltiplas perspectivas teóricas e devem ser consideradas como 
        subsídio para tomada de decisão, não como verdade absoluta.
      </p>
      <p style="font-size: 9pt; color: #666; margin-top: 0.5cm;">
        <strong>Data de geração:</strong> ${escapeHtml(date)}
      </p>
    </div>
    ${qrCodeBase64 ? `
    <div style="flex-shrink: 0; text-align: center;">
      <img src="${qrCodeBase64}" alt="QR Code de Verificação" style="width: 100px; height: 100px;" />
      <p style="font-size: 7pt; color: #666; margin-top: 0.3cm; max-width: 100px;">
        Escaneie para verificar a autenticidade
      </p>
    </div>
    ` : ''}
  </div>
</body>
</html>`;
}

function convertMarkdownToHTML(markdown: string): string {
  // Remove linhas em branco no início do documento para evitar página em branco
  let html = markdown.trim();
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  
  // Numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  
  // Paragraphs
  html = html.replace(/^(?!<[hlubo])(.+)$/gm, '<p>$1</p>');
  
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  // Page breaks
  html = html.replace(/---/g, '<div class="page-break"></div>');
  
  return html;
}

function generateReferencesSection(structure: any, userSources?: { title: string; url?: string; type: string }[]): string {
  const references: string[] = [];
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  
  // Add user-provided sources first (documents, news, web pages)
  if (userSources && userSources.length > 0) {
    references.push('<p class="reference-item" style="font-weight: 600; margin-top: 0.5cm;"><em>Fontes fornecidas pelo usuário:</em></p>');
    userSources.forEach(source => {
      const sourceType = source.type === 'file' ? 'Documento' : 
                         source.type === 'news' ? 'Notícia' : 
                         source.type === 'web' ? 'Página web' : 'Fonte';
      if (source.url) {
        references.push(`<p class="reference-item">${escapeHtml(source.title)}. [${sourceType}]. Recuperado de ${escapeHtml(source.url)}</p>`);
      } else {
        references.push(`<p class="reference-item">${escapeHtml(source.title)}. [${sourceType}]. Documento fornecido pelo usuário.</p>`);
      }
    });
    references.push('<p class="reference-item" style="font-weight: 600; margin-top: 0.5cm;"><em>Referências teóricas:</em></p>');
  }
  
  // Add theoretical references based on analysts used
  // Referências são adicionadas dinamicamente com base nos conselheiros cadastrados
  const theoreticalRefs: { id: string; ref: string }[] = [];
  
  // Add all theoretical references
  theoreticalRefs.forEach(ref => {
    references.push(`<p class="reference-item">${ref.ref}</p>`);
  });
  
  // Add APA 7 reference for the methodology
  references.push(`<p class="reference-item">American Psychological Association. (2020). <em>Publication manual of the American Psychological Association</em> (7th ed.). https://doi.org/10.1037/0000165-000</p>`);
  
  // Add reference for the AI system
  references.push(`<p class="reference-item">Fundação Getulio Vargas. (${currentYear}). <em>Conselho IA de Geopolítica da FGV: Sistema multiagente de inteligência artificial para análise geopolítica</em>. Diretoria Internacional, FGV. Recuperado em ${currentDate}.</p>`);
  
  if (references.length === 0) {
    return '<p><em>Nenhuma referência bibliográfica disponível.</em></p>';
  }
  
  return references.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function generatePrintableHTML(config: ReportConfig): Promise<string> {
  return await generateReportHTML(config);
}
