import { QRCodeSVG } from 'qrcode.react'
import { useStore } from '../../store/useStore'
import { useAuth } from '../../store/useAuth'
import { formatEur, formatDateTime, categoryEmoji, typeColor } from '../../utils/format'
import { Wallet, RefreshCw, CalendarDays } from 'lucide-react'

export default function UserHome({ onNav }) {
  const { session } = useAuth()
  const { users, transactions, events, promotions } = useStore()
  const user = users.find(u => u.id === session.id)
  const myTxs = transactions.filter(t => t.user_id === session.id && !t.voided).slice(0, 5)
  const nextEvent = events
    .filter(e => new Date(e.event_date) > new Date() && !e.sold_out)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))[0]
  const activePromo = promotions.find(p => p.active)

  return (
    <div className="pb-nav">
      {/* Promo banner */}
      {activePromo && (
        <div className="bg-[#FFED00]/30 border-b border-[#FFED00]/60 px-4 py-2 flex items-center gap-2">
          <span className="text-gray-900 text-sm font-semibold">
            🎉 {activePromo.title} — {activePromo.discount_pct}% OFF!
          </span>
        </div>
      )}

      {/* Balance card */}
      <div className="bg-gradient-to-br from-black to-gray-800 mx-4 mt-4 rounded-2xl p-5 shadow-xl">
        <p className="text-gray-300 text-sm">Benvenuto, <span className="font-semibold text-white">{user?.name}</span></p>
        <p className="text-gray-500 text-xs mt-0.5">{user?.id}</p>
        <div className="mt-3">
          <p className="text-gray-400 text-xs uppercase tracking-wide">Saldo disponibile</p>
          <p className="text-4xl font-black text-[#FFED00] mt-1">{formatEur(user?.balance ?? 0)}</p>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onNav('ricarica')}
            className="flex-1 bg-[#FFED00] hover:bg-yellow-300 text-black font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <Wallet size={16} /> Ricarica
          </button>
          <button
            onClick={() => onNav('movimenti')}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw size={16} /> Movimenti
          </button>
        </div>
      </div>

      {/* QR tessera — sempre visibile */}
      <div className="mx-4 mt-3">
        <div className="card flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-xl border border-gray-100 flex-shrink-0">
            <QRCodeSVG value={user?.id ?? ''} size={90} level="H" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Il tuo codice per lo staff</p>
            <p className="font-mono font-black text-gray-900 text-xl tracking-wider mt-0.5">{user?.id}</p>
            <p className="text-gray-400 text-xs mt-1">Mostra allo staff per pagare</p>
          </div>
        </div>
      </div>

      {/* Next event */}
      {nextEvent && (
        <div className="mx-4 mt-3">
          <div
            className="card border border-[#eeeeee] cursor-pointer hover:border-black/20 transition-colors"
            onClick={() => onNav('eventi')}
          >
            <div className="flex items-start gap-3">
              <div className="bg-black/5 p-2.5 rounded-xl">
                <CalendarDays size={20} className="text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Prossimo evento</p>
                <p className="font-bold text-gray-900 truncate">{nextEvent.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {new Date(nextEvent.event_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <span className="text-gray-900 font-black text-sm whitespace-nowrap">
                {nextEvent.price > 0 ? formatEur(nextEvent.price) : 'Gratis'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last movements */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Ultimi movimenti</p>
          <button onClick={() => onNav('movimenti')} className="text-gray-700 text-xs font-semibold hover:underline">Tutti →</button>
        </div>
        {myTxs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Nessun movimento</p>
        ) : (
          <div className="space-y-2">
            {myTxs.map(tx => (
              <div key={tx.id} className="card flex items-center gap-3 py-3">
                <span className="text-xl">{categoryEmoji(tx.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-medium truncate">{tx.note || tx.category}</p>
                  <p className="text-gray-400 text-xs">{formatDateTime(tx.created_at)}</p>
                </div>
                <span className={`font-bold text-sm ${typeColor(tx.type)}`}>
                  {tx.amount > 0 ? '+' : ''}{formatEur(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
