'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// F7: Mengambil transaksi HANYA milik user yang sedang login
export async function getMyTransactions() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  return await prisma.transaction.findMany({
    where: {
      userId: user.id, // user.id bernilai Int (cocok dengan schema)
    },
    orderBy: {
      tanggal: 'desc',
    },
  })
}

// F7: Menambah transaksi yang terikat ke userId
export async function createTransaction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const tipe = formData.get('tipe') as 'PEMASUKAN' | 'PENGELUARAN'
  const nominal = parseFloat(formData.get('nominal') as string)
  const kategori = formData.get('kategori') as string
  const tanggal = new Date(formData.get('tanggal') as string)
  const keterangan = formData.get('keterangan') as string || null

  return await prisma.transaction.create({
    data: {
      tipe,
      nominal,
      kategori,
      tanggal,
      keterangan,
      userId: user.id, // Mengikat ke user id
    },
  })
}

// F7: Menghapus transaksi (Akses milik sendiri)
export async function deleteTransaction(transactionId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const deleted = await prisma.transaction.deleteMany({
    where: {
      id: transactionId,
      userId: user.id, // Mencegah hapus data orang lain
    },
  })

  if (deleted.count === 0) {
    throw new Error('Transaksi tidak ditemukan atau bukan milik Anda')
  }
}