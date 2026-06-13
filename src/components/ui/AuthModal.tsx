import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Mail, User, Shield } from 'lucide-react'
import GlassCard from './GlassCard'

interface Props {
  isOpen: boolean
  onClose: () => void
  onLogin: (username: string) => void
}

export default function AuthModal({ isOpen, onClose, onLogin }: Props) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Please enter both email and password.')
        return
      }
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setIsLoading(true)
    // Simulate network request
    await new Promise(r => setTimeout(r, 1000))
    setIsLoading(false)
    
    // In a real app we'd validate against a backend
    onLogin(isLogin ? formData.email.split('@')[0] : formData.name)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(10, 14, 23, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            style={{ width: '100%', maxWidth: 440, position: 'relative' }}
          >
            <GlassCard style={{ padding: 32 }}>
              <button 
                onClick={onClose}
                style={{ position: 'absolute', top: 20, right: 20, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(0,229,199,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Shield color="#00E5C7" size={24} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.5rem', marginBottom: 8 }}>
                  {isLogin ? 'Welcome Back' : 'Create an Account'}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                  {isLogin 
                    ? 'Log in to securely access your financial identity.' 
                    : 'Join Vishwas AI to start building your credit score.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {!isLogin && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Rajesh Kumar"
                        style={{
                          width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                          padding: '12px 16px 12px 44px', borderRadius: 8, color: '#fff', fontSize: '0.95rem'
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Email or Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={isLogin ? 'Enter your email or phone' : 'e.g. rajesh@example.com'}
                      style={{
                        width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '12px 16px 12px 44px', borderRadius: 8, color: '#fff', fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      style={{
                        width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '12px 16px 12px 44px', borderRadius: 8, color: '#fff', fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                      <input 
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        style={{
                          width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                          padding: '12px 16px 12px 44px', borderRadius: 8, color: '#fff', fontSize: '0.95rem'
                        }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div style={{ color: '#E5484D', fontSize: '0.85rem', textAlign: 'center', marginTop: 4 }}>{error}</div>
                )}

                <button 
                  type="submit"
                  className="btn-primary" 
                  disabled={isLoading}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8, opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={toggleMode}
                  style={{ color: '#00E5C7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
