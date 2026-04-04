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
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        {/* Progress circle */}
        <circle
          cx="40" cy="40" r="36" fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        {/* Grade letter */}
        <text
          x="40" y="40"
          textAnchor="middle" dominantBaseline="central"
          fill={color}
          fontSize="28" fontWeight="800"
          fontFamily="Inter, sans-serif"
          style={{ transform: 'rotate(90deg)', transformOrigin: '40px 40px' }}
        >
          {grade}
        </text>
      </svg>
      {showLabel && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Trust Score
        </p>
      )}
    </div>
  )
}
