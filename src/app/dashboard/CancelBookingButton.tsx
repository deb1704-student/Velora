"use client";

import { useState } from "react";
import { cancelBookingAction } from "@/app/actions/booking";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Are you sure you wish to cancel this appointment reservation?")) {
      return;
    }

    setLoading(true);
    const result = await cancelBookingAction(bookingId);
    setLoading(false);

    if (!result.success) {
      alert(result.error || "Failed to cancel booking.");
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="mt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-red-700 underline hover:text-red-900 disabled:opacity-50"
    >
      {loading ? "CANCELING..." : "[ CANCEL APPOINTMENT ]"}
    </button>
  );
}
