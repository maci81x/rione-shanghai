import { useState } from 'react'
import BottomNav from '../components/common/BottomNav'
import PageHeader from '../components/common/PageHeader'
import UserHome from '../components/user/UserHome'
import UserRecharge from '../components/user/UserRecharge'
import UserMovements from '../components/user/UserMovements'
import UserEventsGadgets from '../components/user/UserEventsGadgets'
import UserProfile from '../components/user/UserProfile'
import { Home, Wallet, ArrowUpDown, CalendarDays, User } from 'lucide-react'

const TABS = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'ricarica', label: 'Ricarica', icon: Wallet },
  { key: 'movimenti', label: 'Movimenti', icon: ArrowUpDown },
  { key: 'eventi', label: 'Eventi', icon: CalendarDays },
  { key: 'profilo', label: 'Profilo', icon: User },
]

const TITLES = {
  home: 'Rione Shanghai',
  ricarica: 'Ricarica saldo',
  movimenti: 'I miei movimenti',
  eventi: 'Eventi & Gadget',
  profilo: 'Il mio profilo',
}

export default function UserApp() {
  const [tab, setTab] = useState('home')

  return (
    <div className="max-w-lg mx-auto min-h-screen">
      <PageHeader title={TITLES[tab]} subtitle={tab === 'home' ? '🏮 Sistema prepagato' : undefined} />
      <main>
        {tab === 'home' && <UserHome onNav={setTab} />}
        {tab === 'ricarica' && <UserRecharge />}
        {tab === 'movimenti' && <UserMovements />}
        {tab === 'eventi' && <UserEventsGadgets />}
        {tab === 'profilo' && <UserProfile />}
      </main>
      <BottomNav tabs={TABS} active={tab} onChange={setTab} />
    </div>
  )
}
