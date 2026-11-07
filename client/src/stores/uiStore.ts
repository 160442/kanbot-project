import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'kanbot_theme'

function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    /* ignore */
  }
  return 'light'
}

function applyDomTheme(mode: ThemeMode) {
  try {
    document.documentElement.setAttribute('data-theme', mode)
    document.documentElement.style.colorScheme = mode
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

interface UiState {
  aiDrawerOpen: boolean
  currentProjectId: string | null
  themeMode: ThemeMode
  setAiDrawerOpen: (open: boolean) => void
  setCurrentProjectId: (id: string | null) => void
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  aiDrawerOpen: false,
  currentProjectId: null,
  themeMode: typeof window !== 'undefined' ? readStoredMode() : 'light',
  setAiDrawerOpen: (open) => set({ aiDrawerOpen: open }),
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setThemeMode: (mode) => {
    applyDomTheme(mode)
    set({ themeMode: mode })
  },
  toggleTheme: () => {
    const next: ThemeMode = get().themeMode === 'light' ? 'dark' : 'light'
    applyDomTheme(next)
    set({ themeMode: next })
  },
}))

/** Call once on boot before paint when possible */
export function bootstrapTheme() {
  const mode = readStoredMode()
  applyDomTheme(mode)
  return mode
}
