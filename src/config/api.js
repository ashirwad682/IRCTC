// Centralized API Base URL Configuration for Development & Vercel Production
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== '') {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // In production (e.g. Vercel deployment), relative URL '/api' points to the same domain's serverless functions
  if (import.meta.env.PROD) {
    return '';
  }
  // In local development, fallback to local Express server port or relative URL if proxied by Vite
  return 'http://localhost:5001';
};

export const API_BASE_URL = getApiBaseUrl();

// Safely parse JSON from fetch Response (handles HTML/error pages gracefully without SyntaxError)
export const safeJsonParse = async (response) => {
  if (!response) return { success: false, message: 'No response received' };
  try {
    const contentType = response.headers ? (response.headers.get('content-type') || '') : '';
    const text = await response.text();
    if (!text || text.trim() === '') {
      return { success: false, message: 'Empty response' };
    }
    if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
      return JSON.parse(text);
    }
    return { success: false, message: text || `HTTP ${response.status} ${response.statusText}` };
  } catch (err) {
    return { success: false, message: err.message || 'JSON Parse Error' };
  }
};
