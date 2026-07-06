import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuth = create(
  persist(
    (set) => ({
      session: null,
      login: (session) => set({ session }),
      logout: () => set({ session: null }),
    }),
    { name: 'rione-shanghai-auth' }
  )
)
