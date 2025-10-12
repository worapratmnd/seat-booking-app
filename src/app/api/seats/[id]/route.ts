// app/api/seats/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API สำหรับแก้ไข Label ของเก้าอี้
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { label } = await request.json();
    const updatedSeat = await prisma.seat.update({
      where: { id },
      data: { label },
    });
    return NextResponse.json(updatedSeat);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update seat' }, { status: 500 });
  }
}