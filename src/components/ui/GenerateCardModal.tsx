import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Download, Shield, Key } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { toPng } from 'html-to-image'
import GlassCard from './GlassCard'

interface Props {
  isOpen: boolean
  onClose: () => void
  userName: string
  score: number
  level: string
}

const consents = [
  "I confirm this data is accurate",
  "I authorize sharing my score via QR code",
  "I understand this card is valid for 1 year",
  "I consent to PIN-based access verification",
  "I agree to Vishwas AI's data usage terms"
]

export default function GenerateCardModal({ isOpen, onClose, userName, score, level }: Props) {
  const [checked, setChecked] = useState<boolean[]>(new Array(5).fill(false))
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step, setStep] = useState<'form' | 'generating' | 'success'>('form')
  const [accessId, setAccessId] = useState('')
  const [otpStep, setOtpStep] = useState<'none' | 'request' | 'verify'>('none')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  
  const cardRef = useRef<HTMLDivElement>(null)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setChecked(new Array(5).fill(false))
      setPin('')
      setConfirmPin('')
      setStep('form')
      setAccessId('')
      setOtpStep('none')
      setOtp('')
      setOtpError('')

      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      const token = sessionStorage.getItem('vishwas_access_token')
      fetch(`${apiBaseUrl}/cards/status`, {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      })
      .then(r => r.json())
      .then(data => {
        if (data.has_card) setOtpStep('request')
      })
      .catch(console.error)
    }
  }, [isOpen])

  const handleToggle = (index: number) => {
    const newChecked = [...checked]
    newChecked[index] = !newChecked[index]
    setChecked(newChecked)
  }

  const allChecked = checked.every(Boolean)
  const isPinValid = pin.length === 4 && /^\d+$/.test(pin) && pin === confirmPin
  const canSubmit = allChecked && isPinValid

  const handleGenerate = async () => {
    setStep('generating')
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const token = sessionStorage.getItem('vishwas_access_token')

    try {
      const res = await fetch(`${apiBaseUrl}/cards/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ user_name: userName, score, level, pin })
      })
      if (!res.ok) throw new Error('Failed to generate card')
      const data = await res.json()
      setAccessId(data.card_id)
      setStep('success')
    } catch (err) {
      console.error(err)
      setStep('form')
    }
  }

  const handleRequestOtp = async () => {
    setOtpStep('verify')
    setOtpError('')
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const token = sessionStorage.getItem('vishwas_access_token')
    try {
      await fetch(`${apiBaseUrl}/cards/request-otp`, {
        method: 'POST',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) return
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const token = sessionStorage.getItem('vishwas_access_token')
    try {
      const res = await fetch(`${apiBaseUrl}/cards/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ otp })
      })
      if (!res.ok) throw new Error('Invalid OTP')
      setOtpStep('none')
      setOtpError('')
    } catch (err) {
      setOtpError('Invalid OTP. Please try again.')
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 })
      const link = document.createElement('a')
      link.download = `Vishwas_Access_Card_${userName.replace(' ', '_')}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate image', err)
    }
  }

  // Masked name "Rajesh Kumar" -> "R***** K****"
  const maskedName = userName.split(' ').map(part => part[0] + '*'.repeat(part.length - 1)).join(' ')
  const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

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
            style={{
              width: '100%', maxWidth: 500,
              position: 'relative',
            }}
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
                  Secure Access Card Setup
                </h2>
              </div>

              {otpStep === 'request' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
                  <Shield size={48} color="#F5B82E" style={{ margin: '0 auto' }} />
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Active Card Found</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                    You already have an active access card. To regenerate it, we need to verify your identity via email OTP.
                  </p>
                  <button className="btn-primary" onClick={handleRequestOtp} style={{ justifyContent: 'center' }}>
                    Send OTP to Email
                  </button>
                </div>
              )}

              {otpStep === 'verify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Verify OTP</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                    Enter the 6-digit code sent to your email.
                  </p>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    style={{
                      width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                      padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1.5rem', letterSpacing: 8,
                      fontFamily: 'monospace', textAlign: 'center'
                    }}
                  />
                  {otpError && <div style={{ color: '#E5484D', fontSize: '0.85rem' }}>{otpError}</div>}
                  <button className="btn-primary" onClick={handleVerifyOtp} disabled={otp.length !== 6} style={{ justifyContent: 'center', opacity: otp.length === 6 ? 1 : 0.5 }}>
                    Verify & Regenerate
                  </button>
                </div>
              )}

              {otpStep === 'none' && step === 'form' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {consents.map((text, i) => (
                      <label key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 4,
                          border: `2px solid ${checked[i] ? '#00E5C7' : 'rgba(255,255,255,0.2)'}`,
                          background: checked[i] ? '#00E5C7' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {checked[i] && <Check size={14} color="#0A0E17" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" hidden checked={checked[i]} onChange={() => handleToggle(i)} />
                        {text}
                      </label>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>4-Digit PIN</label>
                      <input 
                        type="password" 
                        maxLength={4}
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        style={{
                          width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                          padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1.2rem', letterSpacing: 4,
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>Confirm PIN</label>
                      <input 
                        type="password" 
                        maxLength={4}
                        value={confirmPin}
                        onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        style={{
                          width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                          padding: '12px 16px', borderRadius: 8, color: '#fff', fontSize: '1.2rem', letterSpacing: 4,
                          fontFamily: 'monospace'
                        }}
                      />
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={handleGenerate}
                    disabled={!canSubmit}
                    style={{ width: '100%', justifyContent: 'center', opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
                  >
                    Generate Access Card
                  </button>
                </div>
              )}

              {step === 'generating' && (
                <div style={{ padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(0,229,199,0.2)', borderTopColor: '#00E5C7', animation: 'spin 1s linear infinite' }} />
                  <p style={{ color: 'var(--color-text-secondary)' }}>Encrypting access payload...</p>
                </div>
              )}

              {step === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
                  
                  {/* The actual Card to be screenshotted */}
                  <div 
                    ref={cardRef}
                    style={{
                      width: 400, height: 240,
                      background: 'linear-gradient(135deg, #0F1420 0%, #0A0E17 100%)',
                      borderRadius: 16,
                      border: '1px solid rgba(0, 229, 199, 0.3)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,229,199,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      padding: 24,
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                    }}
                  >
                    {/* Background decorations */}
                    <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: '#00E5C7', filter: 'blur(80px)', opacity: 0.15 }} />
                    <div style={{ position: 'absolute', bottom: -50, left: -50, width: 150, height: 150, background: '#F5B82E', filter: 'blur(80px)', opacity: 0.1 }} />
                    
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #00E5C7' }} />
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#fff', letterSpacing: 1 }}>VISHWAS AI</span>
                        </div>
                        <div style={{ color: '#00E5C7', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                          Verified Financial Identity
                        </div>
                      </div>
                      <div style={{ background: '#fff', padding: 4, borderRadius: 8, border: '2px solid rgba(0,229,199,0.5)' }}>
                        <QRCodeSVG 
                          value={accessId}
                          size={56}
                          bgColor="#ffffff"
                          fgColor="#0A0E17"
                          level="M"
                          includeMargin={false}
                        />
                      </div>
                    </div>

                    {/* Middle: Masked Name & Score */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Subject</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: '#fff', letterSpacing: 2 }}>{maskedName}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 }}>Resilience Score</div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.8rem', color: '#00E5C7', lineHeight: 1 }}>{score}</div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, position: 'relative', zIndex: 2 }}>
                      <div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>STATUS</div>
                        <div style={{ fontSize: '0.75rem', color: '#F5B82E', fontWeight: 600 }}>{level}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>ISSUED</div>
                        <div style={{ fontSize: '0.75rem', color: '#fff' }}>{issueDate}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>VALID UNTIL</div>
                        <div style={{ fontSize: '0.75rem', color: '#fff' }}>{expiryDate}</div>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                    Your access card is ready. Present this QR code and your PIN to authorized underwriters.
                  </p>

                  <button className="btn-primary" onClick={handleDownload} style={{ width: '100%', justifyContent: 'center' }}>
                    <Download size={18} />
                    Download Access Card
                  </button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
