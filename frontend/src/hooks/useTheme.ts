import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

let currentTheme: Theme = (() => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme') as Theme | null
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
})()

// Apply initial theme class
if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', currentTheme === 'dark')
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Theme {
  return currentTheme
}

function toggle() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', currentTheme)
  document.documentElement.classList.toggle('dark', currentTheme === 'dark')
  listeners.forEach((l) => l())
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light' as Theme)
  return { theme, toggle, isDark: theme === 'dark' }
}
