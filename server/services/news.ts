const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2';
const GDELT_API_URL = 'https://api.gdeltproject.org/api/v2';

export interface NewsArticle {
  id: string;
  source: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  content: string;
  imageUrl?: string;
}

export interface NewsSearchParams {
  query: string;
  language?: string;
  from?: string;
  to?: string;
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  pageSize?: number;
  page?: number;
}

// ============ NewsAPI Integration ============

export async function searchNewsAPI(params: NewsSearchParams): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    console.warn('NEWS_API_KEY não configurada, usando dados simulados');
    return getMockNewsData(params.query);
  }

  const searchParams = new URLSearchParams({
    q: params.query,
    language: params.language || 'pt',
    sortBy: params.sortBy || 'relevancy',
    pageSize: String(params.pageSize || 10),
    page: String(params.page || 1),
    apiKey: NEWS_API_KEY,
  });

  if (params.from) searchParams.append('from', params.from);
  if (params.to) searchParams.append('to', params.to);

  try {
    const response = await fetch(`${NEWS_API_URL}/everything?${searchParams}`);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('NewsAPI error:', error);
      return getMockNewsData(params.query);
    }

    const data = await response.json();
    
    return data.articles.map((article: any, index: number) => ({
      id: `newsapi-${index}-${Date.now()}`,
      source: article.source?.name || 'NewsAPI',
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
      content: article.content || article.description,
      imageUrl: article.urlToImage,
    }));
  } catch (error) {
    console.error('NewsAPI fetch error:', error);
    return getMockNewsData(params.query);
  }
}

// ============ GDELT Integration ============

export async function searchGDELT(params: NewsSearchParams): Promise<NewsArticle[]> {
  const searchParams = new URLSearchParams({
    query: params.query,
    mode: 'ArtList',
    maxrecords: String(params.pageSize || 10),
    format: 'json',
  });

  if (params.from) {
    // GDELT uses YYYYMMDDHHMMSS format
    const fromDate = params.from.replace(/-/g, '').replace(/:/g, '').replace('T', '').substring(0, 14);
    searchParams.append('startdatetime', fromDate);
  }

  try {
    const response = await fetch(`${GDELT_API_URL}/doc/doc?${searchParams}`);
    
    if (!response.ok) {
      console.error('GDELT API error:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!data.articles) return [];

    return data.articles.map((article: any, index: number) => ({
      id: `gdelt-${index}-${Date.now()}`,
      source: article.domain || 'GDELT',
      title: article.title,
      description: article.seendate ? `Publicado em ${article.seendate}` : '',
      url: article.url,
      publishedAt: article.seendate || new Date().toISOString(),
      content: article.title, // GDELT doesn't provide full content
      imageUrl: article.socialimage,
    }));
  } catch (error) {
    console.error('GDELT fetch error:', error);
    return [];
  }
}

// ============ Combined Search ============

export async function searchAllNews(params: NewsSearchParams): Promise<{
  newsapi: NewsArticle[];
  gdelt: NewsArticle[];
}> {
  const [newsapiResults, gdeltResults] = await Promise.all([
    searchNewsAPI(params),
    searchGDELT(params),
  ]);

  return {
    newsapi: newsapiResults,
    gdelt: gdeltResults,
  };
}

// ============ Fetch Article Content ============

export async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GeopoliticalAnalyst/1.0)',
      },
    });

    if (!response.ok) {
      return '';
    }

    const html = await response.text();
    
    // Basic HTML to text extraction
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Return first 10000 characters
    return textContent.substring(0, 10000);
  } catch (error) {
    console.error('Error fetching article content:', error);
    return '';
  }
}

// ============ Mock Data for Development ============

function getMockNewsData(query: string): NewsArticle[] {
  return [
    {
      id: 'mock-1',
      source: 'Exemplo News',
      title: `Análise: ${query} e suas implicações geopolíticas`,
      description: `Uma análise detalhada sobre ${query} e como isso afeta o cenário internacional.`,
      url: 'https://example.com/article1',
      publishedAt: new Date().toISOString(),
      content: `Este é um artigo de exemplo sobre ${query}. O conteúdo completo estaria disponível com uma chave de API válida do NewsAPI.`,
    },
    {
      id: 'mock-2',
      source: 'Global Times',
      title: `Perspectivas sobre ${query}`,
      description: `Especialistas discutem as tendências relacionadas a ${query}.`,
      url: 'https://example.com/article2',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      content: `Análise especializada sobre ${query} com múltiplas perspectivas internacionais.`,
    },
  ];
}
