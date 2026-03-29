import { create } from 'zustand'

const stored = localStorage.getItem('ticket_theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const initialDark = stored ? stored === 'dark' : prefersDark

if (initialDark) document.documentElement.classList.add('dark')

const useThemeStore = create((set) => ({
  dark: initialDark,
  toggle: () => set((s) => {
    const next = !s.dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('ticket_theme', next ? 'dark' : 'light')
    return { dark: next }
  }),
}))

export default useThemeStore
