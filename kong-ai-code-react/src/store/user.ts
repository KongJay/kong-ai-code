// store/index.ts 或 store/user.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginUserVO } from '@/types/api';

interface UserState {
  loginUser: LoginUserVO | null;
  isLoading: boolean; // 新增：加载状态
  setLoginUser: (user: LoginUserVO | null) => void;
  logout: () => void;
  // 新增：手动设置加载状态的方法（可选）
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      loginUser: null,
      isLoading: true, // 初始为加载中状态
      setLoginUser: (user) => set({ 
        loginUser: user, 
        isLoading: false // 设置用户后，标记为已加载
      }),
      logout: () => {
        set({ 
          loginUser: null,
          isLoading: false // 退出登录后也标记为已加载
        });
        localStorage.removeItem('token');
      },
      // 新增：可以手动设置加载状态
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'user-storage',
      onRehydrateStorage: () => (state) => {
        // 从 localStorage 恢复状态后，标记为已加载
        // 这个函数会在状态从存储中恢复后调用
        console.log('用户状态已从存储恢复');
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);