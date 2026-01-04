import { callDataApi } from "../_core/dataApi";

export interface WebSearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
}

export interface WebSearchParams {
  query: string;
  numResults?: number;
  language?: string;
}

/**
 * Busca na web usando DuckDuckGo (via scraping)
 */
async function searchDuckDuckGo(params: WebSearchParams): Promise<WebSearchResult[]> {
  try {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(params.query)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': params.language || 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.error('DuckDuckGo search failed:', response.status);
      return [];
    }

    const html = await response.text();
    const results: WebSearchResult[] = [];
    
    // Parse HTML results usando regex simples
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]*)<\/a>/gi;
    let match;
    let index = 0;
    
    while ((match = resultRegex.exec(html)) !== null && index < (params.numResults || 10)) {
      const url = match[1];
      const title = match[2].trim();
      const snippet = match[3].trim();
      
      if (url && title) {
        results.push({
          id: `ddg-${index}-${Date.now()}`,
          title: decodeHTMLEntities(title),
          url: url.startsWith('//') ? `https:${url}` : url,
          snippet: decodeHTMLEntities(snippet),
          source: extractDomain(url),
        });
        index++;
      }
    }

    // Fallback: tentar outro padrão de parsing
    if (results.length === 0) {
      const altRegex = /<div[^>]*class="[^"]*result[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<span[^>]*>([^<]*)<\/span>/gi;
      
      while ((match = altRegex.exec(html)) !== null && index < (params.numResults || 10)) {
        const url = match[1];
        const title = match[2].trim();
        const snippet = match[3].trim();
        
        if (url && title && !url.includes('duckduckgo.com')) {
          results.push({
            id: `ddg-${index}-${Date.now()}`,
            title: decodeHTMLEntities(title),
            url: url,
            snippet: decodeHTMLEntities(snippet),
            source: extractDomain(url),
          });
          index++;
        }
      }
    }

    return results;
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
}

/**
 * Busca usando Google Custom Search via Data API (se disponível)
 */
async function searchGoogleCustom(params: WebSearchParams): Promise<WebSearchResult[]> {
  try {
    const result = await callDataApi("Google/customsearch", {
      query: {
        q: params.query,
        num: params.numResults || 10,
        lr: params.language ? `lang_${params.language}` : 'lang_pt',
      },
    }) as any;

    if (!result?.items) {
      return [];
    }

    return result.items.map((item: any, index: number) => ({
      id: `google-${index}-${Date.now()}`,
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: extractDomain(item.link),
      publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'],
    }));
  } catch (error) {
    console.error('Google Custom Search error:', error);
    return [];
  }
}

/**
 * Busca principal - tenta múltiplas fontes
 */
export async function searchWeb(params: WebSearchParams): Promise<WebSearchResult[]> {
  // Primeiro tenta Google Custom Search
  let results = await searchGoogleCustom(params);
  
  // Se não houver resultados, usa DuckDuckGo
  if (results.length === 0) {
    results = await searchDuckDuckGo(params);
  }
  
  // Se ainda não houver resultados, retorna dados simulados para desenvolvimento
  if (results.length === 0) {
    return getMockSearchResults(params.query);
  }
  
  return results;
}

/**
 * Extrai conteúdo de uma página web
 */
export async function fetchWebContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}:`, response.status);
      return '';
    }

    const html = await response.text();
    
    // Extrair texto principal removendo scripts, styles e tags
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Decodificar entidades HTML
    text = decodeHTMLEntities(text);
    
    // Limitar tamanho
    return text.substring(0, 15000);
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    return '';
  }
}

/**
 * Busca e extrai conteúdo de múltiplas páginas
 */
export async function searchAndFetchContent(params: WebSearchParams): Promise<{
  results: WebSearchResult[];
  contents: { url: string; content: string }[];
}> {
  const results = await searchWeb(params);
  
  // Buscar conteúdo das primeiras 5 páginas em paralelo
  const topResults = results.slice(0, 5);
  const contentPromises = topResults.map(async (result) => {
    const content = await fetchWebContent(result.url);
    return { url: result.url, content };
  });
  
  const contents = await Promise.all(contentPromises);
  
  return {
    results,
    contents: contents.filter(c => c.content.length > 0),
  };
}

// ============ Utility Functions ============

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'web';
  }
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
}

function getMockSearchResults(query: string): WebSearchResult[] {
  return [
    {
      id: 'mock-web-1',
      title: `${query} - Análise Geopolítica Internacional`,
      url: 'https://example.com/geopolitics/analysis',
      snippet: `Uma análise detalhada sobre ${query} e suas implicações para o cenário geopolítico global. Especialistas discutem tendências e perspectivas.`,
      source: 'example.com',
    },
    {
      id: 'mock-web-2',
      title: `Perspectivas sobre ${query} no contexto atual`,
      url: 'https://example.com/international/perspectives',
      snippet: `Entenda como ${query} está moldando as relações internacionais e quais são os principais atores envolvidos neste cenário.`,
      source: 'example.com',
    },
    {
      id: 'mock-web-3',
      title: `${query}: Impactos Estratégicos e Econômicos`,
      url: 'https://example.com/strategy/impacts',
      snippet: `Análise dos impactos estratégicos e econômicos de ${query} para as principais potências mundiais e blocos regionais.`,
      source: 'example.com',
    },
  ];
}
