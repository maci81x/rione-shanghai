import { useState } from 'react'
import { useAuth } from '../../store/useAuth'
import { useStore } from '../../store/useStore'
import { ADMIN_CREDENTIALS } from '../../data/seed'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import DragonLogo from '../common/DragonLogo'

export default function LoginScreen() {
  const [mode, setMode] = useState('utente')
  const [code, setCode] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuth(s => s.login)
  const { users, staff } = useStore()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))

    if (mode === 'admin') {
      if (code.toUpperCase() === ADMIN_CREDENTIALS.code && pin === ADMIN_CREDENTIALS.pin) {
        login({ role: 'admin', id: 'admin', name: 'Admin' })
      } else {
        setError('Codice o PIN admin non validi')
      }
    } else if (mode === 'staff') {
      const member = staff.find(s => s.id.toUpperCase() === code.toUpperCase() && s.pin === pin && s.active)
      if (member) {
        login({ role: 'staff', id: member.id, name: `${member.name} ${member.surname}`, staffRole: member.role })
      } else {
        setError('Codice o PIN non validi, oppure operatore disattivato')
      }
    } else {
      const user = users.find(u => u.id.toUpperCase() === code.toUpperCase() && u.pin === pin)
      if (user) {
        if (user.blocked) {
          setError('Account bloccato. Contatta lo staff.')
        } else {
          login({ role: 'utente', id: user.id, name: `${user.name} ${user.surname}` })
        }
      } else {
        setError('Codice card o PIN non validi')
      }
    }
    setLoading(false)
  }

  const placeholder = {
    utente: 'Codice card (es. SH-001)',
    staff: 'Codice operatore (es. STAFF-01)',
    admin: 'Codice admin (es. ADMIN)',
  }[mode]

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <DragonLogo size={80} />
        </div>
        <h1 className="text-3xl font-black text-black tracking-tight">Rione Shanghai</h1>
        <p className="text-gray-500 text-sm mt-1">Sistema Credito Prepagato</p>
      </div>

      {/* Mode selector — attivo = nero + giallo */}
      <div className="flex gap-1 mb-6 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
        {[
          { key: 'utente', label: 'Utente' },
          { key: 'staff', label: 'Staff' },
          { key: 'admin', label: 'Admin' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key); setError(''); setCode(''); setPin('') }}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === key ? 'bg-black text-[#FFED00]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-3">
        <input
          className="input uppercase font-mono tracking-wider"
          placeholder={placeholder}
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          autoCapitalize="characters"
          autoComplete="off"
        />
        <div className="relative">
          <input
            className="input pr-12 font-mono tracking-widest"
            placeholder="PIN"
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center font-medium">{error}</p>
        )}

        {/* Bottone accedi: sfondo nero, testo giallo */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <LogIn size={18} />
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>

      {/* Demo hint */}
      <div className="mt-8 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 text-center max-w-sm w-full shadow-sm">
        <p className="font-semibold text-gray-700 mb-1">Credenziali demo</p>
        <p>Utente: <span className="font-mono text-gray-900">SH-001</span> / PIN <span className="font-mono text-gray-900">1234</span></p>
        <p>Staff: <span className="font-mono text-gray-900">STAFF-01</span> / PIN <span className="font-mono text-gray-900">1111</span></p>
        <p>Admin: <span className="font-mono text-gray-900">ADMIN</span> / PIN <span className="font-mono text-gray-900">0000</span></p>
      </div>
    </div>
  )
}
