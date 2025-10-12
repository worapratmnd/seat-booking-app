// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { FaChair } from "react-icons/fa";
import { BookingDialog } from "@/components/BookingDialog";

type Seat = {
  id: number;
  row: number;
  col: number;
  label: string;
};

type Booking = {
  id: number;
  seatId: number;
  userName: string;
  startDate: string;
  endDate: string;
  seat: Seat;
};

export default function HomePage() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const seatsRes = await fetch("/api/seats");
      const seatsData = await seatsRes.json();
      setSeats(seatsData);

      const dateString = selectedDate.toISOString().split("T")[0];
      const bookingsRes = await fetch(`/api/bookings?date=${dateString}`);
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // ตั้งค่า state เป็น array ว่างเสมอเมื่อเกิด error
      setSeats([]);
      setBookings([]);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setIsDialogOpen(true);
  };

  const handleBookingSuccess = () => {
    alert("Booking successful!");
    fetchData();
  };
  
  // ✅ FIX 1: เพิ่มการตรวจสอบ Array.isArray() ก่อนใช้ .map
  const maxCols = Math.max(
    ...(Array.isArray(seats) ? seats.map((s) => s.col) : []),
    0
  );

  const bookingsMap = new Map(
    Array.isArray(bookings) ? bookings.map((b) => [b.seatId, b]) : []
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Seat Booking System
      </h1>

      <div className="flex flex-col md:flex-row gap-8">
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>
              Select a Seat for {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!Array.isArray(seats) || seats.length === 0 ? (
              <p className="text-center text-gray-500">
                No seats configured. Please visit the admin page.
              </p>
            ) : (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`,
                }}
              >
                {/* ✅ FIX 2: เพิ่มการตรวจสอบ Array.isArray() ก่อนใช้ .map */}
                {Array.isArray(seats) && seats.map((seat) => {
                  const booking = bookingsMap.get(seat.id);
                  const isBooked = !!booking;
                  return (
                    <Button
                      key={seat.id}
                      variant="outline"
                      className={`h-24 flex flex-col items-center justify-center p-2 text-center ${
                        isBooked
                          ? "bg-red-500 text-white hover:bg-red-600 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      onClick={() => !isBooked && handleSeatClick(seat)}
                      disabled={isBooked}
                    >
                      <FaChair size={24} />
                      <span className="mt-1 text-sm font-semibold">
                        {seat.label}
                      </span>
                      {isBooked && (
                        <span className="mt-1 text-xs truncate w-full">
                          {booking.userName}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="w-full md:w-auto">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
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

      <BookingDialog
        seat={selectedSeat}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}