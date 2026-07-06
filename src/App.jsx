import { useAuth } from './store/useAuth'
import LoginScreen from './components/auth/LoginScreen'
import UserApp from './pages/UserApp'
import AdminApp from './pages/AdminApp'
import StaffCash from './components/staff/StaffCash'

export default function App() {
  const { session } = useAuth()

  if (!session) return <LoginScreen />
  if (session.role === 'admin') return <AdminApp />
  if (session.role === 'staff') return <StaffCash />
  return <UserApp />
}
