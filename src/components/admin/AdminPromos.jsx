import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import Modal from '../common/Modal'

const EMPTY = { title: '', type: 'evento', target_id: '', discount_pct: 10, code: '', active: true }

export default function AdminPromos() {
  const { promotions, events, gadgets, addPromotion, updatePromotion, deletePromotion } = useStore()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const targets = form.type === 'evento' ? events : gadgets.filter(g => g.active)

  const getTargetName = (p) => {
    if (p.type === 'evento') return events.find(e => e.id === p.target_id)?.title ?? p.target_id
    return gadgets.find(g => g.id === p.target_id)?.name ?? p.target_id
  }

  const handleSave = () => {
    if (!form.title || !form.target_id || !form.code) return
    addPromotion({ ...form, discount_pct: +form.discount_pct })
    setModal(false); setForm(EMPTY)
  }

  return (
    <div className="p-4 pb-8 space-y-3">
      <button onClick={() => setModal(true)} className="btn-primary text-sm flex items-center gap-1 py-2 px-4">
        <Plus size={15} /> Nuova promo
      </button>

      {promotions.length === 0 && <p className="text-gray-400 text-center py-8">Nessuna promozione</p>}
      {promotions.map(p => (
        <div key={p.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900">{p.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  p.active
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {p.active ? 'attiva' : 'inattiva'}
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {p.type === 'evento' ? '🎉' : '🛍️'} {getTargetName(p)} · -{p.discount_pct}%
              </p>
              <p className="text-gray-400 text-xs">
                Codice: <span className="font-mono text-gray-700">{p.code}</span>
              </p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => updatePromotion(p.id, { active: !p.active })}
                className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-amber-600">
                {p.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
              </button>
              <button onClick={() => { if (confirm('Eliminare?')) deletePromotion(p.id) }}
                className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {modal && (
        <Modal title="Nuova promozione" onClose={() => { setModal(false); setForm(EMPTY) }} size="sm">
          <div className="space-y-3">
            <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Titolo</label><input className="input text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-semibold">Tipo</label>
              <select className="input text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, target_id: '' }))}>
                <option value="evento">Evento</option>
                <option value="gadget">Gadget</option>
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-semibold">{form.type === 'evento' ? 'Evento' : 'Gadget'}</label>
              <select className="input text-sm" value={form.target_id} onChange={e => setForm(f => ({ ...f, target_id: e.target.value }))}>
                <option value="">Seleziona...</option>
                {targets.map(t => <option key={t.id} value={t.id}>{t.title || t.name}</option>)}
              </select>
            </div>
            <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Sconto %</label><input className="input text-sm" type="number" min="1" max="100" inputMode="numeric" value={form.discount_pct} onChange={e => setForm(f => ({ ...f, discount_pct: e.target.value }))} /></div>
            <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Codice promo</label><input className="input text-sm uppercase" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setModal(false); setForm(EMPTY) }} className="btn-secondary flex-1">Annulla</button>
              <button onClick={handleSave} className="btn-primary flex-1">Salva</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
