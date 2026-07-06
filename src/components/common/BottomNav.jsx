export default function BottomNav({ tabs, active, onChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40 flex pb-safe"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{ minHeight: '52px' }}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors active:scale-95 ${
            active === key
              ? 'text-[#FFED00]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <Icon size={22} />
          <span className="text-[10px] font-semibold">{label}</span>
        </button>
      ))}
    </nav>
  )
}
