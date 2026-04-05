import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  color?: string
}

function AnimatedCounter({ value }: { value: string | number }) {
  const [display, setDisplay] = useState(0)
  const numValue = typeof value === 'number' ? value : parseInt(value)
  const isNumber = !isNaN(numValue)

  useEffect(() => {
    if (!isNumber) return
    const duration = 1200
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setDisplay(Math.round(eased * numValue))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [numValue, isNumber])

  if (!isNumber) return <>{value}</>
  return <>{display.toLocaleString()}</>
}

export default function StatCard({ title, value, icon, trend, color = 'var(--primary)' }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div
        ref={cardRef}
        className="glass-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          borderLeft: `3px solid ${color}`,
          transition: 'transform 0.15s ease-out, border-color 0.3s, box-shadow 0.3s',
          cursor: 'default',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{
              color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600,
              marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px',
              fontFamily: 'Inter, sans-serif',
            }}>
              {title}
            </p>
            <h3 style={{
              fontSize: '34px', fontWeight: 800, color: 'var(--text-primary)',
              lineHeight: 1, fontFamily: 'Outfit, sans-serif',
            }}>
              <AnimatedCounter value={value} />
            </h3>
            {trend && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                style={{
                  fontSize: '12px',
                  color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)',
                  marginTop: '8px',
                  fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <span style={{
                  display: 'inline-block',
                  filter: `drop-shadow(0 0 4px ${trend.startsWith('+') ? 'var(--success-glow)' : 'var(--danger-glow)'})`,
                }}>
                  {trend.startsWith('+') ? '▲' : '▼'}
                </span>
                {trend}
              </motion.p>
            )}
          </div>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: `${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: color,
            filter: `drop-shadow(0 0 10px ${color}40)`,
            transition: 'filter 0.3s',
          }}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
