import { create } from 'zustand';
import api from '../utils/api';

export const useRequestStore = create((set) => ({
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,

  fetchRequests: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/requests');
      set({ requests: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch requests', loading: false });
    }
  },

  fetchRequestById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/requests/${id}`);
      set({ currentRequest: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch request', loading: false });
    }
  },

  createRequest: async (requestData) => {
    try {
      set({ loading: true, error: null });
      const response = await api.post('/requests', requestData);
      const newRequest = response.data;
      set(state => ({ 
        requests: [newRequest, ...state.requests], 
        loading: false 
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create request';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  approveRequest: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put(`/requests/${id}/approve`);
      const updatedRequest = response.data.request;
      
      set(state => ({
        requests: state.requests.map(req => 
          req._id === id ? updatedRequest : req
        ),
        currentRequest: state.currentRequest?._id === id ? updatedRequest : state.currentRequest,
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve request';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  rejectRequest: async (id, reason) => {
    try {
      set({ loading: true, error: null });
      const response = await api.put(`/requests/${id}/reject`, { reason });
      const updatedRequest = response.data.request;
      
      set(state => ({
        requests: state.requests.map(req => 
          req._id === id ? updatedRequest : req
        ),
        currentRequest: state.currentRequest?._id === id ? updatedRequest : state.currentRequest,
        loading: false
      }));
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject request';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  clearError: () => set({ error: null })
}));