import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useAuth } from '../../store/useAuth'
import { formatDateTime, categoryEmoji, categoryLabel, typeColor, formatEur } from '../../utils/format'
import { Filter } from 'lucide-react'

const CATEGORIES = ['tutte', 'bar', 'cena', 'gadget', 'evento', 'ricarica', 'vario']
const TYPES = ['tutti', 'ricarica', 'spesa', 'storno']

export default function UserMovements() {
  const { session } = useAuth()
  const { transactions } = useStore()
  const [catFilter, setCatFilter] = useState('tutte')
  const [typeFilter, setTypeFilter] = useState('tutti')
  const [showFilters, setShowFilters] = useState(false)

  const myTxs = transactions
    .filter(t => t.user_id === session.id)
    .filter(t => catFilter === 'tutte' || t.category === catFilter)
    .filter(t => typeFilter === 'tutti' || t.type === typeFilter)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const hasActiveFilter = catFilter !== 'tutte' || typeFilter !== 'tutti'

  return (
    <div className="pb-nav">
      <div className="sticky top-0 bg-[#f5f5f5] z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">{myTxs.length} movimenti</p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-semibold transition-colors border ${
              hasActiveFilter
                ? 'bg-black text-[#FFED00] border-black'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            <Filter size={14} /> Filtri {hasActiveFilter && '•'}
          </button>
        </div>

        {showFilters && (
          <div className="space-y-2 mb-2 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                    catFilter === c ? 'bg-black text-[#FFED00]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                    typeFilter === t ? 'bg-black text-[#FFED00]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 space-y-2">
        {myTxs.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nessun movimento trovato</p>
        ) : (
          myTxs.map(tx => (
            <div key={tx.id} className={`card flex items-center gap-3 ${tx.voided ? 'opacity-50' : ''}`}>
              <span className="text-xl flex-shrink-0">{categoryEmoji(tx.category)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 text-sm font-medium truncate">{tx.note || categoryLabel(tx.category)}</p>
                  {tx.voided && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">annullato</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs">{formatDateTime(tx.created_at)} · {tx.operator}</p>
              </div>
              <span className={`font-bold text-sm whitespace-nowrap ${typeColor(tx.type)}`}>
                {tx.amount > 0 ? '+' : ''}{formatEur(tx.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
