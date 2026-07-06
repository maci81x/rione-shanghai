import { useStore } from '../../store/useStore'
import { formatEur, exportCSV } from '../../utils/format'
import { Users, Wallet, ArrowUpDown, TrendingUp, Download } from 'lucide-react'

const CATEGORY_COLORS = {
  bar: 'bg-yellow-400', cena: 'bg-orange-400', gadget: 'bg-purple-400',
  evento: 'bg-blue-400', ricarica: 'bg-green-500', vario: 'bg-gray-400', storno: 'bg-red-500'
}

export default function AdminDashboard() {
  const { users, transactions } = useStore()

  const today = new Date().toDateString()
  const todayTxs = transactions.filter(t => new Date(t.created_at).toDateString() === today)

  const totalBalance = users.reduce((s, u) => s + u.balance, 0)
  const totalRecharges = transactions.filter(t => t.type === 'ricarica' && !t.voided).reduce((s, t) => s + t.amount, 0)

  const catTotals = {}
  transactions.filter(t => t.type === 'spesa' && !t.voided).forEach(t => {
    catTotals[t.category] = (catTotals[t.category] ?? 0) + Math.abs(t.amount)
  })
  const maxCat = Math.max(...Object.values(catTotals), 1)

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const ds = d.toDateString()
    const label = d.toLocaleDateString('it-IT', { weekday: 'short' })
    const recharge = transactions.filter(t => new Date(t.created_at).toDateString() === ds && t.type === 'ricarica' && !t.voided).reduce((s, t) => s + t.amount, 0)
    const spent = transactions.filter(t => new Date(t.created_at).toDateString() === ds && t.type === 'spesa' && !t.voided).reduce((s, t) => s + Math.abs(t.amount), 0)
    return { label, recharge, spent }
  })
  const maxBar = Math.max(...last7.flatMap(d => [d.recharge, d.spent]), 1)

  const handleExport = () => exportCSV(users.map(u => ({ ...u, pin: '***' })), 'utenti-shanghai.csv')

  return (
    <div className="p-4 pb-8 space-y-4">
      {/* KPI */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Credito totale', value: formatEur(totalBalance), icon: Wallet, color: 'text-gray-900' },
          { label: 'Utenti attivi', value: users.filter(u => !u.blocked).length, icon: Users, color: 'text-gray-900' },
          { label: 'Movimenti oggi', value: todayTxs.length, icon: ArrowUpDown, color: 'text-gray-900' },
          { label: 'Ricariche totali', value: formatEur(totalRecharges), icon: TrendingUp, color: 'text-gray-900' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-xs">{label}</p>
                <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
              </div>
              <div className="bg-black/5 p-2 rounded-lg">
                <Icon size={18} className="text-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Barre categorie */}
      <div className="card">
        <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-3">Spese per categoria</p>
        <div className="space-y-2.5">
          {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
            <div key={cat}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600 capitalize">{cat}</span>
                <span className="text-gray-900 font-semibold">{formatEur(total)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${CATEGORY_COLORS[cat] ?? 'bg-gray-400'} rounded-full transition-all`}
                  style={{ width: `${(total / maxCat) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {Object.keys(catTotals).length === 0 && <p className="text-gray-400 text-sm">Nessuna spesa</p>}
        </div>
      </div>

      {/* Grafico 7 giorni */}
      <div className="card">
        <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-3">Ultimi 7 giorni</p>
        <div className="flex items-end gap-2 h-28">
          {last7.map(({ label, recharge, spent }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end h-20">
                <div className="flex-1 bg-green-400 rounded-t" style={{ height: `${(recharge / maxBar) * 100}%`, minHeight: recharge > 0 ? '4px' : 0 }} />
                <div className="flex-1 bg-red-400 rounded-t" style={{ height: `${(spent / maxBar) * 100}%`, minHeight: spent > 0 ? '4px' : 0 }} />
              </div>
              <span className="text-gray-400 text-[10px]">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-2 bg-green-400 rounded inline-block" /> Ricariche</span>
          <span className="flex items-center gap-1 text-xs text-gray-500"><span className="w-3 h-2 bg-red-400 rounded inline-block" /> Spese</span>
        </div>
      </div>

      <button onClick={handleExport} className="w-full btn-secondary flex items-center justify-center gap-2">
        <Download size={16} /> Esporta utenti CSV
      </button>
    </div>
  )
}
