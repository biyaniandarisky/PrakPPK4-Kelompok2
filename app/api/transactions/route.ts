import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { searchParams } = new URL(req.url);
  const tipe = searchParams.get("tipe");
  const kategori = searchParams.get("kategori");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const whereCondition: any = {
    userId: user.id,
  };

  if (tipe && tipe !== "ALL") {
    whereCondition.tipe = tipe;
  }

  if (kategori && kategori !== "ALL") {
    whereCondition.kategori = kategori;
  }

  if (startDate || endDate) {
    whereCondition.tanggal = {};
    if (startDate) {
      whereCondition.tanggal.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereCondition.tanggal.lte = end;
    }
  }

  const transactions = await prisma.transaction.findMany({
    where: whereCondition,
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