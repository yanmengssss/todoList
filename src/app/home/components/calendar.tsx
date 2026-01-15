"use client";

import * as React from "react";

import { Calendar } from "@/components/ui/calendar";

export function CalendarSelf() {
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 5, 12)
  );

  return (
    <Calendar
      mode="single"
      defaultMonth={date}
      selected={date}
      onSelect={setDate}
      captionLayout="dropdown"
      className="p-0 m-auto"
    />
  );
}
