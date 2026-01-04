import { storagePut } from '../storage';
import { nanoid } from 'nanoid';

export interface ProcessedFile {
  fileKey: string;
  fileName: string;
  mimeType: string;
  url: string;
  extractedText: string;
}

export async function processUploadedFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  userId: number
): Promise<ProcessedFile> {
  // Generate unique file key
  const fileKey = `analyses/${userId}/${nanoid()}-${fileName}`;
  
  // Upload to S3
  const { url } = await storagePut(fileKey, fileBuffer, mimeType);
  
  // Extract text based on file type
  let extractedText = '';
  
  try {
    if (mimeType === 'text/plain') {
      extractedText = fileBuffer.toString('utf-8');
    } else if (mimeType === 'application/pdf') {
      extractedText = await extractTextFromPDF(fileBuffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await extractTextFromDOCX(fileBuffer);
    }
  } catch (error) {
    console.error(`Error extracting text from ${mimeType}:`, error);
    extractedText = `Erro ao extrair texto do arquivo. O arquivo foi salvo mas o conteúdo não pôde ser processado.`;
  }
  
  // Limit text length
  if (extractedText.length > 100000) {
    extractedText = extractedText.substring(0, 100000) + '\n\n[Texto truncado - arquivo muito grande]';
  }
  
  return {
    fileKey,
    fileName,
    mimeType,
    url,
    extractedText,
  };
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid ESM/CJS issues
    const pdfParse = await import('pdf-parse');
    const PDFParse = pdfParse.PDFParse;
    
    // Convert Buffer to Uint8Array for pdf-parse v2
    const uint8Array = new Uint8Array(buffer);
    
    // Create PDFParse instance with the data
    const pdfParser = new PDFParse({ data: uint8Array });
    
    // Get text from PDF
    const textResult = await pdfParser.getText();
    
    // Destroy parser to free resources
    await pdfParser.destroy();
    
    if (textResult.text && textResult.text.trim().length > 0) {
      // Clean up the extracted text
      const cleanedText = textResult.text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      console.log(`PDF extracted: ${textResult.pages?.length || 'unknown'} pages, ${cleanedText.length} characters`);
      return cleanedText;
    }
    
    return 'O PDF não contém texto extraível. Pode ser um PDF escaneado ou baseado em imagens.';
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    // Fallback: try simple text extraction for older/simpler PDFs
    try {
      const text = buffer.toString('utf-8');
      const matches = text.match(/\(([^)]+)\)/g);
      if (matches && matches.length > 10) {
        const extractedText = matches
          .map(m => m.slice(1, -1))
          .filter(t => t.length > 2 && !/^[0-9.]+$/.test(t))
          .join(' ');
        
        if (extractedText.length > 100) {
          console.log(`PDF fallback extraction: ${extractedText.length} characters`);
          return extractedText;
        }
      }
    } catch (fallbackError) {
      console.error('PDF fallback extraction error:', fallbackError);
    }
    
    return 'Erro ao extrair texto do PDF. Verifique se o arquivo não está corrompido ou protegido.';
  }
}

async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // DOCX is a ZIP file containing XML files
    // The main content is in word/document.xml
    
    // Find the PK signature (ZIP file)
    const pkIndex = buffer.indexOf(Buffer.from([0x50, 0x4B, 0x03, 0x04]));
    if (pkIndex === -1) {
      throw new Error('Invalid DOCX file - not a valid ZIP archive');
    }
    
    // Extract text from XML tags using regex
    const xmlContent = buffer.toString('utf-8');
    
    // Extract text from <w:t> tags (Word text elements)
    const textMatches = xmlContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatches && textMatches.length > 0) {
      const extractedText = textMatches
        .map(t => t.replace(/<[^>]+>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (extractedText.length > 50) {
        console.log(`DOCX extracted: ${extractedText.length} characters`);
        return extractedText;
      }
    }
    
    // Alternative: extract any readable text between XML tags
    const allText = xmlContent
      .replace(/<[^>]+>/g, ' ')
      .replace(/[^\x20-\x7E\xC0-\xFF\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (allText.length > 100) {
      // Filter out common XML/ZIP artifacts
      const cleanText = allText
        .split(' ')
        .filter(word => word.length > 1 && word.length < 50)
        .filter(word => !/^[0-9]+$/.test(word))
        .filter(word => !word.includes('xmlns'))
        .filter(word => !word.includes('http'))
        .join(' ');
      
      if (cleanText.length > 100) {
        return cleanText;
      }
    }
    
    return 'Não foi possível extrair texto do DOCX. O arquivo pode estar vazio ou em formato não suportado.';
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return 'Erro ao extrair texto do DOCX. Verifique se o arquivo não está corrompido.';
  }
}

export function getSupportedMimeTypes(): string[] {
  return [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
}

export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'text/plain': '.txt',
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  };
  return extensions[mimeType] || '';
}

export function validateFileType(mimeType: string): boolean {
  return getSupportedMimeTypes().includes(mimeType);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
