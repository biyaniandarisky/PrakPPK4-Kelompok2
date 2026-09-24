// lib/auth.ts
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import crypto from 'crypto'

const SESSION_COOKIE = 'session_token'
const SESSION_DURATION_DAYS = 7 // F3: session bertahan 7 hari

// F3: Buat session baru & set cookie
export async function createSession(userId: number) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  )

  await prisma.session.create({
    data: { userId, token, expiresAt },
  })

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  return token
}

// F3: Ambil user yang sedang login (DIPAKAI ORANG 2 & 3!)
export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) return null

  // Cek kedaluwarsa
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  // Kembalikan user TANPA password (jangan bocorkan!)
  const { password, ...userWithoutPassword } = session.user
  return userWithoutPassword
}

// F2: Logout — hapus session dari DB & cookie
export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  cookies().delete(SESSION_COOKIE)
}