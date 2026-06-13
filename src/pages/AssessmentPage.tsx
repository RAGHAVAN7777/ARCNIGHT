import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Globe, Mic, Upload, FileText, Check } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'

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

  const totalSteps = 3
  const progress = ((step + 1) / totalSteps) * 100

  const next = () => {
    if (step < totalSteps - 1) {
      setDirection(1)
      setStep(step + 1)
    }
  }

  const prev = () => {
    if (step > 0) {
      setDirection(-1)
      setStep(step - 1)
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
      paddingTop: 100,
      padding: '100px 24px 60px',
      maxWidth: 800,
      margin: '0 auto',
    }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Step {step + 1} of {totalSteps}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#00E5C7' }}>
            {Math.round(progress)}% Complete
          </span>
        </div>
        <div style={{
          height: 4,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00E5C7, #00B89E)',
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div style={{ position: 'relative', minHeight: 500, overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Step 0: Language Select */}
            {step === 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Globe size={24} color="#00E5C7" strokeWidth={1.5} />
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1.8rem',
                  }}>
                    Choose Your Language
                  </h2>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 36 }}>
                  Select your preferred language for the assessment interview.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 16,
                }}>
                  {languages.map(lang => (
                    <GlassCard
                      key={lang.code}
                      hover
                      onClick={() => setSelectedLang(lang.code)}
                      style={{
                        padding: 20,
                        cursor: 'pointer',
                        borderColor: selectedLang === lang.code ? '#00E5C7' : undefined,
                        background: selectedLang === lang.code ? 'rgba(0,229,199,0.05)' : undefined,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        marginBottom: 4,
                      }}>
                        {lang.native}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {lang.label}
                      </div>
                      {selectedLang === lang.code && (
                        <Check size={18} color="#00E5C7" style={{ marginTop: 8 }} />
                      )}
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Voice/Text Interview */}
            {step === 1 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Mic size={24} color="#00E5C7" strokeWidth={1.5} />
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1.8rem',
                  }}>
                    AI Interview
                  </h2>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                  Answer a few simple questions about your income and habits.
                </p>

                <GlassCard style={{ maxHeight: 400, overflowY: 'auto', padding: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {chatMessages.slice(0, chatIndex).map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={msg.role === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}
                        style={{
                          alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                          maxWidth: '80%',
                          fontSize: '0.9rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {msg.text}
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>

                <button
                  onClick={addMessage}
                  className="btn-ghost"
                  style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
                >
                  <Mic size={18} strokeWidth={1.5} />
                  Continue Interview
                </button>
              </div>
            )}

            {/* Step 2: Document Upload */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Upload size={24} color="#00E5C7" strokeWidth={1.5} />
                  <h2 style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1.8rem',
                  }}>
                    Document Upload
                  </h2>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>
                  Upload bank passbook pages, UPI screenshots, or ration cards for verification.
                </p>

                <div
                  className="dropzone"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  style={{ marginBottom: 24 }}
                >
                  <Upload size={40} color="var(--color-text-muted)" strokeWidth={1.5} style={{ marginBottom: 16 }} />
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                    Drag and drop files here, or click to browse
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Supports: JPG, PNG, PDF (max 10MB each)
                  </p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {uploadedFiles.map((file, i) => (
                      <GlassCard key={i} style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}>
                        <FileText size={18} color="#00E5C7" strokeWidth={1.5} />
                        <span style={{ fontSize: '0.85rem' }}>{file}</span>
                        <Check size={16} color="#00E5C7" style={{ marginLeft: 'auto' }} />
                      </GlassCard>
                    ))}
                  </div>
                )}

                {/* Sample files for demo */}
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
                    Demo: Click to simulate uploads
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['UPI_History_Kumar.pdf', 'Passbook_Page_3.jpg', 'Ration_Card.pdf'].map(f => (
                      <button
                        key={f}
                        onClick={() => setUploadedFiles(prev => [...prev, f])}
                        className="btn-ghost"
                        style={{ padding: '8px 14px', fontSize: '0.8rem' }}
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

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 40,
        paddingTop: 24,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={prev}
          disabled={step === 0}
          className="btn-ghost"
          style={{
            opacity: step === 0 ? 0.3 : 1,
            pointerEvents: step === 0 ? 'none' : 'auto',
          }}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
          Previous
        </button>
        <button
          onClick={next}
          className="btn-primary"
          style={{
            opacity: step === totalSteps - 1 ? 1 : 1,
          }}
        >
          {step === totalSteps - 1 ? 'Generate Score' : 'Next'}
          <ChevronRight size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
