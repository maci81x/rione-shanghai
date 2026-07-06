import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { formatEur, exportCSV } from '../../utils/format'
import { Plus, Edit2, Trash2, Download, ToggleLeft, ToggleRight } from 'lucide-react'
import Modal from '../common/Modal'

const ROLES = ['Bar', 'Cucina', 'Gadget', 'Generale']
const EMPTY = { id: '', name: '', surname: '', pin: '', role: 'Bar', active: true }

export default function AdminStaff() {
  const { staff, transactions, addStaff, updateStaff, deleteStaff } = useStore()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const openCreate = () => { setForm(EMPTY); setEditId(null); setModal('form') }
  const openEdit = (m) => { setForm({ ...m }); setEditId(m.id); setModal('form') }

  const handleSave = () => {
    if (!form.id || !form.name || !form.pin) return
    editId ? updateStaff(editId, form) : addStaff(form)
    setModal(null)
  }

  const getStaffTx = (id) => transactions.filter(t => t.staff_id === id && !t.voided)
  const getTotale = (id) => getStaffTx(id).reduce((s, t) => s + Math.abs(t.amount), 0)

  const handleExport = () => {
    exportCSV(staff.map(m => ({
      id: m.id, nome: m.name, cognome: m.surname, ruolo: m.role,
      attivo: m.active, operazioni: getStaffTx(m.id).length, totale: getTotale(m.id),
      iscritto_dal: m.created_at
    })), 'staff-shanghai.csv')
  }

  return (
    <div className="pb-8">
      <div className="px-4 pt-4 flex gap-2 mb-3">
        <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-1 py-2 px-4">
          <Plus size={15} /> Nuovo staff
        </button>
        <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-1">
          <Download size={15} /> CSV
        </button>
      </div>

      <div className="px-4 space-y-3">
        {staff.map(m => {
          const txs = getStaffTx(m.id)
          return (
            <div key={m.id} className="card">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  m.active ? 'bg-black text-[#FFED00]' : 'bg-gray-100 text-gray-500'
                }`}>
                  {m.name.charAt(0)}{m.surname.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{m.name} {m.surname}</p>
                  <p className="text-gray-400 text-xs">{m.id} · {m.role}</p>
                  <p className="text-gray-400 text-xs">{txs.length} op. · {formatEur(getTotale(m.id))}</p>
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    m.active ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {m.active ? 'attivo' : 'inattivo'}
                  </span>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(m)} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"><Edit2 size={13} /></button>
                    <button onClick={() => updateStaff(m.id, { active: !m.active })} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-amber-50 hover:text-amber-600">
                      {m.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                    </button>
                    <button onClick={() => { if (confirm('Eliminare?')) deleteStaff(m.id) }} className="p-1.5 bg-gray-100 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {modal === 'form' && (
        <Modal title={editId ? 'Modifica staff' : 'Nuovo staff'} onClose={() => setModal(null)} size="sm">
          <div className="space-y-3">
            {[
              { key: 'id', label: 'Codice (es. STAFF-04)', upper: true, disabled: !!editId },
              { key: 'name', label: 'Nome' },
              { key: 'surname', label: 'Cognome' },
              { key: 'pin', label: 'PIN', type: 'password', inputMode: 'numeric', maxLength: 6 },
            ].map(({ key, label, type, upper, disabled, inputMode, maxLength }) => (
              <div key={key}>
                <label className="text-gray-500 text-xs mb-1 block font-semibold">{label}</label>
                <input
                  className={`input text-sm ${disabled ? 'opacity-50 bg-gray-50' : ''}`}
                  disabled={disabled} type={type || 'text'}
                  inputMode={inputMode} maxLength={maxLength}
                  value={form[key] || ''}
                  onChange={e => setForm(f => ({ ...f, [key]: upper ? e.target.value.toUpperCase() : e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label className="text-gray-500 text-xs mb-1 block font-semibold">Ruolo</label>
              <select className="input text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
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
