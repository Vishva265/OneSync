import { create } from "zustand"
import type { User, AuthResponse } from "@/types"
import axios from "axios"

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  // Actions
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
  clearError: () => void
}

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000"

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,

  signUp: async (email, password, fullName) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/api/v1/auth/sign-up`, {
        email,
        password,
        fullName,
      })
      const { accessToken, user } = response.data
      localStorage.setItem("token", accessToken)
      set({ user, token: accessToken, isLoading: false })
    } catch (error: any) {
      const message = error.response?.data?.message || "Signup failed"
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/api/v1/auth/sign-in`, {
        email,
        password,
      })
      const { accessToken, user } = response.data
      localStorage.setItem("token", accessToken)
      set({ user, token: accessToken, isLoading: false })
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed"
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    set({ user: null, token: null })
  },

  checkAuth: () => {
    const token = localStorage.getItem("token")
    if (token) {
      set({ token })
    }
  },

  clearError: () => set({ error: null }),
}))
