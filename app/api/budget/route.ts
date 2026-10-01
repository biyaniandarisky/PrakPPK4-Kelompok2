import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth"; // samakan dengan import di summary/route.ts

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const budget = Number(body.budgetBulanan);

  if (!Number.isFinite(budget) || budget < 0) {
    return NextResponse.json({ error: "Anggaran tidak valid" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { budgetBulanan: budget },
  });

  return NextResponse.json({ budgetBulanan: budget });
}