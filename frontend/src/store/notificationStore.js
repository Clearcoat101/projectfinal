import { create } from 'zustand';
import api from '../utils/api';

export const useNotificationStore = create((set) => ({
  notifications: [],
  loading: false,
  error: null,
  
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/notifications');
      set({ notifications: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch notifications', loading: false });
    }
  },
  
  markAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set(state => ({
        notifications: state.notifications.map(n => 
          n._id === id ? { ...n, read: true } : n
        )
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }
}));