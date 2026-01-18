"use client";

import { useAuth } from "./AuthProvider";

export default function MockModeBanner() {
  const { isMockMode } = useAuth();

  if (!isMockMode) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-amber-950 text-center text-sm py-1.5 px-4 font-medium">
      Mock Mode Active — Data is volatile and will not persist across server restarts
    </div>
  );
}
