import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// PUT - update budget
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bulan, tahun, nominal, kategori } = body;

  const result = await prisma.budget.updateMany({
    where: { id: params.id, userId: user.id }, // cuma boleh edit punya sendiri
    data: { bulan, tahun, nominal, kategori: kategori || null },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Budget tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// DELETE - hapus budget
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.budget.deleteMany({
    where: { id: params.id, userId: user.id },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Budget tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}