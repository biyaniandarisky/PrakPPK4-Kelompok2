// app/dashboard/page.tsx
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LogoutButton from './logout-button'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Halo, {user.nama}! 👋</h1>
      <p className="text-gray-600">Email: {user.email}</p>
      <LogoutButton />
    </div>
  )
}

// app/dashboard/logout-button.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      Logout
    </button>
  )
}