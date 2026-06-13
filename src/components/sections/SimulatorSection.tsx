import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'
import GlassCard from '../ui/GlassCard'
import AnimatedCounter from '../ui/AnimatedCounter'

function computeProjection(savings: number, expenseReduction: number, savingsRate: number) {
  const baseScore = 620
  const savingsImpact = (savings / 200) * 60
  const expenseImpact = (expenseReduction / 15) * 40
  const rateImpact = ((savingsRate - 10) / 20) * 40

  return [
    { day: 'Day 0', score: baseScore },
    { day: 'Day 30', score: Math.round(baseScore + (savingsImpact + expenseImpact + rateImpact) * 0.3) },
    { day: 'Day 60', score: Math.round(baseScore + (savingsImpact + expenseImpact + rateImpact) * 0.65) },
    { day: 'Day 90', score: Math.round(baseScore + (savingsImpact + expenseImpact + rateImpact) * 1.0) },
  ]
}

export default function SimulatorSection() {
  const [savings, setSavings] = useState(100)
  const [expenseReduction, setExpenseReduction] = useState(8)
  const [savingsRate, setSavingsRate] = useState(20)

  const data = useMemo(
    () => computeProjection(savings, expenseReduction, savingsRate),
    [savings, expenseReduction, savingsRate]
  )

  const currentScore = data[0].score
  const projectedScore = data[data.length - 1].score
  const improvement = projectedScore - currentScore

  return (
    <section id="simulator" style={{ padding: '120px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <motion.h2
          className="section-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          Watch Your Score Grow
        </motion.h2>
        <motion.p
          className="section-subheading"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Adjust the sliders to see how small financial habits can dramatically improve your creditworthiness over 90 days.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <GlassCard style={{
            maxWidth: 1000,
            margin: '0 auto',
            padding: 40,
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 48,
            }}>
              {/* Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Weekly Savings</label>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#00E5C7' }}>₹{savings}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={10}
                    value={savings}
                    onChange={(e) => setSavings(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #00E5C7 ${savings / 2}%, rgba(255,255,255,0.1) ${savings / 2}%)`,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>₹0</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>₹200</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Expense Reduction</label>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#00E5C7' }}>{expenseReduction}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={1}
                    value={expenseReduction}
                    onChange={(e) => setExpenseReduction(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #00E5C7 ${(expenseReduction / 15) * 100}%, rgba(255,255,255,0.1) ${(expenseReduction / 15) * 100}%)`,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>0%</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>15%</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Savings Rate Increase</label>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#00E5C7' }}>{savingsRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={30}
                    step={1}
                    value={savingsRate}
                    onChange={(e) => setSavingsRate(Number(e.target.value))}
                    style={{
                      background: `linear-gradient(to right, #00E5C7 ${((savingsRate - 10) / 20) * 100}%, rgba(255,255,255,0.1) ${((savingsRate - 10) / 20) * 100}%)`,
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>10%</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>30%</span>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E5C7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00E5C7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      tick={{ fill: '#5A6478', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[550, 850]}
                      tick={{ fill: '#5A6478', fontSize: 12 }}
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
                      fill="url(#scoreGrad)"
                      dot={{ fill: '#00E5C7', strokeWidth: 0, r: 5 }}
                      activeDot={{ r: 7, fill: '#00E5C7', stroke: '#0A0E17', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stat Boxes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              marginTop: 32,
              paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Current Score</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.8rem', color: '#F5B82E' }}>
                  {currentScore}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>90-Day Projection</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.8rem', color: '#00E5C7' }}>
                  {projectedScore}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Improvement</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.8rem', color: '#00E5C7' }}>
                  +{improvement}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  )
}
