import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/ui/AuthModal'

interface User {
  username: string
  email?: string
  userId?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  hasCompletedAssessment: boolean
  completeAssessment: () => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string) => Promise<void>
  registerVerify: (email: string, password: string, full_name: string, otp: string) => Promise<void>
  logout: () => void
  openAuthModal: (redirectUrl?: string) => void
  closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>()
  const navigate = useNavigate()
  const apiBaseUrl = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://127.0.0.1:8000'

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('vishwas_auth')
    const storedUser = sessionStorage.getItem('vishwas_user')

    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth) as { user?: User }
        if (parsedAuth.user) {
          setUser(parsedAuth.user)
          if (parsedAuth.user.userId) {
            setHasCompletedAssessment(sessionStorage.getItem('assessment_completed_' + parsedAuth.user.userId) === 'true')
          }
          return
        }
      } catch {
        sessionStorage.removeItem('vishwas_auth')
      }
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)
        if (parsed.userId) {
          setHasCompletedAssessment(sessionStorage.getItem('assessment_completed_' + parsed.userId) === 'true')
        }
      } catch {
        sessionStorage.removeItem('vishwas_user')
      }
    }
  }, [])

  const completeAuth = (nextUser: User, accessToken: string, userId: string, hasCompletedFromLogin?: boolean) => {
    const authState = {
      access_token: accessToken,
      user_id: userId,
      user: nextUser,
    }
    setUser(nextUser)
    
    if (hasCompletedFromLogin) {
      sessionStorage.setItem('assessment_completed_' + userId, 'true')
      setHasCompletedAssessment(true)
    } else {
      setHasCompletedAssessment(sessionStorage.getItem('assessment_completed_' + userId) === 'true')
    }
    sessionStorage.setItem('vishwas_auth', JSON.stringify(authState))
    sessionStorage.setItem('vishwas_user', JSON.stringify(nextUser))
    sessionStorage.setItem('vishwas_access_token', accessToken)
    sessionStorage.setItem('vishwas_user_id', userId)
    setIsModalOpen(false)
    if (redirectUrl) {
      navigate(redirectUrl)
      setRedirectUrl(undefined)
    } else {
      if (hasCompletedFromLogin) {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json().catch(() => ({})) as { access_token?: string; user_id?: string; detail?: string; full_name?: string; has_completed_assessment?: boolean }

    if (!response.ok) {
      throw new Error(data.detail || 'Unable to log in')
    }

    if (!data.access_token || !data.user_id) {
      throw new Error('Invalid login response from server')
    }

    const username = data.full_name || email.split('@')[0] || email
    completeAuth({ username, email, userId: data.user_id }, data.access_token, data.user_id, data.has_completed_assessment)
  }

  const register = async (email: string, password: string, full_name: string) => {
    const response = await fetch(`${apiBaseUrl}/auth/register-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    })

    const data = await response.json().catch(() => ({})) as { message?: string; detail?: string }

    if (!response.ok) {
      throw new Error(data.detail || 'Unable to request OTP')
    }
  }

  const registerVerify = async (email: string, password: string, full_name: string, otp: string) => {
    const response = await fetch(`${apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name, otp }),
    })

    const data = await response.json().catch(() => ({})) as { user_id?: string; email?: string; message?: string; detail?: string }

    if (!response.ok) {
      throw new Error(data.detail || 'Invalid OTP')
    }

    if (!data.user_id) {
      throw new Error('Invalid registration response from server')
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('vishwas_auth')
    sessionStorage.removeItem('vishwas_user')
    sessionStorage.removeItem('vishwas_access_token')
    sessionStorage.removeItem('vishwas_user_id')
  }

  const openAuthModal = (url?: string) => {
    setRedirectUrl(url)
    setIsModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsModalOpen(false)
    setRedirectUrl(undefined)
  }

  const completeAssessment = () => {
    if (user?.userId) {
      sessionStorage.setItem('assessment_completed_' + user.userId, 'true')
      setHasCompletedAssessment(true)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      hasCompletedAssessment,
      completeAssessment,
      login,
      register,
      registerVerify,
      logout,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
      <AuthModal isOpen={isModalOpen} onClose={closeAuthModal} />
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
