import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Product API
export const productAPI = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data.data.products;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get(`/products/${slug}`);
    return response.data.data;
  },
};

// Price API
export const priceAPI = {
  calculate: async (quoteData: any) => {
    const response = await api.post('/price/quote', quoteData);
    return response.data.data;
  },
};

// Order API
export const orderAPI = {
  create: async (orderData: any) => {
    const response = await api.post('/orders/create', orderData);
    return response.data.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  capturePayment: async (orderId: string, paymentIntentId: string) => {
    const response = await api.post(`/orders/${orderId}/capture-payment`, {
      payment_intent_id: paymentIntentId,
    });
    return response.data.data;
  },
};

// Upload API
export const uploadAPI = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/uploads/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.asset;
  },
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('auth_token', token);
    return { token, user };
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data.data.user;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },
};

export default api;
