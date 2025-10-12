// app/admin/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminPage() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  const [message, setMessage] = useState('');

  const handleUpdateLayout = async () => {
    const res = await fetch('/api/seats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, cols }),
    });

    if (res.ok) {
      setMessage('Layout updated successfully!');
    } else {
      setMessage('Failed to update layout.');
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Customize the seat layout.</CardDescription>
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
    </div>
  );
}