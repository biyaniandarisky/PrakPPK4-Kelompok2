// lib/budget-access.ts
// SRS014: semua akses budget WAJIB lewat helper ini, sehingga filter userId
// tidak mungkin terlupa. Update/delete memakai updateMany/deleteMany dengan
// where { id, userId } agar pengecekan kepemilikan atomik (tanpa celah
// "cek dulu, ubah kemudian").
import { prisma } from '@/lib/prisma'
import type { BudgetInput } from '@/lib/validators/budget'

export function listOwnedBudgets(userId: number) {
  return prisma.budget.findMany({
    where: { userId },
    orderBy: { periode: 'desc' },
  })
}

export function getOwnedBudget(id: string, userId: number) {
  return prisma.budget.findFirst({ where: { id, userId } })
}

export function getOwnedBudgetByPeriode(periode: string, userId: number) {
  return prisma.budget.findFirst({ where: { periode, userId } })
}

export async function updateOwnedBudget(
  id: string,
  userId: number,
  data: BudgetInput
) {
  const result = await prisma.budget.updateMany({
    where: { id, userId },
    data: { periode: data.periode, nominal: data.nominal },
  })
  if (result.count === 0) return null
  return getOwnedBudget(id, userId)
}

export async function deleteOwnedBudget(id: string, userId: number) {
  const result = await prisma.budget.deleteMany({ where: { id, userId } })
  return result.count > 0
}
