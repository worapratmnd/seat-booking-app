// components/BookingDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateForApi } from '@/lib/timezone';


// สร้าง Type สำหรับ Props ที่จะรับเข้ามา
type Seat = {
  id: number;
  label: string;
};

interface BookingDialogProps {
  seat: Seat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingSuccess: () => void;
}

export function BookingDialog({
  seat,
  open,
  onOpenChange,
  onBookingSuccess,
}: Readonly<BookingDialogProps>) {
  const normalizeToStartOfDay = (value: Date) => {
    const next = new Date(value);
    next.setHours(0, 0, 0, 0);
    return next;
  };

  const [date, setDate] = useState<Date>(() =>
    normalizeToStartOfDay(new Date())
  );
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minSelectableDate = normalizeToStartOfDay(new Date());

  const handleConfirmBooking = async () => {
    if (!seat || !date || !userName) {
      setError("Please fill in all fields and select a date.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatId: seat.id,
          date: formatDateForApi(date),
          userName: userName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking. The seat might be taken.");
      }

      // ถ้าสำเร็จ
      onBookingSuccess(); // บอกให้หน้าหลัก Refresh ข้อมูล
      onOpenChange(false); // ปิด Dialog
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset state เมื่อ dialog ถูกเปิด/ปิด
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setUserName("");
      setError("");
      setDate(normalizeToStartOfDay(new Date()));
    }
    onOpenChange(isOpen);
  };

  if (!seat) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex min-h-0 w-full max-h-[calc(100vh-2.5rem)] max-w-[min(100vw-1.5rem,440px)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-0 shadow-2xl backdrop-blur-sm transition-colors dark:border-white/10 dark:bg-slate-900/95 sm:rounded-2xl sm:border sm:px-0">
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-7">
          <DialogHeader className="gap-2 text-left">
            <DialogTitle className="text-lg font-semibold leading-tight text-slate-900 dark:text-white sm:text-xl">
              Reserve seat {seat.label}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-300">
              Enter your name and pick an available day.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label
                htmlFor="booking-name"
                className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                Your name
              </Label>
              <Input
                id="booking-name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoComplete="name"
                autoFocus
                placeholder="e.g. Alex Johnson"
                className="h-11 rounded-xl border-slate-200 bg-white text-base placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Booking date
              </Label>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(normalizeToStartOfDay(d))}
                  disabled={(day) =>
                    normalizeToStartOfDay(new Date(day)) < minSelectableDate
                  }
                  numberOfMonths={1}
                  buttonVariant="outline"
                  className="mx-auto w-full max-w-[300px] rounded-xl border-0 bg-transparent text-slate-900 dark:text-white [--cell-size:2.05rem]"
                  classNames={{
                    root: "w-full justify-center",
                    months: "flex flex-col items-center gap-2",
                    month: "flex w-full max-w-[260px] flex-col gap-2",
                    nav: "flex items-center justify-between w-full max-w-[240px]",
                    table: "w-full border-collapse text-[0.85rem]",
                    caption_label: "text-sm font-semibold",
                    weekday: "text-[0.68rem] uppercase tracking-wide text-slate-500 dark:text-slate-400",
                  }}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="flex-none !flex-col gap-2 border-t border-slate-200/80 bg-white px-6 pb-4 pt-3 dark:border-white/10 dark:bg-slate-900 sm:!flex-row sm:justify-between sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 sm:w-auto"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 text-white shadow-md transition hover:bg-emerald-500 sm:w-auto"
            onClick={handleConfirmBooking}
            disabled={!userName.trim() || !date || isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Confirm booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
