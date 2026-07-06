import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { formatEur, formatDate, formatDateTime, categoryEmoji, typeColor } from '../../utils/format'
import { Search, Plus, X, QrCode, Lock, Unlock, Trash2, Edit2, ChevronDown, ChevronUp, ScanLine } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Modal from '../common/Modal'
import QRScanner from '../common/QRScanner'

const EMPTY_USER = { id: '', name: '', surname: '', cf: '', email: '', pin: '', notes: '', privacy_base: true, privacy_gdpr: true, privacy_marketing: false, privacy_media: false }

// Trova il primo numero libero nella sequenza SH-NNN (gap-filling)
function nextCardId(users) {
  const nums = users
    .map(u => { const m = u.id.match(/^SH-(\d+)$/i); return m ? parseInt(m[1], 10) : null })
    .filter(n => n !== null)
    .sort((a, b) => a - b)
  let next = 1
  for (const n of nums) {
    if (n === next) next++
    else break
  }
  return `SH-${String(next).padStart(3, '0')}`
}

export default function AdminUsers() {
  const { users, transactions, addUser, updateUser, deleteUser, chargeUser, rechargeUser } = useStore()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_USER)
  const [formError, setFormError] = useState('')
  const [txAmount, setTxAmount] = useState('')
  const [txNote, setTxNote] = useState('')
  const [txCategory, setTxCategory] = useState('vario')
  const [txMode, setTxMode] = useState('spesa')
  const [feedback, setFeedback] = useState(null)
  const [showTxs, setShowTxs] = useState(false)
  const [showScanner, setShowScanner] = useState(false)

  const filtered = users
    .filter(u => !query ||
      u.id.toLowerCase().includes(query.toLowerCase()) ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.surname.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => a.surname.localeCompare(b.surname))

  const userTxs = selected
    ? transactions.filter(t => t.user_id === selected.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    : []

  const openCreate = () => {
    setForm({ ...EMPTY_USER, id: nextCardId(users) })
    setFormError('')
    setModal('form')
    setSelected(null)
  }

  const openEdit = (u) => {
    setForm({ ...u })
    setFormError('')
    setModal('form')
    setSelected(u)
  }

  const handleSave = () => {
    if (!form.id || !form.name || !form.surname || !form.pin) return
    if (!selected && users.some(u => u.id.toUpperCase() === form.id.toUpperCase())) {
      setFormError(`Il codice ${form.id} è già in uso.`)
      return
    }
    if (!selected) { addUser(form) } else { updateUser(form.id, form) }
    setModal(null); setSelected(null); setFormError('')
  }

  const handleAction = () => {
    if (!selected || !txAmount) return
    const res = txMode === 'spesa'
      ? chargeUser({ user_id: selected.id, amount: +txAmount, category: txCategory, operator: 'Admin', note: txNote })
      : rechargeUser({ user_id: selected.id, amount: +txAmount, operator: 'Admin', note: txNote })
    setFeedback(res)
    if (res.ok) {
      setTxAmount(''); setTxNote('')
      setSelected(users.find(u => u.id === selected.id))
    }
  }

  const handleBlock = (u) => updateUser(u.id, { blocked: !u.blocked })
  const handleDelete = (u) => {
    if (confirm(`Eliminare ${u.name} ${u.surname}?`)) { deleteUser(u.id); setSelected(null) }
  }

  const handleQRScan = (code) => {
    setShowScanner(false)
    const normalized = code.trim().toUpperCase()
    const user = users.find(u => u.id.toUpperCase() === normalized)
    if (user) {
      setQuery('')
      setSelected(user)
      setFeedback(null)
      setShowTxs(false)
    } else {
      setQuery(normalized)
    }
  }

  const pillMode = (active) => `flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
    active ? 'bg-black text-[#FFED00]' : 'text-gray-500'
  }`

  return (
    <div className="pb-8">
      <div className="sticky top-0 bg-[#f5f5f5] z-10 px-4 pt-4 pb-2 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 text-sm"
            placeholder="Cerca utente..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="btn-secondary px-3 flex items-center gap-1 text-sm"
          title="Scansiona QR"
        >
          <ScanLine size={16} />
        </button>
        <button onClick={openCreate} className="btn-primary px-3 flex items-center gap-1 text-sm">
          <Plus size={16} /> Nuovo
        </button>
      </div>

      <div className="px-4 space-y-2">
        {filtered.map(u => (
          <div
            key={u.id}
            className={`card cursor-pointer transition-all ${
              selected?.id === u.id ? 'border-black shadow-md' : 'border-[#eeeeee] hover:border-gray-300'
            }`}
            onClick={() => { setSelected(u); setFeedback(null); setShowTxs(false) }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                u.blocked ? 'bg-gray-200 text-gray-500' : 'bg-black text-[#FFED00]'
              }`}>
                {u.name.charAt(0)}{u.surname.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 truncate">{u.name} {u.surname}</p>
                  {u.blocked && (
                    <span className="text-red-600 text-xs bg-red-50 border border-red-200 px-1.5 py-0.5 rounded font-semibold">bloccato</span>
                  )}
                </div>
                <p className="text-gray-400 text-xs">{u.id}</p>
              </div>
              <p className="text-gray-900 font-bold text-sm">{formatEur(u.balance)}</p>
            </div>

            {/* Pannello espanso */}
            {selected?.id === u.id && (
              <div className="mt-4 space-y-4 border-t border-gray-100 pt-4" onClick={e => e.stopPropagation()}>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'QR', icon: QrCode, action: () => setModal('qr') },
                    { label: 'Modifica', icon: Edit2, action: () => openEdit(u) },
                    { label: u.blocked ? 'Sblocca' : 'Blocca', icon: u.blocked ? Unlock : Lock, action: () => handleBlock(u) },
                    { label: 'Elimina', icon: Trash2, action: () => handleDelete(u), danger: true },
                  ].map(({ label, icon: Icon, action, danger }) => (
                    <button
                      key={label}
                      onClick={action}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors ${
                        danger
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      <Icon size={13} />{label}
                    </button>
                  ))}
                </div>

                {u.notes && <p className="text-gray-500 text-xs italic">{u.notes}</p>}

                <div className="space-y-2">
                  <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
                    {[{ k: 'spesa', l: 'Addebita' }, { k: 'ricarica', l: 'Ricarica' }].map(({ k, l }) => (
                      <button key={k} onClick={() => { setTxMode(k); setFeedback(null) }} className={pillMode(txMode === k)}>{l}</button>
                    ))}
                  </div>
                  {txMode === 'spesa' && (
                    <select className="input text-sm py-2" value={txCategory} onChange={e => setTxCategory(e.target.value)}>
                      {['bar', 'cena', 'gadget', 'evento', 'vario'].map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                      <input className="input pl-7 text-sm py-2" placeholder="0.00" inputMode="decimal"
                        value={txAmount} onChange={e => setTxAmount(e.target.value.replace(',', '.'))} />
                    </div>
                    <input className="input text-sm py-2 flex-1" placeholder="Note"
                      value={txNote} onChange={e => setTxNote(e.target.value)} />
                  </div>
                  {feedback && (
                    <p className={`text-xs font-semibold ${feedback.ok ? 'text-green-600' : 'text-red-600'}`}>
                      {feedback.ok ? '✓ Operazione completata' : feedback.error}
                    </p>
                  )}
                  <button
                    onClick={handleAction}
                    disabled={!txAmount}
                    className={`w-full py-2 rounded-xl text-sm font-bold disabled:opacity-40 ${
                      txMode === 'spesa' ? 'bg-black text-[#FFED00]' : 'bg-[#FFED00] text-black'
                    }`}
                  >
                    {txMode === 'spesa' ? `Addebita €${txAmount || '0'}` : `Ricarica €${txAmount || '0'}`}
                  </button>
                </div>

                <button onClick={() => setShowTxs(!showTxs)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
                  {showTxs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showTxs ? 'Nascondi movimenti' : 'Ultimi movimenti'}
                </button>
                {showTxs && userTxs.slice(0, 8).map(tx => (
                  <div key={tx.id} className={`flex gap-2 text-xs py-1.5 border-b border-gray-100 ${tx.voided ? 'opacity-40' : ''}`}>
                    <span>{categoryEmoji(tx.category)}</span>
                    <span className="text-gray-500 flex-1 truncate">{tx.note || tx.category} · {formatDateTime(tx.created_at)}</span>
                    <span className={typeColor(tx.type)}>{tx.amount > 0 ? '+' : ''}{formatEur(tx.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* QR display modal */}
      {modal === 'qr' && selected && (
        <Modal title="QR Utente" onClose={() => setModal(null)} size="sm">
          <div className="text-center">
            <p className="font-bold text-gray-900 mb-1">{selected.name} {selected.surname}</p>
            <p className="text-gray-500 text-sm mb-4">{selected.id}</p>
            <div className="flex justify-center">
              <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                <QRCodeSVG value={selected.id} size={180} level="H" />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Form modal */}
      {modal === 'form' && (
        <Modal title={selected ? 'Modifica utente' : 'Nuovo utente'} onClose={() => { setModal(null); setSelected(null); setFormError('') }} size="md">
          <div className="space-y-3">
            {[
              { key: 'id', label: 'Codice tessera', upper: true, disabled: !!selected },
              { key: 'name', label: 'Nome' },
              { key: 'surname', label: 'Cognome' },
              { key: 'cf', label: 'Codice Fiscale', upper: true },
              { key: 'email', label: 'Email' },
              { key: 'pin', label: 'PIN (4 cifre)', type: 'password', inputMode: 'numeric', maxLength: 6 },
              { key: 'notes', label: 'Note interne' },
            ].map(({ key, label, upper, type, disabled, inputMode, maxLength }) => (
              <div key={key}>
                <label className="text-gray-500 text-xs mb-1 block font-semibold">{label}</label>
                <input
                  className={`input text-sm ${disabled ? 'opacity-50 bg-gray-50' : ''}`}
                  type={type || 'text'} disabled={disabled}
                  inputMode={inputMode} maxLength={maxLength}
                  value={form[key] || ''}
                  onChange={e => {
                    setFormError('')
                    setForm(f => ({ ...f, [key]: upper ? e.target.value.toUpperCase() : e.target.value }))
                  }}
                />
              </div>
            ))}
            {formError && (
              <p className="text-red-600 text-xs font-semibold">{formError}</p>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setModal(null); setSelected(null); setFormError('') }} className="btn-secondary flex-1">Annulla</button>
              <button onClick={handleSave} className="btn-primary flex-1">Salva</button>
            </div>
          </div>
        </Modal>
      )}

      {/* QR scanner */}
      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  )
}
