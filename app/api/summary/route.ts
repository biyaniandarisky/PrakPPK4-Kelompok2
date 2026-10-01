import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const awalBulan = new Date(now.getFullYear(), now.getMonth(), 1);
  const awalBulanDepan = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [userData, pemasukan, pengeluaran, pengeluaranBulan] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { budgetBulanan: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, tipe: "PEMASUKAN" },
      _sum: { nominal: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, tipe: "PENGELUARAN" },
      _sum: { nominal: true },
    }),
    prisma.transaction.aggregate({
      where: {
        userId: user.id,
        tipe: "PENGELUARAN",
        tanggal: { gte: awalBulan, lt: awalBulanDepan },
      },
      _sum: { nominal: true },
    }),
  ]);

  const totalPemasukan = Number(pemasukan._sum.nominal ?? 0);
  const totalPengeluaran = Number(pengeluaran._sum.nominal ?? 0);

  return NextResponse.json({
    totalPemasukan,
    totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
    budgetBulanan: Number(userData?.budgetBulanan ?? 0),
    pengeluaranBulanIni: Number(pengeluaranBulan._sum.nominal ?? 0),
  });
}