// components/EditSeatDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Seat = {
  id: number;
  label: string;
};

interface EditSeatDialogProps {
  seat: Seat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSeatUpdate: () => void;
}

export function EditSeatDialog({
  seat,
  open,
  onOpenChange,
  onSeatUpdate,
}: EditSeatDialogProps) {
  const [label, setLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (seat) {
      setLabel(seat.label);
    }
  }, [seat]);

  const handleSave = async () => {
    if (!seat) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/seats/${seat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });

      if (!res.ok) {
        throw new Error("Failed to update seat label.");
      }

      onSeatUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      // Here you might want to show an error toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Seat Label</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
