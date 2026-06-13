import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import ProgressRing from '../ui/ProgressRing'
import GlassCard from '../ui/GlassCard'

const factors = [
  { label: 'Income Stability', weight: 25, score: 85, angle: 0 },
  { label: 'Savings Discipline', weight: 20, score: 78, angle: 60 },
  { label: 'Expense Discipline', weight: 15, score: 72, angle: 120 },
  { label: 'Recovery Ability', weight: 15, score: 68, angle: 180 },
  { label: 'Business Consistency', weight: 15, score: 80, angle: 240 },
  { label: 'Trust Signals', weight: 10, score: 90, angle: 300 },
]

const breakdownData = [
  { name: 'Regular Weekly Savings', value: 120, positive: true },
  { name: 'Consistent Income', value: 80, positive: true },
  { name: 'Emergency Fund', value: 60, positive: true },
  { name: 'UPI Transaction History', value: 50, positive: true },
  { name: 'Expense Fluctuation', value: -20, positive: false },
  { name: 'No Insurance Coverage', value: -15, positive: false },
]

export default function ScoreEngineSection() {
  const [hoveredFactor, setHoveredFactor] = useState<number | null>(null)
  const ringRadius = 200

  return (
    <section id="score-engine" style={{ padding: '120px 0', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <motion.h2
          className="section-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          Six Signals. One Resilience Score.
        </motion.h2>
        <motion.p
          className="section-subheading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Our proprietary engine analyzes six behavioral signals to generate an
          explainable, bank-ready Financial Resilience Score.
        </motion.p>

        {/* Central ring with orbiting factors */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            position: 'relative',
            width: ringRadius * 2 + 240,
            height: ringRadius * 2 + 240,
            margin: '0 auto 80px',
            maxWidth: '100%',
          }}
        >
          {/* Central Score */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}>
            <ProgressRing
              score={hoveredFactor !== null ? Math.round(factors[hoveredFactor].score * factors[hoveredFactor].weight / 100 * 10) : 770}
              size={180}
              strokeWidth={8}
              sublabel={hoveredFactor !== null ? factors[hoveredFactor].label : 'Established · Low Risk'}
            />
          </div>

          {/* Factor Cards */}
          {factors.map((factor, i) => {
            const angleRad = (factor.angle - 90) * (Math.PI / 180)
            const x = Math.cos(angleRad) * ringRadius
            const y = Math.sin(angleRad) * ringRadius
            const isHovered = hoveredFactor === i

            return (
              <motion.div
                key={factor.label}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                onMouseEnter={() => setHoveredFactor(i)}
                onMouseLeave={() => setHoveredFactor(null)}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px - 70px)`,
                  top: `calc(50% + ${y}px - 40px)`,
                  width: 140,
                  zIndex: isHovered ? 10 : 1,
                }}
              >
                <GlassCard
                  style={{
                    padding: 14,
                    cursor: 'pointer',
                    borderColor: isHovered ? 'rgba(0,229,199,0.3)' : undefined,
                    boxShadow: isHovered ? '0 0 24px rgba(0,229,199,0.15)' : undefined,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: '1.4rem',
                    color: '#00E5C7',
                    lineHeight: 1,
                  }}>
                    {factor.weight}%
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-text-secondary)',
                    marginTop: 4,
                    marginBottom: 8,
                    lineHeight: 1.3,
                  }}>
                    {factor.label}
                  </div>
                  <div style={{
                    height: 4,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${factor.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      style={{
                        height: '100%',
                        background: '#00E5C7',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </GlassCard>

                {/* Connecting line */}
                {isHovered && (
                  <svg
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 2,
                      height: Math.sqrt(x * x + y * y) - 90,
                      transform: `rotate(${factor.angle}deg)`,
                      transformOrigin: '0 0',
                      pointerEvents: 'none',
                    }}
                  >
                    <line
                      x1="1"
                      y1="0"
                      x2="1"
                      y2="100%"
                      stroke="rgba(0,229,199,0.3)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  </svg>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Explainable AI Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '1.3rem',
            textAlign: 'center',
            marginBottom: 32,
          }}>
            Explainable AI Breakdown
          </h3>
          <GlassCard style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                layout="vertical"
                data={breakdownData}
                margin={{ top: 0, right: 20, bottom: 0, left: 140 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#8A94A6', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0F1420',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [`${value > 0 ? '+' : ''}${value}`, 'Impact']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                  {breakdownData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.positive ? '#00E5C7' : '#E5484D'}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
