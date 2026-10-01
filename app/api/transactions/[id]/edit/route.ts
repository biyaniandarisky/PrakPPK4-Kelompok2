// app/api/transactions/[id]/edit/route.ts  (FILE BARU - SRS013)
// Endpoint khusus edit transaksi via AJAX. Route lama tidak diubah.
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  badRequest,
  notFound,
  readJson,
  unauthorized,
  validationError,
} from "@/lib/api-helpers";
import { transactionInputSchema } from "@/lib/validators/transaction";

// Next 16: params adalah Promise -> wajib di-await.
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await params;
  if (!id) return notFound("Transaksi tidak ditemukan");

  const body = await readJson(req);
  if (body === undefined) return badRequest("Body request bukan JSON valid");

  const parsed = transactionInputSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  try {
    // where { id, userId }: hanya bisa mengubah transaksi milik sendiri.
    const updated = await prisma.transaction.update({
      where: { id, userId: user.id },
      data: parsed.data,
    });
    return NextResponse.json({ ...updated, nominal: Number(updated.nominal) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return notFound("Transaksi tidak ditemukan");
    }
    console.error("PUT /api/transactions/[id]/edit error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
