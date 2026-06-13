import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Shield, TrendingUp, Users } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const checklist = [
  { icon: Users, text: 'Applicant Summary with verified data points' },
  { icon: Shield, text: 'Risk Category and confidence level' },
  { icon: TrendingUp, text: 'Strengths & areas for improvement' },
  { icon: FileText, text: 'Suggested Growth Path with milestones' },
]

function DocumentMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <GlassCard style={{
        maxWidth: 380,
        padding: 0,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'rgba(0,229,199,0.04)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#00E5C7',
            }} />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}>
              Underwriter Report
            </span>
          </div>
          <span className="pill-badge" style={{ fontSize: '0.65rem', padding: '3px 10px' }}>
            Score: 770
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {/* Applicant */}
          <div style={{ marginBottom: 20 }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '60%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 8 }}
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '80%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.7 }}
              style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: 6 }}
            />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '45%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.9 }}
              style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4 }}
            />
          </div>

          {/* Score Bar */}
          <div style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 10,
            background: 'rgba(0,229,199,0.04)',
            border: '1px solid rgba(0,229,199,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Resilience Score</span>
              <span style={{ fontSize: '0.75rem', color: '#00E5C7', fontWeight: 600 }}>770 / 1000</span>
            </div>
            <div style={{
              height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '77%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #00E5C7, #00B89E)',
                  borderRadius: 3,
                }}
              />
            </div>
          </div>

          {/* Mini bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Income', width: '85%', delay: 1.2 },
              { label: 'Savings', width: '72%', delay: 1.3 },
              { label: 'Expenses', width: '68%', delay: 1.4 },
            ].map((bar) => (
              <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', width: 55 }}>{bar.label}</span>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: bar.width }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: bar.delay }}
                    style={{
                      height: '100%',
                      background: '#00E5C7',
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.6 }}
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 8,
              background: 'rgba(245,184,46,0.05)',
              border: '1px solid rgba(245,184,46,0.1)',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#F5B82E', fontWeight: 500 }}>
              Recommendation: Approve for PM SVANidhi (₹50,000)
            </span>
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default function UnderwriterSection() {
  return (
    <section id="about" style={{ padding: '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 64,
          alignItems: 'center',
        }}>
          {/* Left Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              marginBottom: 16,
              background: 'linear-gradient(135deg, #fff 30%, #00E5C7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Generate a Bank-Ready<br />Report in Seconds
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              marginBottom: 32,
            }}>
              Our AI Underwriter generates a comprehensive, explainable report
              that banks and NBFCs can use for credit decisions — replacing
              weeks of manual assessment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {checklist.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(0,229,199,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <item.icon size={18} color="#00E5C7" strokeWidth={1.5} />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Document */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DocumentMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
