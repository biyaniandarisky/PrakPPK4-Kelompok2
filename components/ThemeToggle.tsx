'use client'

import { useRouter } from 'next/navigation'
import { toggleTheme } from '@/app/actions/theme'

export default function ThemeToggle({ currentTheme }: { currentTheme: string }) {
  const router = useRouter()

  const handleToggle = async () => {
    await toggleTheme(currentTheme)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      className="px-3 py-2 border rounded-md hover:opacity-80 transition cursor-pointer"
    >
      {currentTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
    </button>
  )
}