import React from 'react';
import { render, screen } from '@testing-library/react';
import { Calendar } from '@/components/ui/calendar';
import { describe, it, expect } from 'vitest';

// Simple test: past date button should be disabled (aria-disabled)

describe('Calendar past date disabling', () => {
  it('does not allow selecting a past date', async () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);

    render(
      <Calendar
        mode="single"
        disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
        selected={today}
      />
    );

    // find yesterday by label (day of month)
    const label = yesterday.getDate().toString();
  const dayBtn = screen.getAllByRole('button').find((b: HTMLElement) => b.textContent?.trim() === label);
    // Cannot guarantee presence if month rolled, so skip if not rendered
    if (dayBtn) {
      expect(dayBtn).toHaveAttribute('disabled');
    }
  });
});