import * as SecureStore from 'expo-secure-store';

const getApiUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL || 'https://wknsite-backend.onrender.com/api';
};

export const apiClient = {
  async get(endpoint: string, params?: Record<string, string>) {
    return this.request(endpoint, 'GET', null, params);
  },

  async post(endpoint: string, body?: any) {
    return this.request(endpoint, 'POST', body);
  },

  async put(endpoint: string, body?: any) {
    return this.request(endpoint, 'PUT', body);
  },

  async patch(endpoint: string, body?: any) {
    return this.request(endpoint, 'PATCH', body);
  },

  async delete(endpoint: string) {
    return this.request(endpoint, 'DELETE');
  },

  async request(endpoint: string, method: string, body?: any, params?: Record<string, string>) {
    const token = await SecureStore.getItemAsync('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let url = `${getApiUrl()}${endpoint}`;
    
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responseData?.detail || responseData?.message || 'Terjadi kesalahan pada server');
      }

      return responseData;
    } catch (error: any) {
      console.error(`API Error [${method} ${endpoint}]:`, error.message);
      throw error;
    }
  }
};
