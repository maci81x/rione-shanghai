import { useState } from 'react'
import { useAuth } from '../store/useAuth'
import PageHeader from '../components/common/PageHeader'
import BottomNav from '../components/common/BottomNav'
import AdminDashboard from '../components/admin/AdminDashboard'
import AdminUsers from '../components/admin/AdminUsers'
import AdminMovements from '../components/admin/AdminMovements'
import AdminEvents from '../components/admin/AdminEvents'
import AdminStaff from '../components/admin/AdminStaff'
import AdminSumup from '../components/admin/AdminSumup'
import AdminPromos from '../components/admin/AdminPromos'
import { LayoutDashboard, Users, ArrowUpDown, CalendarDays, UserCheck, CreditCard, Tag, LogOut, Menu, X } from 'lucide-react'

const MAIN_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'utenti', label: 'Utenti', icon: Users },
  { key: 'movimenti', label: 'Movimenti', icon: ArrowUpDown },
  { key: 'eventi', label: 'Catalogo', icon: CalendarDays },
]

const MORE_TABS = [
  { key: 'staff', label: 'Staff', icon: UserCheck },
  { key: 'sumup', label: 'SumUp', icon: CreditCard },
  { key: 'promo', label: 'Promo', icon: Tag },
]

const TITLES = {
  dashboard: 'Dashboard', utenti: 'Gestione Utenti', movimenti: 'Movimenti',
  eventi: 'Catalogo', staff: 'Staff', sumup: 'SumUp Links', promo: 'Promozioni'
}

export default function AdminApp() {
  const { logout } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const [showMore, setShowMore] = useState(false)

  return (
    <div className="max-w-2xl mx-auto min-h-screen">
      <PageHeader
        title={TITLES[tab]}
        subtitle="Admin · Rione Shanghai"
        right={
          <button onClick={logout} className="text-gray-400 hover:text-[#FFED00] p-1.5 transition-colors">
            <LogOut size={18} />
          </button>
        }
      />

      {/* Pannello tab secondari */}
      {showMore && (
        <div className="bg-black border-b border-gray-800 px-4 py-2 flex gap-2">
          {MORE_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setShowMore(false) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                tab === key ? 'bg-[#FFED00] text-black' : 'text-gray-400 hover:text-[#FFED00]'
              }`}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      )}

      <main className="pb-nav">
        {tab === 'dashboard' && <AdminDashboard />}
        {tab === 'utenti' && <AdminUsers />}
        {tab === 'movimenti' && <AdminMovements />}
        {tab === 'eventi' && <AdminEvents />}
        {tab === 'staff' && <AdminStaff />}
        {tab === 'sumup' && <AdminSumup />}
        {tab === 'promo' && <AdminPromos />}
      </main>

      <BottomNav
        tabs={[
          ...MAIN_TABS,
          {
            key: '__more',
            label: 'Altro',
            icon: ({ size }) => showMore ? <X size={size} /> : <Menu size={size} />,
          }
        ]}
        active={MORE_TABS.some(t => t.key === tab) ? '__more' : tab}
        onChange={(k) => {
          if (k === '__more') {
            setShowMore(!showMore)
          } else {
            setTab(k)
            setShowMore(false)
          }
        }}
      />
    </div>
  )
}
