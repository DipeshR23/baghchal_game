import { create } from 'zustand';

export type BoardTheme = 'wood' | 'modern-dark';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

interface UIState {
  theme: 'dark' | 'light';
  boardTheme: BoardTheme;
  soundsEnabled: boolean;
  toasts: Toast[];
  rulesModalOpen: boolean;
  settingsModalOpen: boolean;
  
  toggleTheme: () => void;
  setBoardTheme: (theme: BoardTheme) => void;
  toggleSounds: () => void;
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  setRulesModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  boardTheme: 'wood',
  soundsEnabled: true,
  toasts: [],
  rulesModalOpen: false,
  settingsModalOpen: false,

  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  
  setBoardTheme: (boardTheme) => set({ boardTheme }),
  
  toggleSounds: () => set((state) => ({ soundsEnabled: !state.soundsEnabled })),
  
  addToast: (message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
    
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),
  
  setRulesModalOpen: (rulesModalOpen) => set({ rulesModalOpen }),
  
  setSettingsModalOpen: (settingsModalOpen) => set({ settingsModalOpen }),
}));
