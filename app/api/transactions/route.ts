import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { tanggal: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tipe, nominal, kategori, tanggal, keterangan } = body;

  if (!tipe || !nominal || !kategori || !tanggal) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      tipe,
      nominal,
      kategori,
      tanggal: new Date(tanggal),
      keterangan,
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}