import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { formatDateTime, categoryEmoji, categoryLabel, typeColor, formatEur, exportCSV } from '../../utils/format'
import { Filter, Download, RotateCcw } from 'lucide-react'

export default function AdminMovements() {
  const { transactions, users, voidTransaction } = useStore()
  const [catFilter, setCatFilter] = useState('tutti')
  const [typeFilter, setTypeFilter] = useState('tutti')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [opFilter, setOpFilter] = useState('')
  const [showVoided, setShowVoided] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const categories = ['tutti', 'bar', 'cena', 'gadget', 'evento', 'ricarica', 'vario']
  const types = ['tutti', 'ricarica', 'spesa', 'storno']

  const filtered = transactions
    .filter(t => showVoided || !t.voided)
    .filter(t => catFilter === 'tutti' || t.category === catFilter)
    .filter(t => typeFilter === 'tutti' || t.type === typeFilter)
    .filter(t => !opFilter || t.operator?.toLowerCase().includes(opFilter.toLowerCase()))
    .filter(t => !dateFrom || new Date(t.created_at) >= new Date(dateFrom))
    .filter(t => !dateTo || new Date(t.created_at) <= new Date(dateTo + 'T23:59:59'))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const getUserName = (uid) => {
    const u = users.find(u => u.id === uid)
    return u ? `${u.name} ${u.surname}` : uid
  }

  const handleVoid = (tx) => {
    if (confirm(`Annullare la transazione di ${formatEur(Math.abs(tx.amount))} per ${getUserName(tx.user_id)}?`)) {
      voidTransaction(tx.id)
    }
  }

  const handleExport = () => {
    exportCSV(filtered.map(t => ({
      id: t.id, utente: getUserName(t.user_id), tipo: t.type,
      importo: t.amount, categoria: t.category, operatore: t.operator,
      note: t.note, annullato: t.voided, data: t.created_at
    })), 'movimenti-shanghai.csv')
  }

  const totaleRicariche = filtered.filter(t => t.type === 'ricarica').reduce((s, t) => s + t.amount, 0)
  const totaleSpese = filtered.filter(t => t.type === 'spesa').reduce((s, t) => s + Math.abs(t.amount), 0)

  const pillClass = (active) => `text-xs px-2.5 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
    active ? 'bg-black text-[#FFED00]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  }`

  return (
    <div className="pb-8">
      <div className="sticky top-0 bg-[#f5f5f5] z-10 px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-gray-500 flex-1">{filtered.length} movimenti</p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
              showFilters ? 'bg-black text-[#FFED00] border-black' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <Filter size={13} /> Filtri
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white text-gray-600 border border-gray-200 hover:border-gray-400 font-semibold"
          >
            <Download size={13} /> CSV
          </button>
        </div>

        {showFilters && (
          <div className="space-y-2 mb-2 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} className={pillClass(catFilter === c)}>{c}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {types.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={pillClass(typeFilter === t)}>{t}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input text-xs py-1.5 flex-1" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              <input className="input text-xs py-1.5 flex-1" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <input className="input text-xs py-1.5" placeholder="Filtra operatore..." value={opFilter} onChange={e => setOpFilter(e.target.value)} />
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <input type="checkbox" checked={showVoided} onChange={e => setShowVoided(e.target.checked)} />
              Mostra annullati
            </label>
          </div>
        )}

        <div className="flex gap-4 text-xs py-2 border-t border-gray-200">
          <span className="text-green-600 font-semibold">↑ Ricariche: {formatEur(totaleRicariche)}</span>
          <span className="text-red-600 font-semibold">↓ Spese: {formatEur(totaleSpese)}</span>
        </div>
      </div>

      <div className="px-4 space-y-2">
        {filtered.map(tx => (
          <div key={tx.id} className={`card flex gap-3 ${tx.voided ? 'opacity-50' : ''}`}>
            <span className="text-lg flex-shrink-0 mt-0.5">{categoryEmoji(tx.category)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-900 text-sm font-medium truncate">{getUserName(tx.user_id)}</span>
                <span className="text-gray-400 text-xs">{tx.user_id}</span>
                {tx.voided && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">annullato</span>}
              </div>
              <p className="text-gray-400 text-xs">
                {formatDateTime(tx.created_at)} · {tx.operator} · {categoryLabel(tx.category)}
              </p>
              {tx.note && <p className="text-gray-500 text-xs italic">{tx.note}</p>}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`font-bold text-sm ${typeColor(tx.type)}`}>
                {tx.amount > 0 ? '+' : ''}{formatEur(tx.amount)}
              </span>
              {!tx.voided && tx.type !== 'storno' && (
                <button onClick={() => handleVoid(tx)} className="text-gray-300 hover:text-amber-600 transition-colors">
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-400 text-center py-8">Nessun movimento trovato</p>}
      </div>
    </div>
  )
}
