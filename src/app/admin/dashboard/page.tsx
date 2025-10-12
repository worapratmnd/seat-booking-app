// app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { subDays } from 'date-fns';

// ควรสร้าง Type นี้ไว้ในไฟล์กลางแล้ว import มาใช้
type Seat = { id: number; label: string; };
type Booking = { id: number; userName: string; startDate: string; endDate: string; seat: Seat; };

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();
      fetch(`/api/bookings?startDate=${startDate}&endDate=${endDate}`)
        .then(res => res.json())
        .then(data => setBookings(data));
    }
  }, [dateRange]);

  const handleDelete = async (bookingId: number) => {
    await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
    // Refresh data
    setBookings(bookings.filter(b => b.id !== bookingId));
  };

  // TODO: Implement Edit functionality with a Dialog
  const handleEdit = (booking: Booking) => {
      alert(`Editing booking for ${booking.userName}. Implement Edit Dialog here.`);
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">in the selected period</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings Report</CardTitle>
          <div className="flex justify-center p-4">
              <Calendar mode="range" selected={dateRange} onSelect={setDateRange} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seat</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.length ? bookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>{booking?.seat?.label}</TableCell>
                  <TableCell>{booking.userName}</TableCell>
                  <TableCell>{new Date(booking.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(booking.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(booking)} className="mr-2">Edit</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the booking for {booking.userName}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(booking.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : <></>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}