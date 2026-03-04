// Utility functions for authentication

export const getAuthToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1] || null;
};

export const createAuthenticatedHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const createAuthenticatedHeadersForFormData = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Don't set Content-Type for FormData - browser sets it automatically as multipart/form-data
  return headers;
};
