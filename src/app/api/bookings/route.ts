// app/api/bookings/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API สำหรับดึงข้อมูลการจองตามช่วงวันที่
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date'); // 'YYYY-MM-DD'

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  const selectedDate = new Date(date);
  const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

  const bookings = await prisma.booking.findMany({
    where: {
      AND: [
        { startDate: { lte: endOfDay } },
        { endDate: { gte: startOfDay } },
      ],
    },
  });

  return NextResponse.json(bookings);
}

// API สำหรับสร้างการจองใหม่
export async function POST(request: Request) {
    const { seatId, startDate, endDate, userName } = await request.json();

    // TODO: เพิ่ม Logic ตรวจสอบว่าที่นั่งในช่วงเวลาที่เลือกนั้นว่างอยู่หรือไม่

    const newBooking = await prisma.booking.create({
        data: {
            seatId,
            userName,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        },
    });

    return NextResponse.json(newBooking, { status: 201 });
}