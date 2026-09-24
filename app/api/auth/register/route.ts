// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'

const registerSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nama, email, password } = registerSchema.parse(body)

    // Cek email sudah terdaftar
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // F1: Hash password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { nama, email, password: hashedPassword },
    })

    // F3: Auto-login setelah register
    await createSession(user.id)

    return NextResponse.json(
      { id: user.id, nama: user.nama, email: user.email },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}