import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('ticket_token') || null,

  setAuth: ({ user, token }) => {
    localStorage.setItem('ticket_token', token)
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('ticket_token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore
