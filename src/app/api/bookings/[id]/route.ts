// app/api/bookings/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// API สำหรับแก้ไขข้อมูลการจอง
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { userName, date } = await request.json(); // รับแค่ userName และ date
    
    if (!userName && !date) {
        return NextResponse.json({ error: 'userName or date is required for update' }, { status: 400 });
    }

    const dataToUpdate: { userName?: string; date?: Date } = {};
    if (userName) dataToUpdate.userName = userName;
    if (date) dataToUpdate.date = new Date(date);

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
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await prisma.booking.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}