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
import { CalendarDays, LayoutGrid, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { formatDateForApi, formatDateForDisplay } from "@/lib/timezone";
import { ThemeToggle } from "@/components/ThemeToggle";

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

      const dateString = formatDateForApi(selectedDate);
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

  const getToday = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  };

  const shiftSelectedDate = (days: number) => {
    setSelectedDate((prevDate) => {
      const base = prevDate ? new Date(prevDate) : getToday();
      base.setDate(base.getDate() + days);
      base.setHours(0, 0, 0, 0);
      if (base.getTime() < getToday().getTime()) {
        return prevDate;
      }
      return base;
    });
  };

  const goToToday = () => {
    setSelectedDate(getToday());
  };

  const maxCols = Math.max(...(seats.map((s) => s.col) || [0]), 0);

  const bookingsMap = new Map(
    Array.isArray(bookings) ? bookings.map((b) => [b.seatId, b]) : []
  );

  const totalSeats = Array.isArray(seats) ? seats.length : 0;
  const bookedCount = Array.isArray(bookings) ? bookings.length : 0;
  const availableSeats = Math.max(totalSeats - bookedCount, 0);
  const occupancyRate =
    totalSeats > 0 ? Math.round((bookedCount / totalSeats) * 100) : 0;
  const skeletonCount = Math.min(Math.max(totalSeats || maxCols || 8, 8), 12);
  const responsiveColumnTarget = Math.max(Math.min(maxCols || 1, 6), 1);
  const seatGridTemplate =
    maxCols > 0
      ? `repeat(${maxCols}, minmax(clamp(64px, calc(100vw / ${responsiveColumnTarget} - 28px), 96px), 1fr))`
      : "repeat(1, minmax(88px, 1fr))";
  const today = getToday();
  const isPreviousDisabled = selectedDate.getTime() <= today.getTime();
  const isTodaySelected = selectedDate.getTime() === today.getTime();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <header className="space-y-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.45em] text-slate-500 dark:text-slate-400">
                Workspace
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Seat Booking Hub
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                Choose a day, explore the map, and manage bookings with ease.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:self-end">
              <ThemeToggle />
              <div className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors sm:px-6 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
                <CalendarDays className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                <span>{formatDateForDisplay(selectedDate)}</span>
                {isRefreshing && (
                  <div
                    className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400/50 border-t-slate-700 dark:border-white/40 dark:border-t-white"
                    aria-label="Refreshing data"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between text-xs uppercase text-slate-500 dark:text-slate-400">
                <span>Available</span>
                <LayoutGrid className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                {availableSeats}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                of {totalSeats} seats
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between text-xs uppercase text-slate-500 dark:text-slate-400">
                <span>Booked</span>
                <Users className="h-4 w-4 text-rose-500 dark:text-rose-300" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                {bookedCount}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Awaiting arrival
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between text-xs uppercase text-slate-500 dark:text-slate-400">
                <span>Occupancy</span>
                <CalendarDays className="h-4 w-4 text-sky-500 dark:text-sky-300" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                {occupancyRate}%
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Today&apos;s ratio
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          <Card className="order-2 border-slate-200/80 bg-white text-slate-900 shadow-2xl transition-colors backdrop-blur lg:order-1 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                Seat map
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Tap an available seat to reserve it or open a booked seat to edit
                or release the reservation.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs font-medium text-slate-500 sm:hidden dark:text-slate-400">
                Tip: drag sideways to reveal hidden columns when the map is wider than your screen.
              </p>
              {(() => {
                if (isInitialLoading) {
                  const skeletons = Array.from({ length: skeletonCount }).map(
                    (_, idx) => (
                      <div
                        key={`seat-skeleton-${idx + 1}`}
                        className="h-24 rounded-2xl border border-slate-200/80 bg-slate-100 animate-pulse sm:h-28 dark:border-white/10 dark:bg-white/5"
                      />
                    )
                  );
                  return (
                    <div className="-mx-4 overflow-x-auto pb-3 sm:mx-0 sm:overflow-visible">
                      <div
                        className="grid min-w-max gap-2 px-1 sm:gap-4 sm:px-0"
                        style={{ gridTemplateColumns: seatGridTemplate }}
                      >
                        {skeletons}
                      </div>
                    </div>
                  );
                }
                if (!Array.isArray(seats) || seats.length === 0) {
                  return (
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-6 text-center text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">
                        No seats configured
                      </span>
                      <p className="text-sm">
                        Visit the admin panel to set up the seating layout
                        before accepting bookings.
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="-mx-4 overflow-x-auto pb-3 sm:mx-0 sm:overflow-visible">
                    <div
                      className="grid min-w-max gap-2 px-1 sm:gap-4 sm:px-0"
                      style={{ gridTemplateColumns: seatGridTemplate }}
                    >
                      {Array.isArray(seats) &&
                        seats.map((seat) => {
                          const booking = bookingsMap.get(seat.id);
                          const isBooked = !!booking;
                          const userInitial = booking?.userName
                            ?.charAt(0)
                            ?.toUpperCase();
                          const bookedBg =
                            "bg-gradient-to-br from-rose-500 via-rose-500/90 to-rose-600";
                          const freeBg =
                            "bg-gradient-to-br from-emerald-500 via-emerald-500/90 to-emerald-600";
                          const statusBadge =
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide";

                          const seatButton = (
                            <Button
                              key={`seat_button_${seat.id}`}
                              variant="outline"
                              aria-label={
                                isBooked
                                  ? `Seat ${seat.label} booked by ${booking?.userName}`
                                  : `Seat ${seat.label} available`
                              }
                              className={`group relative flex h-24 w-full flex-col justify-between rounded-2xl border border-slate-200/80 px-2 py-2 text-left text-white shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 sm:h-28 sm:px-3 ${
                                isBooked ? bookedBg : freeBg
                              } hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:focus-visible:ring-offset-slate-900`}
                              onClick={() => !isBooked && handleSeatClick(seat)}
                            >
                              {isRefreshing && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-slate-900/10 backdrop-blur dark:bg-black/25">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
                                  <FaChair size={18} className="drop-shadow-sm" />
                                  <span>{seat.label}</span>
                                </div>
                                <span
                                  className={`${statusBadge} ${
                                    isBooked
                                      ? "bg-rose-100 text-rose-700 dark:bg-black/30 dark:text-white/95"
                                      : "bg-emerald-100 text-emerald-700 dark:bg-black/20 dark:text-white/90"
                                  }`}
                                >
                                  {isBooked ? "Booked" : "Free"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/90 px-2 py-1 text-[12px] font-semibold leading-tight text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-white">
                                {isBooked && userInitial ? (
                                  <div
                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[11px] font-bold text-emerald-700 shadow-sm dark:bg-white/20 dark:text-white"
                                    title={booking?.userName}
                                  >
                                    {userInitial}
                                  </div>
                                ) : (
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200/70 bg-white text-lg font-semibold text-emerald-600 shadow-sm dark:border-white/20 dark:bg-white/15 dark:text-white/80">
                                    +
                                  </div>
                                )}
                                <span
                                  className="flex-1 truncate text-left text-[12px] text-slate-700 dark:text-white/90"
                                  title={isBooked ? booking?.userName : undefined}
                                >
                                  {isBooked
                                    ? booking?.userName
                                    : "Tap to reserve"}
                                </span>
                              </div>
                              {isBooked && (
                                <div className="absolute inset-0 rounded-2xl ring-1 ring-black/10 transition group-hover:ring-black/20 dark:ring-white/10 dark:group-hover:ring-white/25" />
                              )}
                            </Button>
                          );

                          if (isBooked) {
                            return (
                              <Popover key={seat.id}>
                                <PopoverTrigger asChild>
                                  {seatButton}
                                </PopoverTrigger>
                                <PopoverContent className="w-48 rounded-xl border border-slate-200/80 bg-white p-3 text-slate-700 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-100">
                                  <div className="space-y-2 text-sm">
                                    <div className="space-y-1">
                                      <div className="font-semibold text-slate-900 dark:text-white">
                                        Seat {seat.label}
                                      </div>
                                      <div className="text-xs text-slate-500 dark:text-slate-300">
                                        Booked by {booking?.userName}
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 border-t border-slate-200/80 pt-2 dark:border-white/10">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start gap-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
                                        onClick={() => openEditSeatDialog(seat)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                        Edit seat
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start gap-2 rounded-lg text-rose-500 hover:bg-rose-100 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-100"
                                        onClick={() => openDeleteConfirm(booking)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete booking
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
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <div className="order-1 flex flex-col gap-6 lg:order-2">
            <Card className="border-slate-200/80 bg-white text-slate-900 shadow-2xl transition-colors backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">
                  Select date
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Pick the day you want to view or manage bookings for.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                    onClick={() => shiftSelectedDate(-1)}
                    disabled={isPreviousDisabled}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                    onClick={goToToday}
                    disabled={isTodaySelected}
                  >
                    Today
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-200/80 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                    onClick={() => shiftSelectedDate(1)}
                  >
                    Next
                  </Button>
                  <div className="ml-auto rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    {formatDateForDisplay(selectedDate)}
                  </div>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (!date) return;
                    const normalized = new Date(date);
                    normalized.setHours(0, 0, 0, 0);
                    if (normalized.getTime() < getToday().getTime()) {
                      return;
                    }
                    setSelectedDate(normalized);
                  }}
                  disabled={(day) => {
                    const normalized = new Date(day);
                    normalized.setHours(0, 0, 0, 0);
                    return normalized.getTime() < getToday().getTime();
                  }}
                  className="mx-auto rounded-2xl border border-slate-200/80 bg-slate-50 p-3 text-slate-900 shadow-inner dark:border-white/10 dark:bg-slate-950/40 dark:text-white"
                />
              </CardContent>
            </Card>
          </div>
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
              <strong>{selectedBooking && formatDateForDisplay(selectedBooking.date)}</strong> by{" "}
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
