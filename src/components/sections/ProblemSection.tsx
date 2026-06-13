import React from 'react'
import { motion } from 'framer-motion'
import { Store, Car, ShoppingBag, Bike, Briefcase, CheckCircle, XCircle } from 'lucide-react'
import GlassCard from '../ui/GlassCard'

const personas = [
  { icon: Store, title: 'Street Vendor', detail: 'Earns ₹400-600/day · No formal credit history', color: '#00E5C7' },
  { icon: Car, title: 'Auto Driver', detail: 'Earns ₹500-800/day · No salary slips', color: '#F5B82E' },
  { icon: ShoppingBag, title: 'Kirana Owner', detail: 'Earns ₹600-900/day · Cash-only transactions', color: '#00E5C7' },
  { icon: Bike, title: 'Delivery Partner', detail: 'Earns ₹400-700/day · Gig economy worker', color: '#F5B82E' },
  { icon: Briefcase, title: 'Daily Wage Worker', detail: 'Earns ₹350-600/day · Seasonal income', color: '#00E5C7' },
]

const haveItems = [
  'Regular income from daily work',
  'Consistent UPI/mobile payment history',
  'Community trust and local reputation',
]

const lackItems = [
  'CIBIL score or formal credit history',
  'Documented income proof or IT returns',
  'Access to mainstream banking products',
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function ProblemSection() {
  return (
    <section id="problem" style={{ padding: '120px 0', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <motion.h2
          className="section-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          The System Wasn't Built For Them
        </motion.h2>
        <motion.p
          className="section-subheading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          400 million Indians earn a living every day but remain invisible to the financial system.
          They have the resilience — they just need the recognition.
        </motion.p>

        {/* Persona Carousel */}
        <motion.div
          className="persona-carousel"
          style={{ marginBottom: 80, padding: '4px 0 20px' }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {personas.map((p, i) => (
            <motion.div key={p.title} variants={itemVariants}>
              <GlassCard
                hover
                style={{
                  width: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  padding: 28,
                }}
              >
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: `${p.color}12`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <p.icon size={24} color={p.color} strokeWidth={1.5} />
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '1.15rem',
                }}>
                  {p.title}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                }}>
                  {p.detail}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Have vs Lack */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 40,
        }}>
          {/* What they HAVE */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '1.3rem',
              marginBottom: 24,
              color: '#00E5C7',
            }}>
              What they HAVE
            </h3>
            {haveItems.map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: i * 0.1 } },
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <CheckCircle size={22} color="#00E5C7" strokeWidth={1.5} />
                <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>{item}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* What they LACK */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '1.3rem',
              marginBottom: 24,
              color: '#E5484D',
            }}>
              What they LACK
            </h3>
            {lackItems.map((item, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, x: 30 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: i * 0.1 } },
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <XCircle size={22} color="#E5484D" strokeWidth={1.5} />
                <span style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
