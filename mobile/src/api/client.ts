import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSession, CreditCard, CardRecommendation } from '../types';

// Update this to your backend URL
const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthSession> => {
    const { data } = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('authToken', data.session.access_token);
    return data;
  },

  register: async (email: string, password: string, fullName: string): Promise<AuthSession> => {
    const { data } = await api.post('/auth/register', { email, password, fullName });
    await AsyncStorage.setItem('authToken', data.session.access_token);
    return data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('authToken');
  },

  getToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('authToken');
  },
};

// Cards API
export const cardsAPI = {
  getAll: async (): Promise<CreditCard[]> => {
    const { data } = await api.get('/cards');
    return data.cards;
  },

  add: async (card: Partial<CreditCard>): Promise<CreditCard> => {
    const { data } = await api.post('/cards', card);
    return data.card;
  },

  update: async (id: string, updates: Partial<CreditCard>): Promise<CreditCard> => {
    const { data } = await api.put(`/cards/${id}`, updates);
    return data.card;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cards/${id}`);
  },

  getRecommendation: async (
    amount: number,
    merchant?: string,
    category?: string
  ): Promise<CardRecommendation> => {
    const { data } = await api.post('/cards/quick-recommend', {
      amount,
      merchant,
      category,
    });
    return data;
  },
};

export default api;
