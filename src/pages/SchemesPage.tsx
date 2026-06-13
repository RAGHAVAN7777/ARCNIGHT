import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Landmark, Filter, Search, ArrowRight } from 'lucide-react'
import GlassCard from '../components/ui/GlassCard'

const allSchemes = [
  {
    name: 'PM SVANidhi',
    category: 'street-vendors',
    maxLoan: '₹50,000',
    interest: '7% subsidy',
    eligibility: 'Street vendors with certificate of vending',
    description: 'Working capital loan for street vendors to resume their livelihoods. No collateral required, with 7% interest subsidy on timely repayment.',
    eligible: true,
    matchScore: 95,
  },
  {
    name: 'Mudra Loan — Shishu',
    category: 'micro-business',
    maxLoan: '₹50,000',
    interest: 'Bank rate',
    eligibility: 'Small business owners, micro enterprises',
    description: 'Micro-enterprise funding for small business owners under PMMY. Covers working capital and equipment needs without collateral.',
    eligible: true,
    matchScore: 92,
  },
  {
    name: 'Mudra Loan — Kishor',
    category: 'micro-business',
    maxLoan: '₹5,00,000',
    interest: 'Bank rate',
    eligibility: 'Growing businesses needing expansion capital',
    description: 'For businesses that have started earning and need additional finance to grow. Ideal for small shop owners expanding operations.',
    eligible: false,
    matchScore: 65,
  },
  {
    name: 'MSME Loan',
    category: 'msme',
    maxLoan: '₹1,00,000',
    interest: '8-12%',
    eligibility: 'Micro, Small & Medium Enterprises',
    description: 'Collateral-free credit facility for micro and small enterprises with streamlined documentation and faster approval.',
    eligible: true,
    matchScore: 88,
  },
  {
    name: 'Stand Up India',
    category: 'special',
    maxLoan: '₹1,00,00,000',
    interest: 'Base rate + 3%',
    eligibility: 'SC/ST and women entrepreneurs',
    description: 'Bank loans between ₹10 lakh and ₹1 crore for greenfield enterprises set up by SC, ST, and women entrepreneurs.',
    eligible: false,
    matchScore: 45,
  },
  {
    name: 'Women Entrepreneur Scheme',
    category: 'women',
    maxLoan: '₹25,00,000',
    interest: 'Reduced rates',
    eligibility: 'Women-owned businesses',
    description: 'Special scheme for women-owned businesses with reduced interest rates and dedicated support for business growth and financial literacy.',
    eligible: true,
    matchScore: 85,
  },
  {
    name: 'PM Vishwakarma',
    category: 'artisan',
    maxLoan: '₹3,00,000',
    interest: '5%',
    eligibility: 'Traditional artisans and craftspeople',
    description: 'End-to-end support for traditional artisans through recognition, skill upgradation, toolkit incentives, and credit support.',
    eligible: false,
    matchScore: 50,
  },
  {
    name: 'DAY-NRLM SHG Loan',
    category: 'shg',
    maxLoan: '₹20,00,000',
    interest: '4-7%',
    eligibility: 'Self Help Group members',
    description: 'Revolving fund and community investment support for Self Help Groups under Deendayal Antyodaya Yojana.',
    eligible: true,
    matchScore: 78,
  },
]

const categories = [
  { value: 'all', label: 'All Schemes' },
  { value: 'street-vendors', label: 'Street Vendors' },
  { value: 'micro-business', label: 'Micro Business' },
  { value: 'msme', label: 'MSME' },
  { value: 'women', label: 'Women' },
  { value: 'special', label: 'Special Category' },
]

export default function SchemesPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showEligibleOnly, setShowEligibleOnly] = useState(false)

  const filtered = allSchemes.filter(s => {
    if (filter !== 'all' && s.category !== filter) return false
    if (showEligibleOnly && !s.eligible) return false
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

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
        style={{ marginBottom: 40 }}
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
          Government Schemes
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: 600, lineHeight: 1.7 }}>
          Browse all matched government schemes based on your Financial Resilience Score.
          Filter by category or eligibility.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 32,
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          flex: '1 1 250px',
          maxWidth: 320,
        }}>
          <Search size={18} color="var(--color-text-muted)" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search schemes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.9rem',
              flex: 1,
            }}
          />
        </div>

        {/* Category Filters */}
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: '0.8rem',
              fontWeight: 500,
              border: '1px solid',
              borderColor: filter === cat.value ? '#00E5C7' : 'rgba(255,255,255,0.08)',
              background: filter === cat.value ? 'rgba(0,229,199,0.08)' : 'rgba(255,255,255,0.03)',
              color: filter === cat.value ? '#00E5C7' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {cat.label}
          </button>
        ))}

        {/* Eligible Only Toggle */}
        <button
          onClick={() => setShowEligibleOnly(!showEligibleOnly)}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            fontSize: '0.8rem',
            fontWeight: 500,
            border: '1px solid',
            borderColor: showEligibleOnly ? '#F5B82E' : 'rgba(255,255,255,0.08)',
            background: showEligibleOnly ? 'rgba(245,184,46,0.08)' : 'rgba(255,255,255,0.03)',
            color: showEligibleOnly ? '#F5B82E' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Filter size={14} strokeWidth={1.5} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Eligible Only
        </button>
      </motion.div>

      {/* Schemes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
      }}>
        {filtered.map((scheme, i) => (
          <motion.div
            key={scheme.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <GlassCard hover style={{
              padding: 28,
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <Landmark
                size={80}
                strokeWidth={0.5}
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  color: 'rgba(255,255,255,0.02)',
                }}
              />

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 12,
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  flex: 1,
                }}>
                  {scheme.name}
                </h3>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  background: scheme.eligible ? 'rgba(0,229,199,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${scheme.eligible ? 'rgba(0,229,199,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  color: scheme.eligible ? '#00E5C7' : 'var(--color-text-muted)',
                  flexShrink: 0,
                  marginLeft: 10,
                }}>
                  {scheme.eligible ? '✓ Eligible' : 'Not Eligible'}
                </span>
              </div>

              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: '#F5B82E',
                marginBottom: 4,
              }}>
                {scheme.maxLoan}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                marginBottom: 12,
              }}>
                Interest: {scheme.interest}
              </div>

              <p style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginBottom: 16,
                flex: 1,
              }}>
                {scheme.description}
              </p>

              {/* Match Score */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Match Score</span>
                  <div style={{
                    height: 4, width: 80, borderRadius: 2,
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                    marginTop: 4,
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${scheme.matchScore}%`,
                      background: scheme.matchScore >= 80 ? '#00E5C7' : scheme.matchScore >= 60 ? '#F5B82E' : '#E5484D',
                      borderRadius: 2,
                    }} />
                  </div>
                </div>
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: scheme.matchScore >= 80 ? '#00E5C7' : scheme.matchScore >= 60 ? '#F5B82E' : '#E5484D',
                }}>
                  {scheme.matchScore}%
                </span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 64,
          color: 'var(--color-text-muted)',
        }}>
          No schemes match your current filters. Try adjusting your criteria.
        </div>
      )}
    </div>
  )
}
