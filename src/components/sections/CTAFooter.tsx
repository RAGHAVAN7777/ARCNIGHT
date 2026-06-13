import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle, Globe, ExternalLink, Mail } from 'lucide-react'

export default function CTAFooter() {
  return (
    <>
      {/* CTA Band */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 24px',
      }}>
        <div className="animated-grid" style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
        }} />

        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(0,229,199,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative',
          maxWidth: 800,
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              marginBottom: 16,
              background: 'linear-gradient(135deg, #fff 20%, #00E5C7 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Your Financial Identity<br />Starts Here
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontSize: '1.1rem',
              color: 'var(--color-text-secondary)',
              marginBottom: 40,
              lineHeight: 1.7,
            }}
          >
            Join thousands of Indians building their financial identity.
            Take your assessment today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <Link to="/assessment" className="btn-primary" style={{ fontSize: '1.05rem', padding: '16px 40px' }}>
              Take Assessment
              <ArrowRight size={20} strokeWidth={1.5} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '64px 24px 32px',
      }}>
        <div style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 40,
          marginBottom: 48,
        }}>
          {/* Product */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: 20,
              color: '#fff',
            }}>
              Product
            </h4>
            {['Assessment', 'Score Engine', 'Simulator', 'Dashboard', 'API Access'].map(item => (
              <a
                key={item}
                href="#"
                style={{
                  display: 'block',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem',
                  marginBottom: 12,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00E5C7')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Resources */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: 20,
              color: '#fff',
            }}>
              Resources
            </h4>
            {['Documentation', 'Research Paper', 'Case Studies', 'Blog', 'Help Center'].map(item => (
              <a
                key={item}
                href="#"
                style={{
                  display: 'block',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem',
                  marginBottom: 12,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00E5C7')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Schemes Covered */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: 20,
              color: '#fff',
            }}>
              Schemes Covered
            </h4>
            {['PM SVANidhi', 'Mudra Loan', 'MSME Loan', 'Stand Up India', 'Women Entrepreneur'].map(item => (
              <a
                key={item}
                href="#"
                style={{
                  display: 'block',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem',
                  marginBottom: 12,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#00E5C7')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: 20,
              color: '#fff',
            }}>
              Contact
            </h4>
            <a href="mailto:hello@vishwas.ai" style={{
              display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 12,
            }}>
              hello@vishwas.ai
            </a>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 12, lineHeight: 1.6 }}>
              Bangalore, India
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {[MessageCircle, Globe, ExternalLink, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#00E5C7'
                    e.currentTarget.style.borderColor = 'rgba(0,229,199,0.2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--color-text-muted)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 24,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="8" stroke="#00E5C7" strokeWidth="2" fill="none" />
              <circle cx="16" cy="16" r="4" fill="#00E5C7" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
            }}>
              Vishwas AI
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            © 2026 Vishwas AI. All rights reserved.
          </span>
        </div>
      </footer>
    </>
  )
}
