import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { Download, TrendingUp, Shield, AlertTriangle, QrCode } from 'lucide-react'
import ProgressRing from '../components/ui/ProgressRing'
import GlassCard from '../components/ui/GlassCard'
import GenerateCardModal from '../components/ui/GenerateCardModal'

const factors = [
  { label: 'Income Stability', score: 85, weight: 25, color: '#00E5C7' },
  { label: 'Savings Discipline', score: 78, weight: 20, color: '#00E5C7' },
  { label: 'Expense Discipline', score: 72, weight: 15, color: '#F5B82E' },
  { label: 'Recovery Ability', score: 68, weight: 15, color: '#F5B82E' },
  { label: 'Business Consistency', score: 80, weight: 15, color: '#00E5C7' },
  { label: 'Trust Signals', score: 90, weight: 10, color: '#00E5C7' },
]

const breakdownData = [
  { name: 'Weekly Savings Habit', value: 120, positive: true },
  { name: 'Consistent Daily Income', value: 80, positive: true },
  { name: 'Emergency Buffer', value: 60, positive: true },
  { name: 'UPI History (8 months)', value: 50, positive: true },
  { name: 'Community References', value: 40, positive: true },
  { name: 'Expense Variability', value: -20, positive: false },
  { name: 'No Insurance', value: -15, positive: false },
  { name: 'No Formal Savings A/C', value: -10, positive: false },
]

const insights = [
  { icon: TrendingUp, title: 'Strong Income Pattern', desc: 'Your daily income of ₹600-800 shows consistency over 8 years.', type: 'positive' },
  { icon: Shield, title: 'Good Savings Habit', desc: 'Saving ₹500/week puts you in the top 20% of similar profiles.', type: 'positive' },
  { icon: AlertTriangle, title: 'Open a Bank Account', desc: 'Move your weekly savings to a bank account to strengthen your profile.', type: 'warning' },
]

export default function DashboardPage() {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [hasCard, setHasCard] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    const token = sessionStorage.getItem('vishwas_access_token')
    if (token) {
      fetch(`${apiBaseUrl}/cards/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setHasCard(data.has_card)
      })
      .catch(console.error)
    }
  }, [user, isGenerateModalOpen])

  const displayName = user?.username || 'User'
  
  const userScore = useMemo(() => {
    if (!user?.username) return 770;
    let hash = 0;
    for (let i = 0; i < user.username.length; i++) {
      hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 600 + (Math.abs(hash) % 251);
  }, [user?.username]);

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: 100,
      padding: '100px 24px 60px',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 48,
        }}
      >
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '2rem',
            marginBottom: 4,
          }}>
            {displayName}'s Score Dashboard
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Kirana Shop Owner · Jayanagar, Bangalore · Assessment completed June 13, 2026
          </p>
        </div>
        <button className="btn-primary">
          <Download size={18} strokeWidth={1.5} />
          Download Report
        </button>
      </motion.div>

      {/* Score + Factors Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 32,
        marginBottom: 48,
      }}>
        {/* Score Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <GlassCard style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 40,
          }}>
            <ProgressRing
              score={userScore}
              size={220}
              strokeWidth={10}
              sublabel={userScore > 750 ? "Established · Low Risk" : userScore > 650 ? "Growing · Medium Risk" : "New · High Risk"}
            />
            
            <button 
              onClick={() => setIsGenerateModalOpen(true)}
              style={{
                marginTop: 24, padding: '12px 20px', borderRadius: 8,
                background: hasCard ? 'rgba(245, 184, 46, 0.1)' : 'rgba(0, 229, 199, 0.1)', 
                border: hasCard ? '1px solid rgba(245, 184, 46, 0.2)' : '1px solid rgba(0, 229, 199, 0.2)',
                color: hasCard ? '#F5B82E' : '#00E5C7', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', width: '100%', justifyContent: 'center',
                transition: 'all 0.2s', fontWeight: 500
              }}
              onMouseOver={e => e.currentTarget.style.background = hasCard ? 'rgba(245, 184, 46, 0.15)' : 'rgba(0, 229, 199, 0.15)'}
              onMouseOut={e => e.currentTarget.style.background = hasCard ? 'rgba(245, 184, 46, 0.1)' : 'rgba(0, 229, 199, 0.1)'}
            >
              <QrCode size={16} />
              {hasCard ? 'Lost Card? Regenerate it' : 'Generate Access Card'}
            </button>

            <div style={{
              display: 'flex',
              gap: 24,
              marginTop: 32,
              width: '100%',
              justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Percentile</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem', color: '#00E5C7' }}>
                  Top 15%
                </div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Loan Eligible</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.3rem', color: '#F5B82E' }}>
                  ₹50,000
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Factor Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <GlassCard style={{ padding: 28 }}>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '1.1rem',
              marginBottom: 24,
            }}>
              Factor Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {factors.map((factor, i) => (
                <motion.div
                  key={factor.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {factor.label}
                    </span>
                    <span style={{
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      color: factor.color,
                    }}>
                      {factor.score}/100
                    </span>
                  </div>
                  <div style={{
                    height: 6,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.score}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      style={{
                        height: '100%',
                        background: factor.color,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Explainability Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        style={{ marginBottom: 48 }}
      >
        <GlassCard style={{ padding: 32 }}>
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '1.1rem',
            marginBottom: 24,
          }}>
            Score Explainability — What impacted your score
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              layout="vertical"
              data={breakdownData}
              margin={{ top: 0, right: 20, bottom: 0, left: 160 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#8A94A6', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={160}
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
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
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

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: '1.2rem',
          marginBottom: 20,
        }}>
          Key Insights
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {insights.map((insight, i) => (
            <GlassCard key={i} hover style={{ padding: 24 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: insight.type === 'positive' ? 'rgba(0,229,199,0.08)' : 'rgba(245,184,46,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 14,
              }}>
                <insight.icon
                  size={20}
                  color={insight.type === 'positive' ? '#00E5C7' : '#F5B82E'}
                  strokeWidth={1.5}
                />
              </div>
              <h4 style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '1rem',
                marginBottom: 6,
              }}>
                {insight.title}
              </h4>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
              }}>
                {insight.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </motion.div>

      <GenerateCardModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)}
        userName={displayName}
        score={userScore}
        level={userScore > 750 ? "Established · Low Risk" : userScore > 650 ? "Growing · Medium Risk" : "New · High Risk"}
      />
    </div>
  )
}
