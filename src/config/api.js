// Centralized API Base URL Configuration for Development & Vercel Production
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_API_BASE_URL !== undefined) {
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
