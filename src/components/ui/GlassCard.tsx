import React from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  hover?: boolean
  onClick?: () => void
}

export default function GlassCard({ children, className = '', style, hover = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}
      style={{ padding: 24, ...style }}
      onClick={onClick}
      whileHover={hover ? { y: -4 } : undefined}
    >
      {children}
    </motion.div>
  )
}
