import { motion } from 'framer-motion'
import { getPatternColor, formatPatternType } from '../lib/utils'

interface PatternBadgeProps {
  type: string
  confidence?: number
  showConfidence?: boolean
}

export default function PatternBadge({ type, confidence, showConfidence = false }: PatternBadgeProps) {
  const color = getPatternColor(type)

  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -2 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '5px 14px', borderRadius: '20px',
        background: `${color}15`, color: color,
        fontSize: '12px', fontWeight: 600,
        border: `1px solid ${color}30`,
        whiteSpace: 'nowrap',
        cursor: 'default',
        transition: 'box-shadow 0.3s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px ${color}30`
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }} />
      {formatPatternType(type)}
      {showConfidence && confidence !== undefined && (
        <span style={{
          fontSize: '10px', opacity: 0.8,
          background: `${color}25`,
          padding: '1px 6px',
          borderRadius: '8px',
        }}>
          {Math.round(confidence * 100)}%
        </span>
      )}
    </motion.span>
  )
}
