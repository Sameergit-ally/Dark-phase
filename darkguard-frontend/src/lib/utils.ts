export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: '#00e676',
    B: '#69f0ae',
    C: '#ffab40',
    D: '#ff6e40',
    F: '#ff3d71',
  }
  return colors[grade] || '#7c6aff'
}

export function getPatternColor(type: string): string {
  const colors: Record<string, string> = {
    FAKE_URGENCY: '#ff3d71',
    HIDDEN_CHARGES: '#ff1744',
    ROACH_MOTEL: '#ff6e40',
    TRICK_QUESTION: '#ffab40',
    COOKIE_MANIPULATION: '#ffd740',
    CONFIRMSHAMING: '#ff9100',
    BAIT_SWITCH: '#ff1744',
    MISDIRECTION: '#d50000',
  }
  return colors[type] || '#7c6aff'
}

export function formatPatternType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}
