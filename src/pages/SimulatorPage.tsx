import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import GlassCard from '../components/ui/GlassCard'
import ProgressRing from '../components/ui/ProgressRing'

function computeYearlyProjection(
  savings: number,
  expenseReduction: number,
  savingsRate: number,
  consistencyBonus: number
) {
  const baseScore = 620
  const savingsImpact = (savings / 500) * 100
  const expenseImpact = (expenseReduction / 20) * 60
  const rateImpact = ((savingsRate - 10) / 30) * 60
  const consistencyImpact = (consistencyBonus / 100) * 40

  const totalImpact = savingsImpact + expenseImpact + rateImpact + consistencyImpact
  const months = []

  for (let i = 0; i <= 12; i++) {
    const progress = 1 - Math.pow(1 - i / 12, 2.5) // Logarithmic growth curve
    months.push({
      month: `Month ${i}`,
      score: Math.min(Math.round(baseScore + totalImpact * progress), 950),
      label: i === 0 ? 'Start' : i === 3 ? '3M' : i === 6 ? '6M' : i === 9 ? '9M' : i === 12 ? '1Y' : '',
    })
  }

  return months
}

const sliderConfig = [
  { key: 'savings', label: 'Weekly Savings', min: 0, max: 500, step: 25, prefix: '₹', suffix: '' },
  { key: 'expenseReduction', label: 'Expense Reduction', min: 0, max: 20, step: 1, prefix: '', suffix: '%' },
  { key: 'savingsRate', label: 'Savings Rate Increase', min: 10, max: 40, step: 1, prefix: '', suffix: '%' },
  { key: 'consistencyBonus', label: 'Weekly Consistency', min: 0, max: 100, step: 5, prefix: '', suffix: '%' },
]

export default function SimulatorPage() {
  const [values, setValues] = useState({
    savings: 150,
    expenseReduction: 10,
    savingsRate: 20,
    consistencyBonus: 75,
  })

  const data = useMemo(
    () => computeYearlyProjection(values.savings, values.expenseReduction, values.savingsRate, values.consistencyBonus),
    [values]
  )

  const currentScore = data[0].score
  const threeMonthScore = data[3].score
  const sixMonthScore = data[6].score
  const yearScore = data[12].score

  const updateValue = (key: string, val: number) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: 100,
      padding: '100px 24px 60px',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 48 }}
      >
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          marginBottom: 8,
          background: 'linear-gradient(135deg, #fff 30%, #00E5C7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Credit Growth Simulator
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
          Fine-tune your financial habits and see how your Resilience Score projects
          over a full year. Adjust all parameters for a personalized growth trajectory.
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        marginBottom: 48,
      }}>
        {/* Sliders Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard style={{ padding: 32 }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '1.1rem',
              marginBottom: 28,
            }}>
              Adjust Your Habits
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {sliderConfig.map(slider => {
                const val = values[slider.key as keyof typeof values]
                const pct = ((val - slider.min) / (slider.max - slider.min)) * 100
                return (
                  <div key={slider.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                        {slider.label}
                      </label>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        color: '#00E5C7',
                      }}>
                        {slider.prefix}{val}{slider.suffix}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      value={val}
                      onChange={(e) => updateValue(slider.key, Number(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #00E5C7 ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        {slider.prefix}{slider.min}{slider.suffix}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        {slider.prefix}{slider.max}{slider.suffix}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard style={{ padding: 32 }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '1.1rem',
              marginBottom: 24,
            }}>
              12-Month Score Projection
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5C7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00E5C7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#5A6478', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  domain={[550, 1000]}
                  tick={{ fill: '#5A6478', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0F1420',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#00E5C7"
                  strokeWidth={3}
                  fill="url(#simGrad)"
                  dot={{ fill: '#00E5C7', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, fill: '#00E5C7', stroke: '#0A0E17', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>
      </div>

      {/* Milestone Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
      }}>
        {[
          { label: 'Current', score: currentScore, color: '#8A94A6' },
          { label: '3 Months', score: threeMonthScore, color: '#F5B82E' },
          { label: '6 Months', score: sixMonthScore, color: '#00E5C7' },
          { label: '1 Year', score: yearScore, color: '#00E5C7' },
        ].map((milestone, i) => (
          <motion.div
            key={milestone.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
          >
            <GlassCard style={{
              padding: 24,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                {milestone.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '2rem',
                color: milestone.color,
              }}>
                {milestone.score}
              </div>
              {i > 0 && (
                <div style={{
                  fontSize: '0.8rem',
                  color: '#00E5C7',
                  marginTop: 4,
                }}>
                  +{milestone.score - currentScore}
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
