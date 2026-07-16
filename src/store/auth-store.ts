'use client';

import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  fetchMe: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',

  async fetchMe() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        set({ user: null, status: 'anonymous' });
        return;
      }
      const data = (await res.json()) as { user: AuthUser | null };
      set({
        user: data.user,
        status: data.user ? 'authenticated' : 'anonymous',
      });
    } catch {
      set({ user: null, status: 'anonymous' });
    }
  },

  setUser(user) {
    set({ user, status: user ? 'authenticated' : 'anonymous' });
  },

  async logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    set({ user: null, status: 'anonymous' });
  },
}));
