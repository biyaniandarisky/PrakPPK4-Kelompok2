// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // F1: Verifikasi password hash
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // F3: Buat session
    await createSession(user.id)

    return NextResponse.json({
      id: user.id,
      nama: user.nama,
      email: user.email,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}