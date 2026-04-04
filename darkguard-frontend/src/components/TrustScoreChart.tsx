import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

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

export default function TrustScoreChart({ data }: TrustScoreChartProps) {
  const chartData = data || MOCK_DATA

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
        📈 Weekly Scan Activity
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPatterns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e63946" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#e63946" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
          />
          <Area type="monotone" dataKey="score" stroke="#6c63ff" strokeWidth={2}
            fillOpacity={1} fill="url(#colorScore)" name="Trust Score" />
          <Area type="monotone" dataKey="patterns" stroke="#e63946" strokeWidth={2}
            fillOpacity={1} fill="url(#colorPatterns)" name="Patterns Found" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
