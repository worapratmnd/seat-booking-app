// app/api/seats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API สำหรับดึงข้อมูลที่นั่งทั้งหมด
export async function GET() {
  const seats = await prisma.seat.findMany({
    orderBy: [{ row: 'asc' }, { col: 'asc' }],
  });
  return NextResponse.json(seats);
}

// API สำหรับ Custom ที่นั่ง (สำหรับ Admin)
export async function POST(request: Request) {
  const { rows, cols } = await request.json();

  // ลบที่นั่งเก่าทั้งหมด
  await prisma.seat.deleteMany({});

  const seatsToCreate = [];
  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      seatsToCreate.push({
        row: i,
        col: j,
        label: `${String.fromCharCode(64 + i)}${j}`, // A1, A2, B1, B2...
      });
    }
  }

  // สร้างที่นั่งใหม่
  await prisma.seat.createMany({
    data: seatsToCreate,
  });

  return NextResponse.json({ message: 'Seat layout updated successfully' }, { status: 201 });
}