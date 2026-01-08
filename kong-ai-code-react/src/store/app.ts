import { create } from 'zustand';
import type { AppVO } from '@/types/api';

interface AppState {
  currentApp: AppVO | null;
  setCurrentApp: (app: AppVO | null) => void;
  apps: AppVO[];
  setApps: (apps: AppVO[]) => void;
  addApp: (app: AppVO) => void;
  updateApp: (app: AppVO) => void;
  removeApp: (appId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentApp: null,
  setCurrentApp: (app) => set({ currentApp: app }),
  apps: [],
  setApps: (apps) => set({ apps }),
  addApp: (app) => set((state) => ({ apps: [...state.apps, app] })),
  updateApp: (updatedApp) => set((state) => ({
    apps: state.apps.map(app => app.id === updatedApp.id ? updatedApp : app)
  })),
  removeApp: (appId) => set((state) => ({
    apps: state.apps.filter(app => app.id !== appId)
  })),
}));
