import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Globe, Mic, Upload, FileText, Check } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'
import { useAuth } from '../context/AuthContext'

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
]

const chatMessages = [
  { role: 'ai', text: 'Namaste! I\'m Vishwas, your AI financial assistant. Let me help you build your Financial Resilience Score.' },
  { role: 'ai', text: 'What type of work do you do? For example — street vendor, auto driver, shop owner?' },
  { role: 'user', text: 'I run a small kirana shop in Jayanagar' },
  { role: 'ai', text: 'Great! How long have you been running your kirana shop?' },
  { role: 'user', text: 'About 8 years now' },
  { role: 'ai', text: 'Excellent consistency! What is your approximate daily income from the shop?' },
  { role: 'user', text: 'Around ₹600-800 on a normal day' },
  { role: 'ai', text: 'Do you save any amount regularly? Weekly or monthly?' },
  { role: 'user', text: 'I save about ₹500 every week in a box at home' },
  { role: 'ai', text: 'That shows great discipline! Last question — do you have any dependents? Family members who rely on your income?' },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

export default function AssessmentPage() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedLang, setSelectedLang] = useState('')
  const [chatIndex, setChatIndex] = useState(2)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const navigate = useNavigate()
  const { completeAssessment } = useAuth()

  const totalSteps = 3

  const next = () => {
    if (step < totalSteps - 1) {
      setDirection(1)
      setStep(step + 1)
    } else {
      completeAssessment()
      navigate('/dashboard')
    }
  }

  const isNextDisabled = () => {
    if (step === 0) return selectedLang === ''
    if (step === 1) return chatIndex < chatMessages.length
    if (step === 2) return uploadedFiles.length === 0
    return false
  }

  const prev = () => {
    if (step > 0) {
      setDirection(-1)
      setStep(step - 1)
    } else {
      navigate('/')
    }
  }

  const addMessage = () => {
    if (chatIndex < chatMessages.length) {
      setChatIndex(chatIndex + 1)
      setTimeout(() => {
        if (chatIndex + 1 < chatMessages.length) {
          setChatIndex(prev => Math.min(prev + 1, chatMessages.length))
        }
      }, 800)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    setUploadedFiles(prev => [...prev, ...files.map(f => f.name)])
  }

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      padding: '90px 24px 40px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Premium Background Orbs */}
      <div style={{
        position: 'fixed',
        top: '10%',
        left: '5%',
        width: '40vw',
        height: '40vw',
        background: 'radial-gradient(circle, rgba(0,229,199,0.04) 0%, transparent 60%)',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed',
        bottom: '5%',
        right: '5%',
        width: '35vw',
        height: '35vw',
        background: 'radial-gradient(circle, rgba(245,184,46,0.03) 0%, transparent 60%)',
        filter: 'blur(80px)',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Premium Stepped Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          {[0, 1, 2].map(idx => (
            <React.Fragment key={idx}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= idx ? 'rgba(0,229,199,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${step >= idx ? 'rgba(0,229,199,0.4)' : 'rgba(255,255,255,0.05)'}`,
                color: step >= idx ? '#00E5C7' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1rem',
                boxShadow: step === idx ? '0 0 30px rgba(0,229,199,0.2)' : 'none',
                transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                position: 'relative',
              }}>
                {step > idx ? <Check size={18} strokeWidth={3} /> : idx + 1}
                {/* Step labels */}
                <div style={{
                  position: 'absolute', top: 52, whiteSpace: 'nowrap',
                  fontSize: '0.75rem', fontWeight: 500,
                  color: step === idx ? '#fff' : 'var(--color-text-muted)',
                  transition: 'color 0.3s'
                }}>
                  {idx === 0 ? 'Language' : idx === 1 ? 'Interview' : 'Documents'}
                </div>
              </div>
              {idx < 2 && (
                <div style={{
                  flex: 1, maxWidth: 120, height: 2, margin: '0 16px',
                  background: step > idx ? 'rgba(0,229,199,0.4)' : 'rgba(255,255,255,0.05)',
                  transition: 'all 0.5s ease',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content Wrapper */}
        <div style={{ position: 'relative', overflowX: 'hidden', flex: 1 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step 0: Language Select */}
              {step === 0 && (
                <div style={{ padding: '0' }}>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h2 style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '1.8rem',
                      letterSpacing: '-0.02em',
                      marginBottom: 8,
                    }}>
                      Choose Your Language
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                      Vishwas AI speaks your language. Select one to begin the assessment.
                    </p>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16,
                  }}>
                    {languages.map(lang => (
                      <motion.div
                        key={lang.code}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedLang(lang.code)}
                        style={{
                          padding: '16px 16px',
                          cursor: 'pointer',
                          borderRadius: 16,
                          background: selectedLang === lang.code ? 'rgba(0,229,199,0.06)' : 'rgba(255,255,255,0.01)',
                          border: `1px solid ${selectedLang === lang.code ? 'rgba(0,229,199,0.4)' : 'rgba(255,255,255,0.05)'}`,
                          boxShadow: selectedLang === lang.code ? '0 0 30px rgba(0,229,199,0.1) inset' : 'none',
                          textAlign: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {selectedLang === lang.code && (
                          <div style={{
                            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                            width: '100%', height: '100%', background: 'radial-gradient(circle, rgba(0,229,199,0.1) 0%, transparent 70%)',
                            pointerEvents: 'none'
                          }} />
                        )}
                        <div style={{
                          fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '1.3rem',
                          marginBottom: 6, color: selectedLang === lang.code ? '#00E5C7' : '#fff',
                          transition: 'color 0.3s'
                        }}>
                          {lang.native}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {lang.label}
                        </div>
                        <AnimatePresence>
                          {selectedLang === lang.code && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              style={{
                                position: 'absolute', top: 16, right: 16,
                                width: 28, height: 28, borderRadius: '50%',
                                background: '#00E5C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 12px rgba(0,229,199,0.4)'
                              }}
                            >
                              <Check size={16} color="#0A0E17" strokeWidth={3} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Voice/Text Interview */}
              {step === 1 && (
                <div style={{ padding: '0' }}>
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <h2 style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '1.8rem',
                      letterSpacing: '-0.02em',
                      marginBottom: 8,
                    }}>
                      AI Interview
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                      A quick, conversational assessment to understand your financial habits.
                    </p>
                  </div>

                  <GlassCard style={{ 
                    height: 320, overflowY: 'auto', padding: '20px 16px', 
                    display: 'flex', flexDirection: 'column', gap: 12,
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    {chatMessages.slice(0, chatIndex).map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
                        style={{
                          alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                          maxWidth: '80%',
                          display: 'flex',
                          gap: 16,
                          alignItems: 'flex-end',
                          flexDirection: msg.role === 'ai' ? 'row' : 'row-reverse'
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', shrink: 0,
                          background: msg.role === 'ai' ? 'rgba(0,229,199,0.1)' : 'rgba(245,184,46,0.1)',
                          border: `1px solid ${msg.role === 'ai' ? 'rgba(0,229,199,0.3)' : 'rgba(245,184,46,0.3)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          {msg.role === 'ai' ? <Globe size={18} color="#00E5C7" /> : <div style={{width: 18, height:18, borderRadius:'50%', background:'#F5B82E'}}/>}
                        </div>
                        
                        <div style={{
                          padding: '12px 16px',
                          background: msg.role === 'ai' ? 'rgba(255,255,255,0.03)' : 'rgba(0,229,199,0.1)',
                          border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,229,199,0.2)',
                          borderRadius: msg.role === 'ai' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          color: msg.role === 'ai' ? '#E2E8F0' : '#fff',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </GlassCard>

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <button
                      onClick={addMessage}
                      disabled={chatIndex >= chatMessages.length}
                      className="btn-primary"
                      style={{ 
                        padding: '10px 24px', 
                        borderRadius: 24,
                        fontSize: '0.95rem',
                        opacity: chatIndex >= chatMessages.length ? 0.5 : 1,
                      }}
                    >
                      <Mic size={18} strokeWidth={2} />
                      {chatIndex >= chatMessages.length ? 'Interview Complete' : 'Continue Interview'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Document Upload */}
              {step === 2 && (
                <div style={{ padding: '0' }}>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <h2 style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '1.8rem',
                      letterSpacing: '-0.02em',
                      marginBottom: 8,
                    }}>
                      Upload Documents
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                      Securely upload passbooks or UPI screenshots to verify your financial history.
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.01, borderColor: 'rgba(0,229,199,0.5)', background: 'rgba(0,229,199,0.02)' }}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    style={{
                      marginBottom: 16,
                      padding: '30px 20px',
                      borderRadius: 20,
                      border: '2px dashed rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.01)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,229,199,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                      border: '1px solid rgba(0,229,199,0.2)',
                      boxShadow: '0 0 30px rgba(0,229,199,0.1)'
                    }}>
                      <Upload size={32} color="#00E5C7" strokeWidth={1.5} />
                    </div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 8 }}>Drag & Drop your files here</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                      Supports PDF, JPG, PNG (Max 10MB)
                    </p>
                    <div style={{ 
                      padding: '12px 28px', borderRadius: 30, 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '0.95rem', fontWeight: 500
                    }}>
                      Browse Files
                    </div>
                  </motion.div>

                  {uploadedFiles.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {uploadedFiles.map((file, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <GlassCard style={{
                            padding: '16px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            background: 'rgba(0,229,199,0.03)',
                            borderColor: 'rgba(0,229,199,0.2)',
                          }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,229,199,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={20} color="#00E5C7" />
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 500 }}>{file}</span>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, color: '#00E5C7', fontSize: '0.85rem' }}>
                              <Check size={18} /> Verified
                            </div>
                          </GlassCard>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 20, textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                      Demo Environment: Click buttons to simulate uploads
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {['UPI_History_Kumar.pdf', 'Passbook_Page_3.jpg', 'Ration_Card.pdf'].map(f => (
                        <button
                          key={f}
                          onClick={() => setUploadedFiles(prev => [...prev, f])}
                          className="btn-ghost"
                          style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: 20 }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium Navigation Dock */}
        <div style={{
          marginTop: 16,
          padding: '12px 20px',
          background: 'rgba(10, 14, 23, 0.6)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
        }}>
          <button
            onClick={prev}
            className="btn-ghost"
            style={{
              padding: '10px 20px',
              borderRadius: 24,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
            Back
          </button>
          
          <button
            onClick={next}
            disabled={isNextDisabled()}
            className="btn-primary"
            style={{
              padding: '10px 24px',
              borderRadius: 24,
              fontSize: '0.95rem',
              opacity: isNextDisabled() ? 0.4 : 1,
              pointerEvents: isNextDisabled() ? 'none' : 'auto',
              boxShadow: isNextDisabled() ? 'none' : '0 6px 20px rgba(0,229,199,0.25)',
            }}
          >
            {step === totalSteps - 1 ? 'Generate Score' : 'Continue'}
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
