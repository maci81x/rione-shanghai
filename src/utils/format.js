export const formatEur = (n) => `€${Math.abs(Number(n)).toFixed(2)}`

export const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const formatDateTime = (iso) => {
  const d = new Date(iso)
  return d.toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const formatEventDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

export const categoryLabel = (cat) => ({
  bar: 'Bar', cena: 'Cena', gadget: 'Gadget',
  evento: 'Evento', ricarica: 'Ricarica', vario: 'Vario', storno: 'Storno'
}[cat] ?? cat)

export const categoryEmoji = (cat) => ({
  bar: '🍺', cena: '🍜', gadget: '🛍️',
  evento: '🎉', ricarica: '💰', vario: '📋', storno: '↩️'
}[cat] ?? '•')

// Colori semantici su sfondo chiaro
export const typeColor = (type) => ({
  ricarica: 'text-green-600',
  spesa: 'text-red-600',
  storno: 'text-amber-600'
}[type] ?? 'text-gray-500')

export const exportCSV = (rows, filename) => {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
