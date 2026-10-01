// lib/validators/budget.ts
import { z } from 'zod'

export const periodeSchema = z
  .string({ error: 'Periode wajib diisi' })
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Periode harus berformat YYYY-MM')

// userId SENGAJA tidak ada di schema: zod membuang key yang tidak dikenal,
// jadi userId dari body client tidak pernah sampai ke query database.
export const budgetInputSchema = z.object({
  periode: periodeSchema,
  nominal: z.coerce
    .number({ error: 'Nominal harus berupa angka' })
    .positive('Anggaran harus lebih dari 0')
    .max(999_999_999_999, 'Anggaran terlalu besar'),
})

export type BudgetInput = z.infer<typeof budgetInputSchema>

export const budgetIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/, 'ID tidak valid')
