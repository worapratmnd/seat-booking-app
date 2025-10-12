// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { FaChair } from 'react-icons/fa'; // ติดตั้ง `react-icons` -> npm install react-icons

// สร้าง Type เพื่อความชัดเจน
type Seat = {
  id: number;
  row: number;
  col: number;
  label: string;
};

type Booking = {
  id: number;
  seatId: number;
  startDate: string;
  endDate: string;
};

export default function HomePage() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day'); // State สำหรับมุมมอง

  // Fetch ข้อมูลที่นั่งและการจอง
  useEffect(() => {
    async function fetchData() {
      // Fetch seats
      const seatsRes = await fetch('/api/seats');
      const seatsData = await seatsRes.json();
      setSeats(seatsData);

      // Fetch bookings for the selected date
      const dateString = selectedDate.toISOString().split('T')[0];
      const bookingsRes = await fetch(`/api/bookings?date=${dateString}`);
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);
    }
    fetchData();
  }, [selectedDate]);

  const maxCols = Math.max(...seats.map((s) => s.col), 0);
  const bookedSeatIds = new Set(bookings.map((b) => b.seatId));

  const handleBooking = (seatId: number) => {
    // TODO: เปิด Dialog/Modal เพื่อให้ผู้ใช้กรอกข้อมูลการจอง (ชื่อ, เลือกวันเริ่ม-สิ้นสุด)
    alert(`You clicked seat ID: ${seatId}. Implement booking modal here.`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Seat Booking System</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* ส่วนแสดงที่นั่ง */}
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>Select a Seat for {selectedDate.toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))` }}
            >
              {seats.map((seat) => {
                const isBooked = bookedSeatIds.has(seat.id);
                return (
                  <Button
                    key={seat.id}
                    variant="outline"
                    className={`h-20 flex flex-col items-center justify-center ${
                      isBooked ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                    onClick={() => !isBooked && handleBooking(seat.id)}
                    disabled={isBooked}
                  >
                    <FaChair size={24} />
                    <span className="mt-1 text-sm font-semibold">{seat.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ส่วนปฏิทินและเลือกมุมมอง */}
        <div className="w-full md:w-auto">
          {/* TODO: เพิ่มปุ่มสำหรับเลือกมุมมอง Week/Month */}
          <Card>
              <CardHeader><CardTitle>Select Date</CardTitle></CardHeader>
              <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}