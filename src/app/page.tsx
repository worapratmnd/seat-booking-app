// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { FaChair } from "react-icons/fa";
import { BookingDialog } from "@/components/BookingDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditSeatDialog } from "@/components/EditSeatDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
  date: string;
  seat: Seat;
};

export default function HomePage() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditSeatDialogOpen, setIsEditSeatDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
    toast.success("Booking successful!", {
      description: `Your seat has been booked.`,
    });
    fetchData();
  };

  const handleSeatUpdate = () => {
    toast.success("Seat updated successfully!");
    fetchData();
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete booking.");
      }

      toast.success("Booking deleted successfully!");
      fetchData();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error("Failed to delete booking", { description: errorMessage });
    } finally {
      setIsDeleteConfirmOpen(false);
      setSelectedBooking(null);
    }
  };

  const openDeleteConfirm = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeleteConfirmOpen(true);
  };

  const openEditSeatDialog = (seat: Seat) => {
    setSelectedSeat(seat);
    setIsEditSeatDialogOpen(true);
  };

  const maxCols = Math.max(...(seats.map((s) => s.col) || [0]), 0);

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

                  const seatButton = (
                    <Button
                      variant="outline"
                      className={`h-20 flex flex-col items-center justify-center p-2 text-center transition-colors ${
                        isBooked
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                      onClick={() => !isBooked && handleSeatClick(seat)}
                    >
                      <FaChair size={24} />
                      <span className="mt-1 text-sm font-semibold">
                        {seat.label}
                      </span>
                    </Button>
                  );

                  if (isBooked) {
                    return (
                      <Popover key={seat.id}>
                        <PopoverTrigger asChild>{seatButton}</PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              className="justify-start"
                              onClick={() => openEditSeatDialog(seat)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Seat
                            </Button>
                            <Button
                              variant="ghost"
                              className="justify-start text-red-500 hover:text-red-600"
                              onClick={() => openDeleteConfirm(booking)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Booking
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  }

                  return seatButton;
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

      <EditSeatDialog
        seat={selectedSeat}
        open={isEditSeatDialogOpen}
        onOpenChange={setIsEditSeatDialogOpen}
        onSeatUpdate={handleSeatUpdate}
      />

      <AlertDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the booking for seat{" "}
              <strong>{selectedBooking?.seat?.label}</strong> on {" "}
              <strong>{selectedBooking && new Date(selectedBooking.date).toLocaleDateString()}</strong> by{" "}
              <strong>{selectedBooking?.userName}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBooking}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}