export const formatScore = (score) => {
  if (score === null || score === undefined) return '—'
  return score.toFixed(2)
}

export const formatCosseno = (score) => {
  if (score === null || score === undefined) return '—'
  return score.toFixed(4).replace('.', ',')
}

export const formatPercent = (score) => {
  if (score === null || score === undefined) return '—'
  return `${(score * 100).toFixed(0)}%`
}

export const formatExperiencia = (anos) => {
  if (anos === 0) return 'Sem experiência'
  if (anos === 1) return '1 ano'
  return `${anos} anos`
}

export const getInitials = (nome) => {
  if (!nome) return '?'
  return nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export const getAvatarColor = (nome) => {
  const colors = [
    '#0E7490', '#D97706', '#7C3AED', '#059669',
    '#DC2626', '#0284C7', '#C026D3', '#EA580C',
    '#0D9488', '#4F46E5',
  ]
  const idx = (nome?.charCodeAt(0) || 0) % colors.length
  return colors[idx]
}

export const truncate = (str, maxLength = 60) => {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}
