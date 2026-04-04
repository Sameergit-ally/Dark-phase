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
    A: '#2a9d8f',
    B: '#4ecdc4',
    C: '#f4a261',
    D: '#e76f51',
    F: '#e63946',
  }
  return colors[grade] || '#6c63ff'
}

export function getPatternColor(type: string): string {
  const colors: Record<string, string> = {
    FAKE_URGENCY: '#e63946',
    HIDDEN_CHARGES: '#d62828',
    ROACH_MOTEL: '#e76f51',
    TRICK_QUESTION: '#f4a261',
    COOKIE_MANIPULATION: '#e9c46a',
    CONFIRMSHAMING: '#f77f00',
    BAIT_SWITCH: '#d90429',
    MISDIRECTION: '#c1121f',
  }
  return colors[type] || '#6c63ff'
}

export function formatPatternType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}
