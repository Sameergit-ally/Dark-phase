import { motion } from 'framer-motion'
import { getGradeColor } from '../lib/utils'

interface GradeCircleProps {
  grade: string
  size?: number
  showLabel?: boolean
}

export default function GradeCircle({ grade, size = 80, showLabel = false }: GradeCircleProps) {
  const color = getGradeColor(grade)
  const percentage = { A: 100, B: 80, C: 60, D: 40, F: 20 }[grade] || 50
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ textAlign: 'center' }}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 12px ${color}60)` }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
      >
        {/* Background circle */}
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />

        {/* Scanner ring */}
        <circle
          cx="40" cy="40" r="38" fill="none"
          stroke={color} strokeWidth="0.5"
          strokeDasharray="4 8"
          opacity={0.4}
          style={{ transformOrigin: '40px 40px', animation: 'rotate360 8s linear infinite' }}
        />

        {/* Progress circle */}
        <motion.circle
          cx="40" cy="40" r="36" fill="none"
          stroke={color} strokeWidth="5"
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />

        {/* Grade letter */}
        <text
          x="40" y="40"
          textAnchor="middle" dominantBaseline="central"
          fill={color}
          fontSize="26" fontWeight="800"
          fontFamily="Outfit, sans-serif"
          style={{
            transform: 'rotate(90deg)',
            transformOrigin: '40px 40px',
            filter: `drop-shadow(0 0 8px ${color}80)`,
          }}
        >
          {grade}
        </text>
      </motion.svg>
      {showLabel && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 500 }}>
          Trust Score
        </p>
      )}
    </div>
  )
}
