// lib/api-helpers.ts
// Helper kecil yang dipakai bersama oleh route API (transaksi & budget).
import { NextResponse } from 'next/server'
import type { ZodError } from 'zod'

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Sengaja 404 (bukan 403) untuk data milik user lain, supaya keberadaan
// data orang lain tidak bisa ditebak lewat perbedaan respons.
export function notFound(message = 'Data tidak ditemukan') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function badRequest(message: string, fields?: Record<string, string>) {
  return NextResponse.json({ error: message, fields }, { status: 400 })
}

// Zod v4: gunakan `.issues` (properti `.errors` sudah dihapus).
export function validationError(error: ZodError) {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    if (!(key in fields)) fields[key] = issue.message
  }
  const first = error.issues[0]?.message ?? 'Data tidak valid'
  return badRequest(first, fields)
}

// Body bukan JSON valid -> undefined (bukan melempar error 500).
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json()
  } catch {
    return undefined
  }
}
