// components/BookingDialog.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateForApi } from '@/lib/timezone';
import type { DateRange } from 'react-day-picker';


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
  initialDate?: Date;
}

export function BookingDialog({ seat, open, onOpenChange, onBookingSuccess, initialDate }: Readonly<BookingDialogProps>) {
  const createDefaultRange = useCallback((): DateRange => {
    const base = initialDate ? new Date(initialDate) : new Date();
    base.setHours(0, 0, 0, 0);
    const end = new Date(base);
    return { from: base, to: end };
  }, [initialDate]);

  const [dateRange, setDateRange] = useState<DateRange>(() => createDefaultRange());
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDateRange(createDefaultRange());
    }
  }, [open, createDefaultRange]);

  const dayCount = useMemo(() => {
    const { from, to } = dateRange;
    if (!from) return 0;
    const end = to ?? from;
    const diff = Math.floor((end.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    return diff + 1;
  }, [dateRange]);

  const handleConfirmBooking = async () => {
    const { from, to } = dateRange;
    if (!seat || !from || !userName) {
      setError('Please fill in all fields and select at least one date.');
      return;
    }

    const endDate = to ?? from;
    const isRange = endDate.getTime() !== from.getTime();
    
    setIsSubmitting(true);
    setError('');

    try {
      const payload: Record<string, unknown> = {
        seatId: seat.id,
        userName: userName,
      };

      if (isRange) {
        payload.startDate = formatDateForApi(from);
        payload.endDate = formatDateForApi(endDate);
      } else {
        payload.date = formatDateForApi(from);
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking. The seat might be taken.');
      }

      // ถ้าสำเร็จ
      onBookingSuccess(); // บอกให้หน้าหลัก Refresh ข้อมูล
      onOpenChange(false); // ปิด Dialog
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Reset state เมื่อ dialog ถูกเปิด/ปิด
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setUserName('');
        setError('');
        setDateRange(createDefaultRange());
    }
    onOpenChange(isOpen);
  }

  if (!seat) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Seat {seat.label}</DialogTitle>
          <DialogDescription>
            Select the date range and enter your name to confirm the booking.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Label>Date range</Label>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => range && setDateRange(range)}
              disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
              numberOfMonths={1}
            />
            <div className="text-xs text-muted-foreground">
              {dayCount > 0 ? `${dayCount} ${dayCount === 1 ? 'day selected' : 'days selected'}` : 'Select at least one date'}
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <DialogFooter>
          <Button type="submit" onClick={handleConfirmBooking} disabled={isSubmitting}>
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
