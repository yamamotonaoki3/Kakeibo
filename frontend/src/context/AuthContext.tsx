import { createContext } from 'react'

export type AuthContextType = {
  user: { id: number; username: string; displayName: string } | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)
