// app/api/bookings/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API สำหรับแก้ไขข้อมูลการจอง
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolved = 'then' in context.params ? await context.params : context.params;
    const id = parseInt(resolved.id);
    const { userName, date } = await request.json(); // รับแค่ userName และ date
    
    if (!userName && !date) {
        return NextResponse.json({ error: 'userName or date is required for update' }, { status: 400 });
    }

    const dataToUpdate: { userName?: string; date?: Date } = {};
    if (userName) dataToUpdate.userName = userName;
    if (date) {
      const newDate = new Date(date);
      if (isNaN(newDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }
      // Find existing booking to know seatId
      const existing = await prisma.booking.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      // Check conflict (exclude itself)
      const conflict = await prisma.booking.findFirst({
        where: { seatId: existing.seatId, date: newDate, NOT: { id } },
      });
      if (conflict) {
        return NextResponse.json({ error: 'This seat is already booked for that date.' }, { status: 409 });
      }
      dataToUpdate.date = newDate;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// API สำหรับลบข้อมูลการจอง
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolved = 'then' in context.params ? await context.params : context.params;
    const id = parseInt(resolved.id);
    await prisma.booking.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}