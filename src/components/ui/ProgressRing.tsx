import React from 'react'
import { useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

interface ProgressRingProps {
  score: number
  maxScore?: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
  label?: string
  sublabel?: string
}

export default function ProgressRing({
  score,
  maxScore = 1000,
  size = 240,
  strokeWidth = 10,
  className = '',
  showLabel = true,
  label = 'Financial Resilience Score',
  sublabel,
}: ProgressRingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [animatedScore, setAnimatedScore] = useState(0)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = animatedScore / maxScore
  const dashoffset = circumference * (1 - progress)

  useEffect(() => {
    if (!inView) return
    let startTime: number | null = null
    let frameId: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const p = Math.min((timestamp - startTime) / 2000, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimatedScore(Math.round(eased * score))
      if (p < 1) frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [inView, score])

  const getScoreColor = () => {
    if (animatedScore >= 700) return '#00E5C7'
    if (animatedScore >= 500) return '#F5B82E'
    return '#E5484D'
  }

  return (
    <div ref={ref} className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5C7" />
            <stop offset="100%" stopColor="#00B89E" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.05s linear',
            filter: `drop-shadow(0 0 8px ${getScoreColor()}40)`,
          }}
        />
      </svg>
      {showLabel && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: size * 0.2,
            color: '#fff',
            lineHeight: 1,
          }}>
            {animatedScore}
          </span>
          <span style={{
            fontSize: size * 0.05,
            color: 'var(--color-text-secondary)',
            marginTop: 4,
            textAlign: 'center',
            maxWidth: '70%',
          }}>
            {label}
          </span>
          {sublabel && (
            <span className="pill-badge" style={{ marginTop: 8, fontSize: '0.7rem' }}>
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
