import { create } from 'zustand';

interface AuthState {
  userId: string | null;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  isLoading: boolean;
  setUser: (user: { userId: string; email: string; fullName: string | null; avatarUrl: string | null }) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  fullName: null,
  avatarUrl: null,
  isLoading: true,
  setUser: (user) => set({ ...user, isLoading: false }),
  clearUser: () => set({ userId: null, email: null, fullName: null, avatarUrl: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
