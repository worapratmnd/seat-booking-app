// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API สำหรับดึงข้อมูลการจองตามช่วงวันที่
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // 'YYYY-MM-DD'
  const startDate = searchParams.get("startDate"); // 'YYYY-MM-DD'
  const endDate = searchParams.get("endDate"); // 'YYYY-MM-DD'
  
  if (!date && (!startDate || !endDate)) {
    return NextResponse.json(
      { error: "Either date or both startDate and endDate are required" },
      { status: 400 }
    );
  }
  if (startDate && !endDate) {
    return NextResponse.json(
      { error: "endDate is required when startDate is provided" },
      { status: 400 }
    );
  }
  if (!startDate && endDate) {
    return NextResponse.json(
      { error: "startDate is required when endDate is provided" },
      { status: 400 }
    );
  }
  
  let startOfDay: Date;
  let endOfDay: Date;

  if (date) {
    const selectedDate = new Date(date);
    startOfDay = new Date(selectedDate.setHours(7, 0, 0, 0));
    endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
  } else {
    // startDate and endDate are validated above (not null when this branch runs)
    startOfDay = new Date(startDate as string);
    endOfDay = new Date(endDate as string);
  }
  
  if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
    return NextResponse.json(
      { error: "Start date and end date are required" },
      { status: 400 }
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      AND: [{ startDate: { lte: endOfDay } }, { endDate: { gte: startOfDay } }],
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
