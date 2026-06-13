import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/ui/AuthModal'

interface User {
  username: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string) => void
  logout: () => void
  openAuthModal: (redirectUrl?: string) => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>()
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('vishwas_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (username: string) => {
    const newUser = { username }
    setUser(newUser)
    localStorage.setItem('vishwas_user', JSON.stringify(newUser))
    setIsModalOpen(false)
    if (redirectUrl) {
      navigate(redirectUrl)
      setRedirectUrl(undefined)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('vishwas_user')
  }

  const openAuthModal = (url?: string) => {
    setRedirectUrl(url)
    setIsModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsModalOpen(false)
    setRedirectUrl(undefined)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
      <AuthModal isOpen={isModalOpen} onClose={closeAuthModal} onLogin={login} />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
