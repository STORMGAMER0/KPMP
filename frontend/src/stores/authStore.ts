import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'MENTEE' | 'COORDINATOR';

export interface MenteeProfile {
  mentee_id: string;
  full_name: string;
  track: string;
  profile_pic_url: string | null;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  must_reset_password: boolean;
  mentee_profile?: MenteeProfile;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken) => {
        localStorage.setItem('access_token', accessToken);
        set({
          user,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearAuth: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set loading to false after rehydration completes
        state?.setLoading(false);
      },
    }
  )
);
