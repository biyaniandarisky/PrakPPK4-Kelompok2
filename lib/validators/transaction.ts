// lib/validators/transaction.ts
import { z } from 'zod'

export const MAX_NOMINAL = 999_999_999_999

export const transactionInputSchema = z.object({
  tipe: z.enum(['PEMASUKAN', 'PENGELUARAN'], {
    error: 'Tipe harus PEMASUKAN atau PENGELUARAN',
  }),
  nominal: z.coerce
    .number({ error: 'Nominal harus berupa angka' })
    .positive('Nominal harus lebih dari 0')
    .max(MAX_NOMINAL, 'Nominal terlalu besar'),
  kategori: z
    .string({ error: 'Kategori wajib diisi' })
    .trim()
    .min(1, 'Kategori wajib diisi')
    .max(50, 'Kategori maksimal 50 karakter'),
  tanggal: z
    .string({ error: 'Tanggal wajib diisi' })
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Tanggal tidak valid')
    .transform((v) => new Date(v)),
  keterangan: z
    .string()
    .trim()
    .max(255, 'Keterangan maksimal 255 karakter')
    .nullish()
    .transform((v) => (v ? v : null)),
})

export type TransactionInput = z.infer<typeof transactionInputSchema>
