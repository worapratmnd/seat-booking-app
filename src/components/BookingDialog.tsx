// components/BookingDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

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

export function BookingDialog({ seat, open, onOpenChange, onBookingSuccess }: BookingDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 1), // Default จอง 1 วัน
  });
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmBooking = async () => {
    if (!seat || !dateRange?.from || !userName) {
      setError('Please fill in all fields and select a date.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatId: seat.id,
          startDate: dateRange.from.toISOString(),
          // ถ้าไม่มี endDate ให้ใช้ startDate แทน (จองวันเดียว)
          endDate: (dateRange.to ?? dateRange.from).toISOString(), 
          userName: userName,
        }),
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
        setDateRange({ from: new Date(), to: addDays(new Date(), 1) });
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
            <Label>Booking Dates</Label>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
            />
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