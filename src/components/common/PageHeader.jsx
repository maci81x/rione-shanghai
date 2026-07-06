import { ChevronLeft } from 'lucide-react'
import DragonLogo from './DragonLogo'

export default function PageHeader({ title, subtitle, onBack, right }) {
  return (
    <header className="bg-black px-4 pb-3 pt-safe flex items-center gap-3 sticky top-0 z-30"
      style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}
    >
      {onBack && (
        <button onClick={onBack} className="text-gray-400 hover:text-[#FFED00] p-1 -ml-1 min-h-[44px] flex items-center">
          <ChevronLeft size={24} />
        </button>
      )}
      <DragonLogo size={26} style={{ color: '#FFED00' }} className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h1 className="font-black text-white text-lg leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-gray-400 text-xs truncate">{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </header>
  )
}
