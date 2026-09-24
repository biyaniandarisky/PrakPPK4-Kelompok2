'use server'

import { cookies } from 'next/headers'

export async function toggleTheme(currentTheme: string) {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

  const cookieStore = await cookies()
  cookieStore.set('theme', newTheme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, 
  })

  return newTheme
}