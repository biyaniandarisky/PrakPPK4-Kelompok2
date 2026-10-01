import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - lihat semua budget milik user (opsional filter bulan & tahun)
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bulan = searchParams.get("bulan");
  const tahun = searchParams.get("tahun");

  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      ...(bulan && { bulan: Number(bulan) }),
      ...(tahun && { tahun: Number(tahun) }),
    },
    orderBy: [{ tahun: "desc" }, { bulan: "desc" }],
  });

  return NextResponse.json(budgets);
}

// POST - tambah budget baru
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bulan, tahun, nominal, kategori } = body;

  if (!bulan || !tahun || !nominal) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  if (bulan < 1 || bulan > 12) {
    return NextResponse.json({ error: "Bulan harus antara 1-12" }, { status: 400 });
  }

  try {
    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        bulan: Number(bulan),
        tahun: Number(tahun),
        nominal,
        kategori: kategori || null,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Budget untuk bulan, tahun, dan kategori ini sudah ada" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Gagal menyimpan budget" }, { status: 500 });
  }
}