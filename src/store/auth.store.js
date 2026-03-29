import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('ticket_token') || null,
  initialized: false,

  setAuth: ({ user, token }) => {
    localStorage.setItem('ticket_token', token)
    set({ user, token, initialized: true })
  },

  setUser: (user) => set({ user, initialized: true }),

  setInitialized: () => set({ initialized: true }),

  logout: () => {
    localStorage.removeItem('ticket_token')
    set({ user: null, token: null, initialized: true })
  },
}))

export default useAuthStore
