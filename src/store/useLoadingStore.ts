import { create } from 'zustand';

interface LoadingState {
  isGlobalLoading: boolean;
  isAuthChecking: boolean;
  activeRequests: number;
  setGlobalLoading: (loading: boolean) => void;
  setAuthChecking: (checking: boolean) => void;
  startRequest: () => void;
  endRequest: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isGlobalLoading: true, // starts loading while app is booting
  isAuthChecking: true,
  activeRequests: 0,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),
  setAuthChecking: (checking) => set({ isAuthChecking: checking }),
  startRequest: () => set((state) => ({ 
    activeRequests: state.activeRequests + 1,
    isGlobalLoading: true 
  })),
  endRequest: () => set((state) => {
    const nextRequests = Math.max(0, state.activeRequests - 1);
    return {
      activeRequests: nextRequests,
      isGlobalLoading: nextRequests > 0
    };
  }),
}));
