// components/SeatTooltip.tsx
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface SeatTooltipProps {
  children: React.ReactNode;
  label: string;
  userName?: string | null;
  isBooked: boolean;
}

export function SeatTooltip({
  children,
  label,
  userName,
  isBooked,
}: SeatTooltipProps) {
  const tooltipContent = isBooked
    ? `Seat ${label} - Booked by ${userName}`
    : `Seat ${label} - Available`;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
