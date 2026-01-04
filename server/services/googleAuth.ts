import jwt from 'jsonwebtoken';

interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * Get Google Cloud Service Account credentials from environment
 */
export function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!jsonStr) {
    console.warn('[GoogleAuth] GOOGLE_SERVICE_ACCOUNT_JSON não configurada');
    return null;
  }
  
  try {
    return JSON.parse(jsonStr) as ServiceAccountCredentials;
  } catch (error) {
    console.error('[GoogleAuth] Erro ao parsear credenciais:', error);
    return null;
  }
}

/**
 * Generate a JWT token for Google Cloud authentication
 */
function generateJWT(credentials: ServiceAccountCredentials, scope: string): string {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour
  
  const payload = {
    iss: credentials.client_email,
    sub: credentials.client_email,
    aud: credentials.token_uri,
    iat: now,
    exp: expiry,
    scope: scope,
  };
  
  // Ensure private key has proper line breaks (JSON escapes \n as literal string)
  const privateKey = credentials.private_key.replace(/\\n/g, '\n');
  
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

/**
 * Exchange JWT for an OAuth2 access token
 */
async function exchangeJWTForAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const scope = 'https://www.googleapis.com/auth/cloud-platform';
  const jwtToken = generateJWT(credentials, scope);
  
  const response = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwtToken,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Get a valid access token (cached or refreshed)
 */
export async function getAccessToken(): Promise<string> {
  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    throw new Error('Google Service Account credentials not configured');
  }
  
  // Check if we have a valid cached token (with 5 minute buffer)
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 300000) {
    return cachedAccessToken.token;
  }
  
  // Get a new token
  console.log('[GoogleAuth] Obtendo novo access token...');
  const token = await exchangeJWTForAccessToken(credentials);
  
  // Cache the token (expires in 1 hour)
  cachedAccessToken = {
    token,
    expiresAt: now + 3600000, // 1 hour in milliseconds
  };
  
  console.log('[GoogleAuth] Access token obtido com sucesso');
  return token;
}

/**
 * Get the project ID from credentials
 */
export function getProjectId(): string | null {
  const credentials = getServiceAccountCredentials();
  return credentials?.project_id || null;
}

/**
 * Check if Google Cloud authentication is configured
 */
export function isGoogleAuthConfigured(): boolean {
  return getServiceAccountCredentials() !== null;
}
