import { create } from 'zustand';
import api from '../utils/api';

export const useResourceStore = create((set) => ({
  resources: [],
  loading: false,
  error: null,

  fetchResources: async (category = '') => {
    try {
      set({ loading: true, error: null });
      const url = category ? `/resources?category=${category}` : '/resources';
      const response = await api.get(url);
      set({ resources: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch resources', loading: false });
    }
  },

  createResource: async (resourceData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/resources', resourceData);
      const newResource = response.data;
      set(state => ({ 
        resources: [...state.resources, newResource], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create resource';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  checkAvailability: async (resourceId, startTime, endTime, quantity = 1) => {
    try {
      const params = new URLSearchParams({
        resourceId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        quantity: quantity.toString()
      });
      
      const response = await api.get(`/resources/check-availability?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check availability');
    }
  },

  clearError: () => set({ error: null })
}));