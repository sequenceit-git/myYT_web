const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

export const getAuthToken = (): string | null => {
  return localStorage.getItem('myyt_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('myyt_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('myyt_token');
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBase}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }

    const text = await res.text();
    return { success: false, error: text || `HTTP ${res.status} ${res.statusText}` };
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
};

