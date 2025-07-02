import { create } from 'zustand';
import api from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/auth/login', credentials);
      const user = response.data.user;
      set({ user, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/auth/register', userData);
      const user = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role
      };
      set({ user, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ user: null, loading: false, error: null });
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
    }
  },

  clearError: () => set({ error: null })
}));

updateProfile: async (updateData) => {
  try {
    set({ loading: true, error: null });
    const response = await api.put('/users/me', updateData);
    set({ user: { ...get().user, ...response.data }, loading: false });
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || 'Profile update failed';
    set({ error: message, loading: false });
    return { success: false, error: message };
  }
}