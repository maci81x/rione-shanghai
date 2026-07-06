import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../../store/useStore'
import { useAuth } from '../../store/useAuth'
import { formatEur, formatDateTime } from '../../utils/format'
import { Search, Wallet, AlertCircle, CheckCircle2, LogOut, X, ScanLine } from 'lucide-react'
import DragonLogo from '../common/DragonLogo'
import QRScanner from '../common/QRScanner'

const CATEGORIES = [
  { key: 'bar', label: 'Bar', emoji: '🍺' },
  { key: 'cena', label: 'Cena', emoji: '🍜' },
  { key: 'gadget', label: 'Gadget', emoji: '🛍️' },
  { key: 'vario', label: 'Vario', emoji: '📋' },
]

export default function StaffCash() {
  const { session, logout } = useAuth()
  const { users, transactions, chargeUser, rechargeUser, promotions } = useStore()
  const [query, setQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('bar')
  const [note, setNote] = useState('')
  const [mode, setMode] = useState('spesa')
  const [feedback, setFeedback] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => { searchRef.current?.focus() }, [])

  const filtered = query.length >= 2
    ? users.filter(u =>
        u.id.toLowerCase().includes(query.toLowerCase()) ||
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.surname.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : []

  const activePromos = promotions.filter(p => p.active)

  const myTxs = selectedUser
    ? transactions.filter(t => t.user_id === selectedUser.id && !t.voided).slice(0, 3)
    : []

  const handleSelect = (user) => {
    setSelectedUser(user)
    setQuery('')
    setFeedback(null)
    setAmount('')
    setNote('')
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const handleClear = () => {
    setSelectedUser(null)
    setQuery('')
    setFeedback(null)
    setAmount('')
    setNote('')
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const handleAction = () => {
    if (!selectedUser || !amount || isNaN(+amount) || +amount <= 0) return
    const result = mode === 'spesa'
      ? chargeUser({ user_id: selectedUser.id, amount: +amount, category, operator: session.name, staff_id: session.id, note })
      : rechargeUser({ user_id: selectedUser.id, amount: +amount, operator: session.name, staff_id: session.id, note })

    setFeedback(result)
    if (result.ok) {
      setAmount('')
      setNote('')
    }
    setTimeout(() => searchRef.current?.focus(), 200)
  }

  const handleQRScan = (code) => {
    setShowScanner(false)
    const normalized = code.trim().toUpperCase()
    const user = users.find(u => u.id.toUpperCase() === normalized)
    if (user) {
      handleSelect(user)
    } else {
      setQuery(normalized)
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }

  const refreshSelected = useCallback(() => {
    if (selectedUser) {
      const updated = users.find(u => u.id === selectedUser.id)
      setSelectedUser(updated ?? null)
    }
  }, [selectedUser, users])

  useEffect(() => { refreshSelected() }, [users])

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header nero con logo drago */}
      <header
        className="bg-black px-4 pb-3 flex items-center justify-between sticky top-0 z-30"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}
      >
        <div className="flex items-center gap-2">
          <DragonLogo size={26} style={{ color: '#FFED00' }} className="flex-shrink-0" />
          <div>
            <h1 className="font-black text-white text-lg leading-tight">Shanghai · Cassa</h1>
            <p className="text-gray-400 text-xs">{session.name} · {session.staffRole}</p>
          </div>
        </div>
        <button onClick={logout} className="text-gray-400 hover:text-[#FFED00] p-2 transition-colors min-h-[44px] flex items-center">
          <LogOut size={20} />
        </button>
      </header>

      <div className="p-4 space-y-4 pb-8">
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchRef}
              className="input pl-10 pr-10"
              placeholder="Cerca per nome o codice..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowScanner(true)}
            className="btn-secondary px-3 flex items-center gap-1 flex-shrink-0"
            title="Scansiona QR"
          >
            <ScanLine size={18} />
          </button>
        </div>

        {/* Risultati ricerca */}
        {filtered.length > 0 && !selectedUser && (
          <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {filtered.map(u => (
              <button
                key={u.id}
                onClick={() => handleSelect(u)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
              >
                <div className="bg-black rounded-full w-9 h-9 flex items-center justify-center text-sm font-bold text-[#FFED00] flex-shrink-0">
                  {u.name.charAt(0)}{u.surname.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-900 font-medium">{u.name} {u.surname}</p>
                  <p className="text-gray-400 text-xs">{u.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-bold">{formatEur(u.balance)}</p>
                  {u.blocked && <span className="text-red-600 text-xs font-semibold">bloccato</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Utente selezionato */}
        {selectedUser && (
          <>
            <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#FFED00] rounded-full w-11 h-11 flex items-center justify-center text-lg font-bold text-black flex-shrink-0">
                    {selectedUser.name.charAt(0)}{selectedUser.surname.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedUser.name} {selectedUser.surname}</p>
                    <p className="text-gray-400 text-xs">{selectedUser.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#FFED00] font-black text-xl">{formatEur(selectedUser.balance)}</p>
                  {selectedUser.blocked && <p className="text-red-400 text-xs font-semibold">BLOCCATO</p>}
                </div>
              </div>
              <button onClick={handleClear} className="mt-3 text-gray-500 hover:text-gray-300 text-xs flex items-center gap-1 transition-colors">
                <X size={12} /> Cambia utente
              </button>
            </div>

            {/* Promo attive */}
            {activePromos.length > 0 && (
              <div className="bg-[#FFED00]/20 border border-[#FFED00]/50 rounded-xl px-3 py-2">
                <p className="text-gray-800 text-xs font-semibold">
                  🎉 Promo attive: {activePromos.map(p => p.title).join(' · ')}
                </p>
              </div>
            )}

            {/* Mode toggle — attivo = nero + giallo */}
            <div className="flex gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
              {[{ k: 'spesa', label: 'Addebita' }, { k: 'ricarica', label: 'Ricarica cash' }].map(({ k, label }) => (
                <button
                  key={k}
                  onClick={() => { setMode(k); setFeedback(null) }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    mode === k ? 'bg-black text-[#FFED00]' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Categorie */}
            {mode === 'spesa' && (
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`flex flex-col items-center py-3 rounded-xl text-sm font-semibold transition-all border ${
                      category === key
                        ? 'bg-black text-[#FFED00] border-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-xs mt-1">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Importo */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">€</span>
              <input
                className="input pl-9 text-2xl font-black py-4"
                placeholder="0.00"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(',', '.'))}
              />
            </div>

            {/* Importi rapidi */}
            <div className="flex gap-2">
              {(mode === 'spesa' ? [2, 4, 5, 8, 10, 12] : [10, 20, 50]).map(v => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                    +amount === v
                      ? 'bg-black text-[#FFED00] border-black'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  €{v}
                </button>
              ))}
            </div>

            <input
              className="input"
              placeholder="Note (opzionale)"
              value={note}
              onChange={e => setNote(e.target.value)}
            />

            {feedback && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold ${
                feedback.ok
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {feedback.ok ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {feedback.ok
                  ? `✓ ${mode === 'spesa' ? 'Addebitato' : 'Ricaricato'} €${parseFloat(amount || 0).toFixed(2)} — Saldo: ${formatEur(users.find(u => u.id === selectedUser.id)?.balance ?? 0)}`
                  : feedback.error}
              </div>
            )}

            {/* Bottone azione */}
            <button
              onClick={handleAction}
              disabled={!amount || isNaN(+amount) || +amount <= 0 || selectedUser.blocked}
              className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 ${
                mode === 'spesa'
                  ? 'bg-black text-[#FFED00] hover:bg-gray-900'
                  : 'bg-[#FFED00] text-black hover:bg-yellow-300'
              }`}
            >
              <Wallet size={20} />
              {mode === 'spesa'
                ? `Addebita ${amount ? '€' + parseFloat(amount).toFixed(2) : ''}`
                : `Ricarica ${amount ? '€' + parseFloat(amount).toFixed(2) : ''}`}
            </button>

            {/* Ultimi movimenti */}
            {myTxs.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Ultimi movimenti</p>
                {myTxs.map(tx => (
                  <div key={tx.id} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm">{tx.type === 'ricarica' ? '💰' : '💳'}</span>
                    <span className="text-gray-500 text-xs flex-1 truncate">
                      {tx.note || tx.category} · {formatDateTime(tx.created_at)}
                    </span>
                    <span className={`text-xs font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{formatEur(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!selectedUser && query.length < 2 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-500">Cerca un utente per iniziare</p>
            <p className="text-gray-400 text-sm mt-1">Almeno 2 caratteri o scansiona il QR</p>
          </div>
        )}
      </div>

      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  )
}
