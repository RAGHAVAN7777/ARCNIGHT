import React, { lazy, Suspense, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Play, QrCode } from 'lucide-react'
import AnimatedCounter from '../ui/AnimatedCounter'
import ScanCardModal from '../ui/ScanCardModal'
import { useAuth } from '../../context/AuthContext'

const ScoreOrb3D = lazy(() => import('../three/ScoreOrb3D'))

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stats = [
  { value: 770, suffix: '', label: 'Avg Score Generated' },
  { value: 92, suffix: '%', label: 'Match Accuracy' },
  { value: 50000, prefix: '₹', label: 'Avg Loan Eligibility' },
]

export default function HeroSection() {
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)
  const { isAuthenticated, openAuthModal } = useAuth()

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 72,
      }}
    >
      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(0,229,199,0.12) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(245,184,46,0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        width: '100%',
        flexWrap: 'wrap',
      }}>
        {/* Left Content */}
        <div style={{ flex: '1 1 55%', minWidth: 320 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              lineHeight: 1.08,
              marginBottom: 24,
              background: 'linear-gradient(135deg, #fff 30%, #00E5C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            From Invisible<br />to Creditworthy
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            style={{
              fontSize: '1.1rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: 36,
            }}
          >
            Vishwas AI builds a Financial Resilience Score for 400M+ Indians
            with no CIBIL history — using behavior, not paperwork.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}
          >
            <button 
              className="btn-primary" 
              onClick={(e) => {
                e.preventDefault()
                if (isAuthenticated) {
                  window.location.href = '/assessment'
                } else {
                  openAuthModal('/assessment')
                }
              }}
            >
              Take Assessment
            </button>
            <button className="btn-ghost" onClick={() => setIsScanModalOpen(true)}>
              <QrCode size={18} strokeWidth={2} />
              Verify Card
            </button>
          </motion.div>

          {/* Trust Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            style={{
              display: 'flex',
              gap: 40,
              flexWrap: 'wrap',
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '1.7rem',
                  color: '#fff',
                }}>
                  <AnimatedCounter
                    target={stat.value}
                    prefix={stat.prefix || ''}
                    suffix={stat.suffix || ''}
                    duration={2500}
                  />
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                  marginTop: 4,
                }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — 3D Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          style={{
            flex: '1 1 40%',
            minWidth: 300,
            height: 500,
            position: 'relative',
          }}
        >
          <Suspense fallback={
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(0,229,199,0.1)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
            </div>
          }>
            <ScoreOrb3D />
          </Suspense>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="scroll-indicator"
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div style={{
          width: 24, height: 38,
          borderRadius: 12,
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 8,
        }}>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 3, height: 8,
              borderRadius: 2,
              background: 'var(--color-teal)',
            }}
          />
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Scroll</span>
      </div>
      <ScanCardModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} />
    </section>
  )
}
