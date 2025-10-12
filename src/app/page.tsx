// app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react'; // เพิ่ม useCallback
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { FaChair } from 'react-icons/fa';
import { BookingDialog } from '@/components/BookingDialog'; // Import component ของเรา

// Type ไม่เปลี่ยนแปลง
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
  
  // State ใหม่สำหรับ Dialog
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  // ✨ ห่อ Logic การ fetch data ไว้ใน useCallback เพื่อให้เรียกใช้ซ้ำได้
  const fetchData = useCallback(async () => {
    // Fetch seats
    const seatsRes = await fetch('/api/seats');
    const seatsData = await seatsRes.json();
    setSeats(seatsData);

    // Fetch bookings for the selected date
    const dateString = selectedDate.toISOString().split('T')[0];
    const bookingsRes = await fetch(`/api/bookings?date=${dateString}`);
    const bookingsData = await bookingsRes.json();
    setBookings(bookingsData);
  }, [selectedDate]); // Dependency คือ selectedDate

  // เรียก fetchData เมื่อ selectedDate เปลี่ยน
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ฟังก์ชันที่ถูกเรียกเมื่อคลิกที่นั่ง
  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setIsDialogOpen(true);
  };
  
  // ฟังก์ชัน Callback ที่จะถูกเรียกเมื่อจองสำเร็จ
  const handleBookingSuccess = () => {
    alert('Booking successful!');
    fetchData(); // <-- เรียก fetchData อีกครั้งเพื่ออัปเดต UI
  };

  const maxCols = Math.max(...seats.map((s) => s.col), 0);
  const bookedSeatIds = new Set(bookings.map((b) => b.seatId));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Seat Booking System</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* ส่วนแสดงที่นั่ง */}
        <Card className="flex-grow">
          {/* ... CardHeader ไม่เปลี่ยนแปลง ... */}
          <CardHeader>
            <CardTitle>Select a Seat for {selectedDate.toLocaleDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            {seats.length === 0 ? (
                <p className="text-center text-gray-500">No seats configured. Please visit the admin page.</p>
            ) : (
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
                            isBooked ? 'bg-red-500 text-white hover:bg-red-600 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                            onClick={() => !isBooked && handleSeatClick(seat)} // <-- แก้ไขตรงนี้
                            disabled={isBooked}
                        >
                            <FaChair size={24} />
                            <span className="mt-1 text-sm font-semibold">{seat.label}</span>
                        </Button>
                        );
                    })}
                </div>
            )}
          </CardContent>
        </Card>

        {/* ส่วนปฏิทินและเลือกมุมมอง */}
        <div className="w-full md:w-auto">
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
      
      {/* 👇 เพิ่ม Component Dialog ของเราเข้ามาตรงนี้ */}
      <BookingDialog
        seat={selectedSeat}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}