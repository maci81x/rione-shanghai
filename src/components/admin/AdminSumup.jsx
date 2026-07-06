import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'

export default function AdminSumup() {
  const { sumupLinks, addSumupLink, deleteSumupLink } = useStore()
  const [newLabel, setNewLabel] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const handleAdd = () => {
    if (!newLabel || !newUrl) return
    addSumupLink({ label: newLabel, url: newUrl })
    setNewLabel(''); setNewUrl('')
  }

  const presets = sumupLinks.filter(l => l.kind !== 'custom')
  const customs = sumupLinks.filter(l => l.kind === 'custom')

  return (
    <div className="p-4 pb-8 space-y-4">
      <div className="card">
        <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-3">Link standard</p>
        <div className="space-y-2">
          {presets.map(l => (
            <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-900 font-medium">{l.label}</span>
              <a href={l.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-600 hover:text-black text-sm font-semibold">
                <ExternalLink size={14} /> Apri
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-3">Link personalizzati</p>
        <div className="space-y-2 mb-4">
          {customs.length === 0 && <p className="text-gray-400 text-sm">Nessun link custom</p>}
          {customs.map(l => (
            <div key={l.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{l.label}</p>
                <p className="text-gray-400 text-xs truncate">{l.url}</p>
              </div>
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black">
                <ExternalLink size={15} />
              </a>
              <button onClick={() => deleteSumupLink(l.id)} className="text-gray-300 hover:text-red-600 transition-colors">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Aggiungi link</p>
          <input className="input text-sm" placeholder="Etichetta (es. Ricarica €30)" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
          <input className="input text-sm" placeholder="URL SumUp" type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
          <button
            onClick={handleAdd}
            disabled={!newLabel || !newUrl}
            className="btn-primary w-full text-sm flex items-center justify-center gap-1 disabled:opacity-40 py-2.5"
          >
            <Plus size={15} /> Aggiungi
          </button>
        </div>
      </div>
    </div>
  )
}
