// app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { formatDateForApi, parseDateToUtcFromTimeZone } from "@/lib/timezone";

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
      } catch {
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
      } catch {
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
    const { seatId, date, userName, startDate, endDate } = await request.json();

    if (!seatId || !userName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Handle multi-day booking when startDate & endDate are provided
    if (startDate || endDate) {
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: "Both startDate and endDate are required for range bookings." },
          { status: 400 }
        );
      }

      let rangeStart: Date;
      let rangeEnd: Date;
      try {
        rangeStart = parseDateToUtcFromTimeZone(startDate);
        rangeEnd = parseDateToUtcFromTimeZone(endDate);
      } catch {
        return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
      }

      if (rangeEnd < rangeStart) {
        return NextResponse.json(
          { error: "The end date cannot be earlier than the start date." },
          { status: 400 }
        );
      }

      const conflicts = await prisma.booking.findMany({
        where: {
          seatId,
          date: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        orderBy: { date: "asc" },
      });

      if (conflicts.length > 0) {
        const firstConflict = conflicts[0];
        return NextResponse.json(
          {
            error: `Seat already booked for ${formatDateForApi(firstConflict.date)}.`,
            conflicts,
          },
          { status: 409 }
        );
      }

      const bookingDates: Date[] = [];
      for (
        let cursor = new Date(rangeStart);
        cursor.getTime() <= rangeEnd.getTime();
        cursor.setUTCDate(cursor.getUTCDate() + 1)
      ) {
        bookingDates.push(new Date(cursor));
      }

      const createdBookings = await prisma.$transaction(
        bookingDates.map((bookingDate) =>
          prisma.booking.create({
            data: {
              seatId,
              userName,
              date: bookingDate,
            },
          })
        )
      );

      return NextResponse.json(
        {
          bookings: createdBookings,
          count: createdBookings.length,
        },
        { status: 201 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required when no range is specified." },
        { status: 400 }
      );
    }

    let targetDate: Date;
    try {
      targetDate = parseDateToUtcFromTimeZone(date);
    } catch {
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
