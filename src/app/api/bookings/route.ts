// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { parseDateToUtcFromTimeZone } from "@/lib/timezone";

const prisma = new PrismaClient();

// GET /api/bookings
// Supports:
//  - ?date=YYYY-MM-DD (single day)
//  - ?startDate=ISO&endDate=ISO (range report)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  try {
    if (date) {
      let targetDate: Date;
      try {
        targetDate = parseDateToUtcFromTimeZone(date);
      } catch (error) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
      }
      const bookings = await prisma.booking.findMany({
        where: { date: targetDate },
        include: { seat: true },
      });
      return NextResponse.json(bookings);
    }

    if (startDateParam && endDateParam) {
      let startDate: Date;
      let endDate: Date;
      try {
        startDate = parseDateToUtcFromTimeZone(startDateParam);
        endDate = parseDateToUtcFromTimeZone(endDateParam);
      } catch (error) {
        return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
      }
      const bookings = await prisma.booking.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { seat: true },
        orderBy: { date: 'asc' }
      });
      return NextResponse.json(bookings);
    }

    return NextResponse.json({ error: "Either 'date' or 'startDate' & 'endDate' parameters are required" }, { status: 400 });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// API สำหรับสร้างการจองใหม่
export async function POST(request: Request) {
  try {
    const { seatId, date, userName } = await request.json();

    if (!seatId || !date || !userName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let targetDate: Date;
    try {
      targetDate = parseDateToUtcFromTimeZone(date);
    } catch (error) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // ตรวจสอบว่าที่นั่งนี้ในวันนั้นถูกจองไปแล้วหรือยัง
    const existingBooking = await prisma.booking.findFirst({
      where: {
        seatId: seatId,
        date: targetDate,
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This seat is already booked for the selected date." },
        { status: 409 } // 409 Conflict
      );
    }

    const newBooking = await prisma.booking.create({
      data: {
        seatId,
        userName,
        date: targetDate,
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
