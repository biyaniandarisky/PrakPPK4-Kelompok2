// app/api/budget/usage/route.ts
// SRS010: hitung penggunaan anggaran
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bulan = Number(searchParams.get("bulan")) || new Date().getMonth() + 1;
  const tahun = Number(searchParams.get("tahun")) || new Date().getFullYear();

  // Ambil budget user untuk bulan/tahun ini
  const budget = await prisma.budget.findUnique({
    where: {
      userId_bulan_tahun: { userId: user.id, bulan, tahun },
    },
  });

  // Hitung total PENGELUARAN bulan ini
  const start = new Date(tahun, bulan - 1, 1);
  const end = new Date(tahun, bulan, 1);

  const agg = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      tipe: "PENGELUARAN",
      tanggal: { gte: start, lt: end },
    },
    _sum: { nominal: true },
  });

  const terpakai = Number(agg._sum.nominal ?? 0);
  const totalBudget = budget ? Number(budget.nominal) : 0;
  const sisa = totalBudget - terpakai;
  const persentase =
    totalBudget > 0 ? Math.round((terpakai / totalBudget) * 10000) / 100 : 0;

  return NextResponse.json({
    totalBudget,
    terpakai,
    sisa,
    persentase,
    bulan,
    tahun,
    hasBudget: !!budget,
  });
}