import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  color?: string
}

export default function StatCard({ title, value, icon, trend, color = 'var(--primary)' }: StatCardProps) {
  return (
    <div className="glass-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {value}
          </h3>
          {trend && (
            <p style={{ fontSize: '12px', color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)', marginTop: '6px', fontWeight: 600 }}>
              {trend}
            </p>
          )}
        </div>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '12px',
          background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color, fontSize: '24px'
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}
