// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LogoutButton from './logout-button'
import TransactionSection from './transaction-section'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Halo, {user?.nama}</h1>
      <p className="text-gray-600">Email: {user.email}</p>
      <LogoutButton />
      <TransactionSection />
    </div>
  )
}