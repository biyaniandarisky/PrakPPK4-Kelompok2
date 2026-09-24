import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pemasukan = await prisma.transaction.aggregate({
    where: { userId: user.id, tipe: "PEMASUKAN" },
    _sum: { nominal: true },
  });

  const pengeluaran = await prisma.transaction.aggregate({
    where: { userId: user.id, tipe: "PENGELUARAN" },
    _sum: { nominal: true },
  });

  const totalPemasukan = Number(pemasukan._sum.nominal ?? 0);
  const totalPengeluaran = Number(pengeluaran._sum.nominal ?? 0);

  return NextResponse.json({
    totalPemasukan,
    totalPengeluaran,
    saldo: totalPemasukan - totalPengeluaran,
  });
}