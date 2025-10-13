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
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditSeatDialogOpen, setIsEditSeatDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const first = isInitialLoading;
    if (!first) setIsRefreshing(true);
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
      setSeats([]);
      setBookings([]);
    } finally {
      if (isInitialLoading) setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedDate, isInitialLoading]);

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
      <div className="flex items-center justify-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-center">Seat Booking System</h1>
        {isRefreshing && (
          <div className="animate-spin h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary" aria-label="Loading" />
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>
              Select a Seat for {selectedDate.toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              if (isInitialLoading) {
                const skeletons = Array.from({ length: 8 }).map((_, idx) => (
                  <div key={`sk-${idx + 1}`} className="h-24 rounded-xl bg-muted animate-pulse" />
                ));
                return (
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(4, minmax(0, 1fr))` }}>
                    {skeletons}
                  </div>
                );
              }
              if (!Array.isArray(seats) || seats.length === 0) {
                return (
                  <p className="text-center text-gray-500">
                    No seats configured. Please visit the admin page.
                  </p>
                );
              }
              return (
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

                  const userInitial = booking?.userName?.charAt(0)?.toUpperCase();
                  const bookedBg = "bg-gradient-to-br from-red-500 via-red-500/90 to-red-600";
                  const freeBg = "bg-gradient-to-br from-emerald-500 via-emerald-500/90 to-emerald-600";
                  const seatButton = (
                    <Button
                      key={`seat_button_${seat.id}`}
                      variant="outline"
                      aria-label={isBooked ? `Seat ${seat.label} booked by ${booking.userName}` : `Seat ${seat.label} available`}
                      className={`group relative h-24 flex flex-col items-center justify-between py-1.5 px-1.5 text-center transition-all rounded-xl shadow-sm hover:shadow-md border-none ${
                        isBooked ? `${bookedBg} text-white` : `${freeBg} text-white`
                      }`}
                      onClick={() => !isBooked && handleSeatClick(seat)}
                    >
                      {isRefreshing && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-xl">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        </div>
                      )}
                      <div className="mt-0.5 flex items-center gap-1">
                        <FaChair size={20} className="drop-shadow-sm" />
                        {isBooked && userInitial && (
                          <div
                            className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold backdrop-blur-sm"
                            title={booking.userName}
                          >
                            {userInitial}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold tracking-wide">
                        {seat.label}
                      </span>
                      {isBooked ? (
                        <span
                          className="text-[10px] font-medium leading-tight w-full px-0.5 truncate opacity-90"
                          title={booking.userName}
                        >
                          {booking.userName}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium opacity-80">
                          Available
                        </span>
                      )}
                      {isBooked && (
                        <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 group-hover:ring-white/25 transition-colors" />
                      )}
                    </Button>
                  );

                  if (isBooked) {
                    return (
                      <Popover key={seat.id}>
                        <PopoverTrigger asChild>{seatButton}</PopoverTrigger>
                        <PopoverContent className="w-44 p-2">
                          <div className="space-y-2 text-sm">
                            <div>
                              <div className="font-semibold">Seat: {seat.label}</div>
                              <div className="text-xs opacity-80">Booked by: {booking.userName}</div>
                            </div>
                            <div className="flex flex-col gap-1 pt-1 border-t border-white/20">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start h-8"
                                onClick={() => openEditSeatDialog(seat)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Seat
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start h-8 text-red-600 hover:text-red-100 hover:bg-red-600"
                                onClick={() => openDeleteConfirm(booking)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Booking
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  }

                  return seatButton;
                })}
              </div>
              )
            })()}
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
                disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
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