import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'

interface TrustScoreChartProps {
  data?: Array<{ date: string; score: number; patterns: number }>
}

const MOCK_DATA = [
  { date: 'Mon', score: 85, patterns: 3 },
  { date: 'Tue', score: 72, patterns: 5 },
  { date: 'Wed', score: 90, patterns: 2 },
  { date: 'Thu', score: 65, patterns: 8 },
  { date: 'Fri', score: 78, patterns: 4 },
  { date: 'Sat', score: 82, patterns: 3 },
  { date: 'Sun', score: 88, patterns: 2 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10, 10, 22, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(124, 106, 255, 0.2)',
        borderRadius: '12px',
        padding: '14px 18px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 106, 255, 0.1)',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: 600, letterSpacing: '0.5px' }}>
          {label}
        </p>
        {payload.map((p: any) => (
          <p key={p.name} style={{
            fontSize: '13px', fontWeight: 600, marginBottom: '2px',
            color: p.color,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 6px ${p.color}`,
            }} />
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function TrustScoreChart({ data }: TrustScoreChartProps) {
  const chartData = data || MOCK_DATA

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 style={{
        fontSize: '17px', fontWeight: 700, marginBottom: '24px',
        color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{ filter: 'drop-shadow(0 0 8px rgba(124, 106, 255, 0.4))' }}>📈</span>
        Weekly Scan Activity
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c6aff" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#7c6aff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPatterns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3d71" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff3d71" stopOpacity={0} />
            </linearGradient>
            <filter id="glow-score">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-danger">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 106, 255, 0.06)" />
          <XAxis
            dataKey="date"
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'rgba(124, 106, 255, 0.1)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'rgba(124, 106, 255, 0.1)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey="score"
            stroke="#7c6aff" strokeWidth={2.5}
            fillOpacity={1} fill="url(#colorScore)"
            name="Trust Score"
            filter="url(#glow-score)"
          />
          <Area
            type="monotone" dataKey="patterns"
            stroke="#ff3d71" strokeWidth={2}
            fillOpacity={1} fill="url(#colorPatterns)"
            name="Patterns Found"
            filter="url(#glow-danger)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
