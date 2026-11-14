import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserRecord } from '../../../types/models'

interface AuthContextType {
  user: UserRecord | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Check local storage for persistent session
    const savedUser = localStorage.getItem('pts_current_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (err) {
        localStorage.removeItem('pts_current_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    if (!window.api?.auth) {
      throw new Error('بيئة Electron غير متصلة')
    }
    const loggedUser = await window.api.auth.login({ username, password })
    setUser(loggedUser)
    localStorage.setItem('pts_current_user', JSON.stringify(loggedUser))
  }

  const logout = async () => {
    if (user && window.api?.auth) {
      try {
        await window.api.auth.logout(user.id)
      } catch (e) {
        console.error(e)
      }
    }
    setUser(null)
    localStorage.removeItem('pts_current_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
