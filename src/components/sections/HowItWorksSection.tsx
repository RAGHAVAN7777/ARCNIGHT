import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Mic, ScanLine, BarChart3, TrendingUp } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const steps = [
  {
    icon: Mic,
    number: '01',
    title: 'Voice-Guided Interview',
    desc: 'Multilingual AI conversation captures income patterns, savings habits, dependents, and daily expenses — no forms needed.',
    mockup: 'voice',
  },
  {
    icon: ScanLine,
    number: '02',
    title: 'Smart Document Scan',
    desc: 'OCR reads bank passbooks, UPI screenshots, and ration cards automatically — extracting financial signals in seconds.',
    mockup: 'scan',
  },
  {
    icon: BarChart3,
    number: '03',
    title: 'Resilience Engine Analysis',
    desc: 'Our 6-factor scoring model computes a 0-1000 Financial Resilience Score based on behavioral patterns, not paperwork.',
    mockup: 'score',
  },
  {
    icon: TrendingUp,
    number: '04',
    title: 'Personalized Action Plan',
    desc: '30/60/90-day growth roadmap with matched government schemes, savings targets, and credit-building steps.',
    mockup: 'plan',
  },
]

function MiniMockup({ type }: { type: string }) {
  const baseStyle: React.CSSProperties = {
    width: 140,
    height: 240,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflow: 'hidden',
    flexShrink: 0,
  }

  if (type === 'voice') {
    return (
      <div style={baseStyle}>
        <div style={{ height: 6, width: '40%', background: 'rgba(0,229,199,0.3)', borderRadius: 3 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'flex-end' }}>
          <div style={{ alignSelf: 'flex-start', padding: '6px 10px', background: 'rgba(0,229,199,0.1)', borderRadius: '8px 8px 8px 2px', fontSize: '0.5rem', color: '#00E5C7' }}>
            What is your daily income?
          </div>
          <div style={{ alignSelf: 'flex-end', padding: '6px 10px', background: 'rgba(245,184,46,0.1)', borderRadius: '8px 8px 2px 8px', fontSize: '0.5rem', color: '#F5B82E' }}>
            About ₹600 per day
          </div>
          <div style={{ alignSelf: 'flex-start', padding: '6px 10px', background: 'rgba(0,229,199,0.1)', borderRadius: '8px 8px 8px 2px', fontSize: '0.5rem', color: '#00E5C7' }}>
            How much do you save weekly?
          </div>
        </div>
        <div style={{ height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E5484D' }} />
        </div>
      </div>
    )
  }

  if (type === 'scan') {
    return (
      <div style={baseStyle}>
        <div style={{ height: 6, width: '60%', background: 'rgba(0,229,199,0.3)', borderRadius: 3 }} />
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', borderRadius: 8, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '80%', height: '60%', border: '2px dashed rgba(0,229,199,0.3)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ScanLine size={20} color="#00E5C7" strokeWidth={1.5} />
          </div>
          <motion.div
            animate={{ top: ['20%', '80%', '20%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', left: '10%', right: '10%', height: 2,
              background: 'linear-gradient(90deg, transparent, #00E5C7, transparent)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ flex: 1, height: 4, background: 'rgba(0,229,199,0.4)', borderRadius: 2 }} />
          <div style={{ flex: 0.6, height: 4, background: 'rgba(0,229,199,0.2)', borderRadius: 2 }} />
        </div>
      </div>
    )
  }

  if (type === 'score') {
    return (
      <div style={baseStyle}>
        <div style={{ height: 6, width: '50%', background: 'rgba(0,229,199,0.3)', borderRadius: 3 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle cx="30" cy="30" r="25" fill="none" stroke="#00E5C7" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 25 * 0.77} ${2 * Math.PI * 25}`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          </svg>
          <span style={{ fontSize: '0.6rem', color: '#00E5C7', fontWeight: 600 }}>770 / 1000</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[70, 85, 60].map((w, i) => (
            <div key={i} style={{ height: 4, width: `${w}%`, background: i === 2 ? 'rgba(245,184,46,0.4)' : 'rgba(0,229,199,0.3)', borderRadius: 2 }} />
          ))}
        </div>
      </div>
    )
  }

  // plan
  return (
    <div style={baseStyle}>
      <div style={{ height: 6, width: '55%', background: 'rgba(0,229,199,0.3)', borderRadius: 3 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {['Day 30', 'Day 60', 'Day 90'].map((label, i) => (
          <div key={label} style={{
            padding: '6px 8px', borderRadius: 6,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ fontSize: '0.45rem', color: '#00E5C7', marginBottom: 2 }}>{label}</div>
            <div style={{ height: 3, width: `${40 + i * 25}%`, background: 'rgba(0,229,199,0.4)', borderRadius: 2 }} />
          </div>
        ))}
      </div>
      <div style={{ height: 28, borderRadius: 8, background: 'rgba(245,184,46,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.45rem', color: '#F5B82E', fontWeight: 600 }}>View Full Plan</span>
      </div>
    </div>
  )
}

export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="how-it-works" ref={containerRef} style={{ padding: '120px 0', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <motion.h2
          className="section-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          How It Works
        </motion.h2>
        <motion.p
          className="section-subheading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Four simple steps to transform your financial identity — powered by AI, designed for simplicity.
        </motion.p>

        {/* Timeline */}
        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
          {/* Vertical Line */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            transform: 'translateX(-50%)',
            width: 3,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 2,
          }}>
            <motion.div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, #00E5C7, #F5B82E)',
                borderRadius: 2,
                transformOrigin: 'top',
                scaleY: lineScale,
              }}
            />
          </div>

          {steps.map((step, i) => {
            const isLeft = i % 2 === 0
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                style={{
                  display: 'flex',
                  justifyContent: isLeft ? 'flex-start' : 'flex-end',
                  paddingBottom: i < steps.length - 1 ? 80 : 0,
                  position: 'relative',
                }}
              >
                {/* Center dot */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: 20,
                  transform: 'translate(-50%, 0)',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--color-bg-dark)',
                  border: '3px solid #00E5C7',
                  zIndex: 2,
                  boxShadow: '0 0 12px rgba(0,229,199,0.4)',
                }} />

                <GlassCard
                  hover
                  style={{
                    width: 'calc(50% - 48px)',
                    display: 'flex',
                    gap: 20,
                    alignItems: 'flex-start',
                    padding: 28,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginBottom: 12,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '2rem',
                        color: 'transparent',
                        WebkitTextStroke: '1.5px #00E5C7',
                        lineHeight: 1,
                      }}>
                        {step.number}
                      </span>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'rgba(0,229,199,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <step.icon size={20} color="#00E5C7" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      fontSize: '1.15rem',
                      marginBottom: 8,
                    }}>
                      {step.title}
                    </h3>
                    <p style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.7,
                    }}>
                      {step.desc}
                    </p>
                  </div>
                  <MiniMockup type={step.mockup} />
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
