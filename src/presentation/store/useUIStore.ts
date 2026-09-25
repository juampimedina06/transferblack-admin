import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  isSidebarCollapsed: boolean;
  toggleTheme: () => void;
  toggleSidebarCollapsed: () => void;
  setTheme: (theme: Theme) => void;
}

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  // Default to dark as requested by dashboard reference
  return 'dark';
};

const getInitialCollapsed = (): boolean => {
  const saved = localStorage.getItem('sidebar_collapsed');
  return saved ? JSON.parse(saved) : false;
};

const applyThemeToDOM = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

// Apply on load
const initialTheme = getInitialTheme();
applyThemeToDOM(initialTheme);

export const useUIStore = create<UIState>((set) => ({
  theme: initialTheme,
  isSidebarCollapsed: getInitialCollapsed(),

  toggleTheme: () => {
    set((state) => {
      const nextTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', nextTheme);
      applyThemeToDOM(nextTheme);
      return { theme: nextTheme };
    });
  },

  setTheme: (theme: Theme) => {
    localStorage.setItem('theme', theme);
    applyThemeToDOM(theme);
    set({ theme });
  },

  toggleSidebarCollapsed: () => {
    set((state) => {
      const nextCollapsed = !state.isSidebarCollapsed;
      localStorage.setItem('sidebar_collapsed', JSON.stringify(nextCollapsed));
      return { isSidebarCollapsed: nextCollapsed };
    });
  },
}));
