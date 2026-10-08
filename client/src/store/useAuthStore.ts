import { create } from 'zustand';
import { Address, LoginDto, RegisterDto, User } from '@ecommerce/shared';
import { authApi } from '../api/services';

interface AuthState {
  user: (User & { addresses?: Address[] }) | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('aura_token'),
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  login: async (dto) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(dto);
      localStorage.setItem('aura_token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isAdmin: data.user.role === 'ADMIN',
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (dto) => {
    set({ isLoading: true });
    try {
      const data = await authApi.register(dto);
      localStorage.setItem('aura_token', data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isAdmin: data.user.role === 'ADMIN',
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('aura_token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    }
  },

  fetchMe: async () => {
    const token = localStorage.getItem('aura_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const user = await authApi.getMe();
      set({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
        isLoading: false,
      });
    } catch (err) {
      localStorage.removeItem('aura_token');
      set({ user: null, token: null, isAuthenticated: false, isAdmin: false, isLoading: false });
    }
  },

  updateUser: (updated) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updated } });
    }
  },
}));
