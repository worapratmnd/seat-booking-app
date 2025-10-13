// app/admin/page.tsx
"use client";

import { useState, useEffect, FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// Type สำหรับข้อมูลที่นั่ง
type Seat = {
  id: number;
  label: string;
  row: number;
  col: number;
};

// --- Helper Component: EditSeatDialog ---
interface EditSeatDialogProps {
  seat: Seat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newLabel: string) => void;
}

const EditSeatDialog: FC<EditSeatDialogProps> = ({
  seat,
  open,
  onOpenChange,
  onSave,
}) => {
  const [label, setLabel] = useState(seat?.label || "");

  useEffect(() => {
    // อัปเดต state ของ label เมื่อ prop `seat` เปลี่ยน
    if (seat) {
      setLabel(seat.label);
    }
  }, [seat]);

  if (!seat) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Seat: {seat.label}</DialogTitle>
          <DialogDescription>
            Change the display label for this seat.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="seat-label">Seat Label</Label>
          <Input
            id="seat-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSave(label)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Component: AdminPage ---
export default function AdminPage() {
  // State สำหรับฟอร์มสร้าง Layout
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [message, setMessage] = useState("");

  // State สำหรับจัดการรายชื่อที่นั่ง
  const [seats, setSeats] = useState<Seat[]>([]);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ฟังก์ชันสำหรับดึงข้อมูลที่นั่งล่าสุด
  const fetchSeats = async () => {
    try {
      const res = await fetch("/api/seats");
      if (res.ok) {
        const data = await res.json();
        setSeats(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch seats:", error);
      setSeats([]);
    }
  };

  // ดึงข้อมูลที่นั่งเมื่อ Component โหลดครั้งแรก
  useEffect(() => {
    fetchSeats();
  }, []);

  // ฟังก์ชันสำหรับอัปเดต Layout
  const handleUpdateLayout = async () => {
    setMessage("Updating...");
    const res = await fetch("/api/seats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, cols }),
    });

    if (res.ok) {
      setMessage("Layout updated successfully!");
      fetchSeats(); // Refresh ที่นั่งใหม่
    } else {
      setMessage("Failed to update layout.");
    }
  };

  // ฟังก์ชันสำหรับบันทึกการแก้ไขชื่อที่นั่ง
  const handleSaveSeatLabel = async (newLabel: string) => {
    if (!editingSeat) return;

    try {
      await fetch(`/api/seats/${editingSeat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel }),
      });
      setIsDialogOpen(false); // ปิด Dialog
      setEditingSeat(null);
      fetchSeats(); // Refresh ที่นั่งใหม่
    } catch (error) {
      console.error("Failed to save seat label:", error);
    }
  };

  // ฟังก์ชันสำหรับเปิด Dialog แก้ไข
  const handleEditClick = (seat: Seat) => {
    setEditingSeat(seat);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Card 1: สำหรับสร้าง Layout */}
        <Card>
          <CardHeader>
            <CardTitle>Update Seat Layout</CardTitle>
            <CardDescription>
              This will delete all current seats and bookings, then create a new
              layout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="rows">Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cols">Seats per Row (Columns)</Label>
                <Input
                  id="cols"
                  type="number"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  min="1"
                />
              </div>
              <Button onClick={handleUpdateLayout} className="w-full">
                Update Layout
              </Button>
              {message && <p className="text-sm text-center mt-2">{message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: สำหรับจัดการที่นั่ง */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Seats</CardTitle>
            <CardDescription>
              View and edit individual seat labels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seats.map((seat) => (
                  <TableRow key={seat.id}>
                    <TableCell className="font-medium">{seat.label}</TableCell>
                    <TableCell>
                      Row {seat.row}, Col {seat.col}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(seat)}
                      >
                        Edit Label
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog สำหรับแก้ไขจะถูก render ที่นี่ */}
      <EditSeatDialog
        seat={editingSeat}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveSeatLabel}
      />
    </div>
  );
}
