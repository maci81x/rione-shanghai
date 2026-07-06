import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { useAuth } from '../../store/useAuth'
import { formatEur, formatEventDate } from '../../utils/format'
import { CalendarDays, ShoppingBag, ExternalLink, CheckCircle2 } from 'lucide-react'
import Modal from '../common/Modal'

export default function UserEventsGadgets() {
  const { session } = useAuth()
  const { events, gadgets, promotions, eventRegistrations, chargeUser, registerEvent, users } = useStore()
  const user = users.find(u => u.id === session.id)
  const [tab, setTab] = useState('eventi')
  const [confirm, setConfirm] = useState(null)
  const [result, setResult] = useState(null)

  const activePromos = promotions.filter(p => p.active)
  const getPromo = (type, targetId) => activePromos.find(p => p.type === type && p.target_id === targetId)

  const getEventPrice = (ev) => {
    const promo = getPromo('evento', ev.id)
    if (!promo) return { final: ev.price, promo: null }
    return { final: +(ev.price * (1 - promo.discount_pct / 100)).toFixed(2), promo }
  }

  const getGadgetPrice = (g) => {
    const promo = getPromo('gadget', g.id)
    if (!promo) return { final: g.price, promo: null }
    return { final: +(g.price * (1 - promo.discount_pct / 100)).toFixed(2), promo }
  }

  const isRegistered = (event_id) => eventRegistrations.some(r => r.event_id === event_id && r.user_id === session.id)

  const handlePurchase = (item, type) => { setConfirm({ item, type }); setResult(null) }

  const executeWithCredit = () => {
    const { item, type } = confirm
    const price = type === 'evento' ? getEventPrice(item).final : getGadgetPrice(item).final

    if (price === 0) {
      if (type === 'evento') registerEvent({ event_id: item.id, user_id: session.id, paid_amount: 0 })
      setResult({ ok: true })
      setConfirm(null)
      return
    }

    const res = chargeUser({
      user_id: session.id, amount: price,
      category: type === 'evento' ? 'evento' : 'gadget',
      operator: 'App Utente', note: item.title || item.name
    })

    if (res.ok && type === 'evento') registerEvent({ event_id: item.id, user_id: session.id, paid_amount: price })
    setResult(res)
    if (res.ok) setConfirm(null)
  }

  return (
    <div className="pb-nav">
      {/* Tabs eventi/gadget */}
      <div className="flex gap-1 mx-4 mt-4 mb-4 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
        {[
          { k: 'eventi', label: 'Eventi', icon: CalendarDays },
          { k: 'gadget', label: 'Gadget', icon: ShoppingBag },
        ].map(({ k, label, icon: Icon }) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === k ? 'bg-black text-[#FFED00]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {tab === 'eventi' && (
        <div className="px-4 space-y-3">
          {events.length === 0 && <p className="text-gray-400 text-center py-8">Nessun evento disponibile</p>}
          {events.sort((a, b) => new Date(a.event_date) - new Date(b.event_date)).map(ev => {
            const { final, promo } = getEventPrice(ev)
            const registered = isRegistered(ev.id)
            const past = new Date(ev.event_date) < new Date()
            return (
              <div key={ev.id} className={`card ${ev.sold_out || past ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900">{ev.title}</h3>
                  <div className="text-right flex-shrink-0">
                    {promo && <p className="text-gray-400 line-through text-xs">{formatEur(ev.price)}</p>}
                    <p className="font-black text-gray-900">{final > 0 ? formatEur(final) : 'Gratis'}</p>
                    {promo && <p className="text-green-600 text-xs font-semibold">-{promo.discount_pct}%</p>}
                  </div>
                </div>
                <p className="text-gray-500 text-xs mb-1">{formatEventDate(ev.event_date)}</p>
                {ev.description && <p className="text-gray-600 text-sm mb-3">{ev.description}</p>}
                <div className="flex gap-2">
                  {registered ? (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <CheckCircle2 size={16} /> Iscritto
                    </div>
                  ) : ev.sold_out || past ? (
                    <span className="text-gray-400 text-sm">{ev.sold_out ? 'Esaurito' : 'Terminato'}</span>
                  ) : (
                    <>
                      <button onClick={() => handlePurchase(ev, 'evento')} className="btn-primary flex-1 py-2 text-sm">
                        {final > 0 ? 'Paga con credito' : 'Iscriviti gratis'}
                      </button>
                      {ev.sumup_link && (
                        <a href={ev.sumup_link} target="_blank" rel="noopener noreferrer"
                          className="btn-secondary py-2 px-3 text-sm flex items-center gap-1">
                          <ExternalLink size={14} /> SumUp
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'gadget' && (
        <div className="px-4 grid grid-cols-2 gap-3">
          {gadgets.filter(g => g.active).map(g => {
            const { final, promo } = getGadgetPrice(g)
            return (
              <div key={g.id} className="card flex flex-col items-center text-center">
                <span className="text-4xl mb-2">{g.emoji}</span>
                <p className="font-semibold text-gray-900 text-sm">{g.name}</p>
                {promo && <p className="text-gray-400 line-through text-xs">{formatEur(g.price)}</p>}
                <p className="font-black text-gray-900 text-lg">{formatEur(final)}</p>
                {promo && <p className="text-green-600 text-xs font-semibold">-{promo.discount_pct}%</p>}
                <button
                  onClick={() => handlePurchase(g, 'gadget')}
                  className="btn-primary w-full mt-3 py-2 text-sm"
                  disabled={user?.balance < final}
                >
                  {user?.balance < final ? 'Saldo insuff.' : 'Acquista'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {confirm && (
        <Modal title="Conferma acquisto" onClose={() => { setConfirm(null); setResult(null) }}>
          <div className="space-y-4">
            <p className="text-gray-600">Stai per acquistare:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="font-bold text-gray-900">{confirm.item.title || confirm.item.name}</p>
              <p className="font-black text-gray-900 text-xl mt-1">
                {formatEur(confirm.type === 'evento' ? getEventPrice(confirm.item).final : getGadgetPrice(confirm.item).final)}
              </p>
            </div>
            <p className="text-gray-500 text-sm">Saldo attuale: <span className="text-gray-900 font-semibold">{formatEur(user?.balance)}</span></p>
            {result && !result.ok && <p className="text-red-600 text-sm font-medium">{result.error}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setConfirm(null); setResult(null) }} className="btn-secondary flex-1">Annulla</button>
              <button onClick={executeWithCredit} className="btn-primary flex-1">Conferma</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
