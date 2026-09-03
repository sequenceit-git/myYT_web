const API_BASE = 'http://localhost:5000/api';

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

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error' };
  }
};
