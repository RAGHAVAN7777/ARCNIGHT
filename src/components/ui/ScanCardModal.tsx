import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, CheckCircle, Shield, AlertTriangle } from 'lucide-react'
import jsQR from 'jsqr'
import GlassCard from './GlassCard'
import ProgressRing from './ProgressRing'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function ScanCardModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<'upload' | 'pin' | 'verifying' | 'result'>('upload')
  const [error, setError] = useState('')
  const [accessId, setAccessId] = useState('')
  const [pin, setPin] = useState('')

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep('upload')
      setError('')
      setAccessId('')
      setPin('')
    }
  }, [isOpen])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code) {
          setAccessId(code.data)
          setStep('pin')
        } else {
          setError("Could not read QR code, please upload a clearer image.")
        }
      }
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      setError("Failed to load image. Please try another file.")
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const handleVerify = async () => {
    if (pin.length !== 4) return
    setStep('verifying')
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500))
    
    // For demo: Accept any PIN and show Rajesh Kumar's data
    // In real app, we would POST /api/verify-card with accessId and pin
    if (pin === '0000') {
      // Just a secret fail case to show error state if needed
      setError("Invalid PIN or expired card.")
      setStep('pin')
      return
    }

    setStep('result')
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Shield color="#00E5C7" size={28} />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.4rem' }}>
                  Verify Access Card
                </h2>
              </div>

              {step === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                    Upload a scanned image of the applicant's access card to decode the encrypted ID.
                  </p>
                  
                  <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                    padding: '40px 20px',
                    border: '2px dashed rgba(0,229,199,0.2)',
                    borderRadius: 12,
                    background: 'rgba(0,229,199,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}>
                    <Upload size={32} color="#00E5C7" />
                    <span style={{ color: '#fff', fontWeight: 500 }}>Click to browse or drag image</span>
                    <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                  </label>

                  {error && (
                    <div style={{ padding: 12, background: 'rgba(229, 72, 77, 0.1)', border: '1px solid rgba(229, 72, 77, 0.2)', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <AlertTriangle size={16} color="#E5484D" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ color: '#E5484D', fontSize: '0.85rem' }}>{error}</span>
                    </div>
                  )}
                </div>
              )}

              {step === 'pin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(0,229,199,0.05)', borderRadius: 8, border: '1px solid rgba(0,229,199,0.1)' }}>
                    <CheckCircle size={20} color="#00E5C7" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>QR Code Decoded</div>
                      <div style={{ fontFamily: 'monospace', color: '#fff', fontSize: '0.85rem' }}>ID: {accessId.slice(0, 8)}...</div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                      Enter the 4-digit PIN provided by the applicant
                    </label>
                    <input 
                      type="password" 
                      maxLength={4}
                      value={pin}
                      onChange={e => {
                        setError('')
                        setPin(e.target.value.replace(/\D/g, ''))
                      }}
                      placeholder="••••"
                      style={{
                        width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                        padding: '16px', borderRadius: 8, color: '#fff', fontSize: '1.5rem', letterSpacing: 8,
                        fontFamily: 'monospace', textAlign: 'center'
                      }}
                    />
                  </div>

                  {error && (
                    <div style={{ color: '#E5484D', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>
                  )}

                  <button 
                    className="btn-primary" 
                    onClick={handleVerify}
                    disabled={pin.length !== 4}
                    style={{ width: '100%', justifyContent: 'center', opacity: pin.length === 4 ? 1 : 0.5 }}
                  >
                    Verify & Fetch Profile
                  </button>
                </div>
              )}

              {step === 'verifying' && (
                <div style={{ py: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,229,199,0.2)', borderTopColor: '#00E5C7', animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>Authenticating with secure vault...</p>
                </div>
              )}

              {step === 'result' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 24, background: 'rgba(0,229,199,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={24} color="#00E5C7" />
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: 4 }}>Access Granted</h3>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Subject: R***** K****</p>
                  </div>

                  <div style={{ width: '100%', padding: 24, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ProgressRing score={770} size={140} strokeWidth={8} sublabel="" />
                    <div style={{ marginTop: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Risk Category</div>
                      <div style={{ color: '#F5B82E', fontWeight: 600, fontSize: '1.1rem', marginTop: 4 }}>Established · Low Risk</div>
                    </div>
                  </div>

                  <button className="btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
                    Close
                  </button>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
