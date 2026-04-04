import { getPatternColor, formatPatternType } from '../lib/utils'

interface PatternBadgeProps {
  type: string
  confidence?: number
  showConfidence?: boolean
}

export default function PatternBadge({ type, confidence, showConfidence = false }: PatternBadgeProps) {
  const color = getPatternColor(type)

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '20px',
      background: `${color}20`, color: color,
      fontSize: '12px', fontWeight: 600,
      border: `1px solid ${color}40`,
      whiteSpace: 'nowrap',
    }}>
      {formatPatternType(type)}
      {showConfidence && confidence !== undefined && (
        <span style={{ fontSize: '10px', opacity: 0.8 }}>
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  )
}
