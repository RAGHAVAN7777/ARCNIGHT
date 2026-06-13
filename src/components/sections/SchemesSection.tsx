import React, { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Landmark } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const schemes = [
  {
    name: 'PM SVANidhi',
    maxLoan: '₹50,000',
    description: 'Working capital loan for street vendors to resume their livelihoods. No collateral required, with 7% interest subsidy.',
    eligible: true,
  },
  {
    name: 'Mudra Loan (Shishu)',
    maxLoan: '₹50,000',
    description: 'Micro-enterprise funding for small business owners under PMMY. Covers working capital and equipment needs.',
    eligible: true,
  },
  {
    name: 'MSME Loan',
    maxLoan: '₹1,00,000',
    description: 'Collateral-free credit facility for micro and small enterprises with streamlined documentation process.',
    eligible: true,
  },
  {
    name: 'Women Entrepreneur Scheme',
    maxLoan: '₹25,00,000',
    description: 'Special scheme for women-owned businesses with reduced interest rates and dedicated support for business growth.',
    eligible: true,
  },
]

function TiltCard({ children, index }: { children: React.ReactNode; index: number }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-150, 150], [8, -8])
  const rotateY = useTransform(x, [-150, 150], [-8, 8])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(e.clientX - centerX)
    y.set(e.clientY - centerY)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{
        perspective: 1000,
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function SchemesSection() {
  return (
    <section id="schemes" style={{ padding: '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <motion.h2
          className="section-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          Matched to Real Government Schemes
        </motion.h2>
        <motion.p
          className="section-subheading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Based on your Resilience Score, we match you to government schemes you qualify for — automatically.
        </motion.p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          maxWidth: 960,
          margin: '0 auto',
        }}>
          {schemes.map((scheme, i) => (
            <TiltCard key={scheme.name} index={i}>
              <GlassCard
                hover
                style={{
                  padding: 28,
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  minHeight: 220,
                }}
              >
                {/* Background icon */}
                <Landmark
                  size={100}
                  strokeWidth={0.5}
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    color: 'rgba(255,255,255,0.03)',
                  }}
                />

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                  }}>
                    {scheme.name}
                  </h3>
                </div>

                {scheme.eligible && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: 'rgba(0,229,199,0.08)',
                    border: '1px solid rgba(0,229,199,0.2)',
                    color: '#00E5C7',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    marginBottom: 16,
                  }}>
                    ✓ Eligible
                  </span>
                )}

                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '1.6rem',
                  color: '#F5B82E',
                  marginBottom: 12,
                }}>
                  {scheme.maxLoan}
                </div>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                }}>
                  {scheme.description}
                </p>
              </GlassCard>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
