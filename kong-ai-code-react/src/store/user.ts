import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginUserVO } from '@/types/api';

interface UserState {
  loginUser: LoginUserVO | null;
  setLoginUser: (user: LoginUserVO | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      loginUser: null,
      setLoginUser: (user) => set({ loginUser: user }),
      logout: () => {
        set({ loginUser: null });
        localStorage.removeItem('token');
      },
    }),
    {
      name: 'user-storage',
    }
  )
);
