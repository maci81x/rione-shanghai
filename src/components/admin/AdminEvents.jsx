import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { formatEur, formatEventDate } from '../../utils/format'
import { Plus, Edit2, Trash2, Users, XCircle, CheckCircle } from 'lucide-react'
import Modal from '../common/Modal'

const EMPTY_EVENT = { title: '', event_date: '', price: '', description: '', spots: 100, sumup_link: '', sold_out: false }
const EMPTY_GADGET = { name: '', price: '', emoji: '🎁', active: true }

export default function AdminEvents() {
  const { events, gadgets, eventRegistrations, users, addEvent, updateEvent, deleteEvent, addGadget, updateGadget, deleteGadget } = useStore()
  const [tab, setTab] = useState('eventi')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_EVENT)
  const [editId, setEditId] = useState(null)
  const [viewRegs, setViewRegs] = useState(null)

  const openCreate = () => { setForm(tab === 'eventi' ? EMPTY_EVENT : EMPTY_GADGET); setEditId(null); setModal('form') }
  const openEdit = (item) => {
    setForm({ ...item, event_date: item.event_date ? new Date(item.event_date).toISOString().slice(0, 16) : '' })
    setEditId(item.id); setModal('form')
  }

  const handleSave = () => {
    if (tab === 'eventi') {
      const data = { ...form, price: +form.price, spots: +form.spots }
      editId ? updateEvent(editId, data) : addEvent(data)
    } else {
      const data = { ...form, price: +form.price }
      editId ? updateGadget(editId, data) : addGadget(data)
    }
    setModal(null)
  }

  const handleDelete = (id) => {
    if (!confirm('Eliminare?')) return
    tab === 'eventi' ? deleteEvent(id) : deleteGadget(id)
  }

  const getRegs = (event_id) => eventRegistrations.filter(r => r.event_id === event_id)
  const getUserName = (uid) => { const u = users.find(u => u.id === uid); return u ? `${u.name} ${u.surname}` : uid }

  return (
    <div className="pb-8">
      <div className="flex gap-1 mx-4 mt-4 mb-3 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
        {[{ k: 'eventi', l: 'Eventi' }, { k: 'gadget', l: 'Gadget' }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === k ? 'bg-black text-[#FFED00]' : 'text-gray-500 hover:text-gray-700'
            }`}>{l}</button>
        ))}
      </div>
      <div className="px-4 mb-3">
        <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-1 py-2 px-4">
          <Plus size={15} /> Nuovo {tab === 'eventi' ? 'evento' : 'gadget'}
        </button>
      </div>

      <div className="px-4 space-y-3">
        {tab === 'eventi' && events.map(ev => {
          const regs = getRegs(ev.id)
          return (
            <div key={ev.id} className="card">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{ev.title}</h3>
                    {ev.sold_out && (
                      <span className="text-xs bg-red-50 border border-red-200 text-red-600 px-2 py-0.5 rounded-full font-semibold">Esaurito</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5">{formatEventDate(ev.event_date)}</p>
                  <p className="text-gray-900 font-bold text-sm mt-1">
                    {ev.price > 0 ? formatEur(ev.price) : 'Gratis'}
                  </p>
                  <button
                    onClick={() => setViewRegs(viewRegs === ev.id ? null : ev.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 mt-1"
                  >
                    <Users size={12} /> {regs.length} iscritti
                  </button>
                  {viewRegs === ev.id && (
                    <div className="mt-2 space-y-1">
                      {regs.length === 0
                        ? <p className="text-gray-400 text-xs">Nessun iscritto</p>
                        : regs.map(r => (
                          <p key={r.user_id} className="text-gray-600 text-xs">
                            {getUserName(r.user_id)} — {formatEur(r.paid_amount)}
                          </p>
                        ))
                      }
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button onClick={() => openEdit(ev)} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"><Edit2 size={14} /></button>
                  <button
                    onClick={() => updateEvent(ev.id, { sold_out: !ev.sold_out })}
                    className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-amber-600"
                  >
                    {ev.sold_out ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  </button>
                  <button onClick={() => handleDelete(ev.id)} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          )
        })}

        {tab === 'gadget' && gadgets.map(g => (
          <div key={g.id} className="card flex items-center gap-3">
            <span className="text-3xl">{g.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{g.name}</p>
              <p className="text-gray-700 font-bold">{formatEur(g.price)}</p>
              {!g.active && <span className="text-xs text-gray-400">inattivo</span>}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => openEdit(g)} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"><Edit2 size={14} /></button>
              <button
                onClick={() => updateGadget(g.id, { active: !g.active })}
                className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-amber-600"
              >
                {g.active ? <XCircle size={14} /> : <CheckCircle size={14} />}
              </button>
              <button onClick={() => handleDelete(g.id)} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modal === 'form' && (
        <Modal title={`${editId ? 'Modifica' : 'Nuovo'} ${tab === 'eventi' ? 'evento' : 'gadget'}`} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {tab === 'eventi' ? (
              <>
                <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Titolo</label><input className="input text-sm" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
                <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Data e ora</label><input className="input text-sm" type="datetime-local" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} /></div>
                <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Prezzo (€)</label><input className="input text-sm" inputMode="decimal" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Posti disponibili</label><input className="input text-sm" inputMode="numeric" value={form.spots} onChange={e => setForm(f => ({ ...f, spots: e.target.value }))} /></div>
                <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Descrizione</label><textarea className="input text-sm h-20 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
                <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Link SumUp</label><input className="input text-sm" type="url" value={form.sumup_link} onChange={e => setForm(f => ({ ...f, sumup_link: e.target.value }))} /></div>
              </>
            ) : (
              <>
                <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Nome</label><input className="input text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Emoji</label><input className="input text-sm" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} /></div>
                <div><label className="text-gray-500 text-xs mb-1 block font-semibold">Prezzo (€)</label><input className="input text-sm" inputMode="decimal" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              </>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Annulla</button>
              <button onClick={handleSave} className="btn-primary flex-1">Salva</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
