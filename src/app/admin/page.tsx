// app/admin/page.tsx
"use client";

import { useState, useEffect } from "react"; // เพิ่ม useEffect
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Seat = { id: number; label: string; row: number; col: number };

function EditSeatDialog({
  seat,
  onSave,
  onCancel,
}: {
  seat: Seat;
  onSave: (newLabel: string) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(seat.label);
  return (
    // UI for Dialog... (ใช้ <Dialog> จาก shadcn)
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <h3 className="font-bold text-lg mb-4">Edit Seat {seat.label}</h3>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave(label)}>Save</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [message, setMessage] = useState("");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [editingSeat, setEditingSeat] = useState<Seat | null>(null);

  const fetchSeats = () => {
    fetch("/api/seats")
      .then((res) => res.json())
      .then(setSeats);
  };

  useEffect(() => {
    fetchSeats();
  }, []);

  const handleUpdateLayout = async () => {
    const res = await fetch("/api/seats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, cols }),
    });

    if (res.ok) {
      setMessage("Layout updated successfully!");
      fetchSeats(); // Refresh list
    } else {
      setMessage("Failed to update layout.");
    }
  };

  const handleSaveSeatLabel = async (newLabel: string) => {
    if (!editingSeat) return;
    await fetch(`/api/seats/${editingSeat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel }),
    });
    setEditingSeat(null);
    fetchSeats(); // Refresh list
  };

  return (
    <div className="container mx-auto p-4 grid md:grid-cols-2 gap-8">
      {editingSeat && (
        <EditSeatDialog
          seat={editingSeat}
          onSave={handleSaveSeatLabel}
          onCancel={() => setEditingSeat(null)}
        />
      )}
      <Card>{/* ... Card สำหรับ Update Layout เหมือนเดิม ... */}</Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Seats</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seats.map((seat) => (
                <TableRow key={seat.id}>
                  <TableCell>{seat.label}</TableCell>
                  <TableCell>
                    R{seat.row}, C{seat.col}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSeat(seat)}
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
  );
}
