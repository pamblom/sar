"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Guardando...",
  className = "btn-mint",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm disabled:opacity-60 ${className}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
