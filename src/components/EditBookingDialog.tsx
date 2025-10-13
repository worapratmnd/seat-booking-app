"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';

type Seat = { id: number; label: string };
export interface Booking {
  id: number;
  userName: string;
  date: string; // ISO
  seat: Seat;
}

interface EditBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (updated: Booking) => void;
}

export function EditBookingDialog({ booking, open, onOpenChange, onUpdated }: Readonly<EditBookingDialogProps>) {
  const [userName, setUserName] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setUserName(booking.userName);
      setDate(new Date(booking.date));
    } else {
      setUserName('');
      setDate(undefined);
    }
    setError('');
    setIsSubmitting(false);
  }, [booking, open]);

  const handleSave = async () => {
    if (!booking) return;
    if (!userName || !date) {
      setError('All fields are required.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, date: date.toISOString() }),
      });
      if (res.status === 409) {
        const body = await res.json();
        throw new Error(body.error || 'Seat already booked for that date.');
      }
      if (!res.ok) throw new Error('Failed to update booking');
      const data = await res.json();
      onUpdated(data);
      onOpenChange(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>Update user name or date for seat {booking?.seat?.label}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="userName">User Name</Label>
            <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
            <div className="flex flex-col items-center gap-2">
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
              />
            </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
