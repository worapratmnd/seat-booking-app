// app/api/seats/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API สำหรับแก้ไข Label ของเก้าอี้
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolved = 'then' in context.params ? await context.params : context.params;
    const id = parseInt(resolved.id);
    const { label } = await request.json();
    const updatedSeat = await prisma.seat.update({
      where: { id },
      data: { label },
    });
    return NextResponse.json(updatedSeat);
  } catch (err) {
    console.error('Failed to update seat:', err);
    return NextResponse.json({ error: 'Failed to update seat' }, { status: 500 });
  }
}