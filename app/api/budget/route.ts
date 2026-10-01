// app/api/budget/route.ts
// SRS010: API untuk CRUD budget bulanan
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const budgetSchema = z.object({
  bulan: z.number().int().min(1).max(12),
  tahun: z.number().int().min(2020),
  nominal: z.number().positive("Nominal harus lebih dari 0"),
});

// GET: ambil budget bulan/tahun tertentu
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bulan = Number(searchParams.get("bulan")) || new Date().getMonth() + 1;
  const tahun = Number(searchParams.get("tahun")) || new Date().getFullYear();

  const budget = await prisma.budget.findUnique({
    where: {
      userId_bulan_tahun: { userId: user.id, bulan, tahun },
    },
  });

  return NextResponse.json(budget);
}

// POST: set / update budget (upsert)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bulan, tahun, nominal } = budgetSchema.parse(body);

    const budget = await prisma.budget.upsert({
      where: {
        userId_bulan_tahun: { userId: user.id, bulan, tahun },
      },
      update: { nominal },
      create: { userId: user.id, bulan, tahun, nominal },
    });

    return NextResponse.json(budget);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Budget POST error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// DELETE: hapus budget
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const bulan = Number(searchParams.get("bulan"));
  const tahun = Number(searchParams.get("tahun"));

  if (!bulan || !tahun) {
    return NextResponse.json(
      { error: "Bulan dan tahun wajib diisi" },
      { status: 400 }
    );
  }

  await prisma.budget.delete({
    where: {
      userId_bulan_tahun: { userId: user.id, bulan, tahun },
    },
  });

  return NextResponse.json({ message: "Budget berhasil dihapus" });
}