import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../../store/useAuth'
import { useStore } from '../../store/useStore'
import { formatDate, formatEur } from '../../utils/format'
import { LogOut, Shield, ChevronDown, ChevronUp } from 'lucide-react'

export default function UserProfile() {
  const { session, logout } = useAuth()
  const { users, transactions, updateUser } = useStore()
  const user = users.find(u => u.id === session.id)
  const recharges = transactions.filter(t => t.user_id === session.id && t.type === 'ricarica' && !t.voided)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const togglePrivacy = (key) => updateUser(user.id, { [key]: !user[key] })

  const privacyFields = [
    { key: 'privacy_base', label: 'Consenso base (richiesto)', locked: true },
    { key: 'privacy_gdpr', label: 'Trattamento dati GDPR' },
    { key: 'privacy_marketing', label: 'Comunicazioni marketing' },
    { key: 'privacy_media', label: 'Uso immagini/video' },
  ]

  return (
    <div className="p-4 pb-nav space-y-4">
      {/* Profile card */}
      <div className="card border border-[#eeeeee]">
        <div className="flex items-center gap-4">
          <div className="bg-black rounded-full w-14 h-14 flex items-center justify-center text-xl font-black text-[#FFED00]">
            {user?.name?.charAt(0)}{user?.surname?.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg">{user?.name} {user?.surname}</p>
            <p className="text-gray-500 text-sm">{user?.id}</p>
            {user?.email && <p className="text-gray-400 text-xs">{user?.email}</p>}
          </div>
        </div>
      </div>

      {/* QR tessera — sempre visibile, grande */}
      <div className="card flex flex-col items-center py-5 gap-3">
        <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          <QRCodeSVG value={user?.id ?? ''} size={160} level="H" />
        </div>
        <p className="font-mono font-black text-gray-900 text-2xl tracking-widest">{user?.id}</p>
        <p className="text-gray-400 text-sm font-medium">Mostra alla cassa</p>
      </div>

      {/* Dati anagrafici */}
      <div className="card">
        <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-3">Dati anagrafici</p>
        {[
          { label: 'Codice Fiscale', value: user?.cf },
          { label: 'Email', value: user?.email || '—' },
          { label: 'Iscritto dal', value: formatDate(user?.created_at) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className="text-gray-900 text-sm font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Storico ricariche */}
      <div className="card">
        <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-3">
          Storico ricariche ({recharges.length})
        </p>
        {recharges.length === 0 ? (
          <p className="text-gray-400 text-sm">Nessuna ricarica</p>
        ) : (
          <div className="space-y-1">
            {recharges.slice(0, 5).map(tx => (
              <div key={tx.id} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-600 text-sm">{formatDate(tx.created_at)}</span>
                <span className="text-green-600 font-semibold text-sm">+{formatEur(tx.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy */}
      <div className="card">
        <button className="flex items-center justify-between w-full" onClick={() => setShowPrivacy(!showPrivacy)}>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-gray-400" />
            <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Consensi Privacy</p>
          </div>
          {showPrivacy
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />
          }
        </button>
        {showPrivacy && (
          <div className="mt-3 space-y-3">
            {privacyFields.map(({ key, label, locked }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700 text-sm">{label}</span>
                <button
                  disabled={locked}
                  onClick={() => !locked && togglePrivacy(key)}
                  className={`w-11 h-6 rounded-full transition-colors ${
                    user?.[key] ? 'bg-black' : 'bg-gray-200'
                  } ${locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white mx-1 transition-transform shadow ${
                    user?.[key] ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors font-semibold"
      >
        <LogOut size={18} /> Esci dall'account
      </button>
    </div>
  )
}
