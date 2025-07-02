import { create } from 'zustand';
import api from '../utils/api';

export const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/users');
      set({ users: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch users', loading: false });
    }
  },
  
  updateUserRole: async (userId, role) => {
    set({ loading: true });
    try {
      await api.put(`/users/${userId}/role`, { role });
      set(state => ({
        users: state.users.map(user => 
          user._id === userId ? { ...user, role } : user
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update role', loading: false });
    }
  }
}));