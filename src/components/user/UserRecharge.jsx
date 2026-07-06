import { useStore } from '../../store/useStore'
import { ExternalLink, Info } from 'lucide-react'

export default function UserRecharge() {
  const { sumupLinks } = useStore()
  const presets = sumupLinks.filter(l => ['recharge_10', 'recharge_20', 'recharge_50'].includes(l.kind))
  const customs = sumupLinks.filter(l => l.kind === 'custom')

  return (
    <div className="p-4 pb-nav">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex gap-2">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Come ricaricare</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Scegli l'importo e clicca il link SumUp</li>
            <li>Paga con carta o Google/Apple Pay</li>
            <li>Mostra la ricevuta allo staff o all'admin</li>
            <li>Il saldo viene aggiornato entro pochi minuti</li>
          </ol>
        </div>
      </div>

      <h2 className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-2">Importi standard</h2>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {presets.map(link => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex flex-col items-center py-5 gap-2 hover:border-black/20 transition-colors cursor-pointer group"
          >
            <span className="text-2xl font-black text-gray-900 group-hover:text-black">
              {link.label.replace('Ricarica ', '')}
            </span>
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <ExternalLink size={12} /> Paga
            </span>
          </a>
        ))}
      </div>

      {customs.length > 0 && (
        <>
          <h2 className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-2">Importi personalizzati</h2>
          <div className="space-y-2">
            {customs.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex items-center justify-between hover:border-black/20 transition-colors"
              >
                <span className="text-gray-900 font-medium">{link.label}</span>
                <span className="text-gray-600 text-sm flex items-center gap-1">
                  <ExternalLink size={14} /> Apri
                </span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
