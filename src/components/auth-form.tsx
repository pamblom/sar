"use client";

import { useActionState, useMemo, useState } from "react";
import { passwordStrength } from "@/lib/format";
import { SubmitButton } from "./submit-button";
import type { AuthState } from "@/actions/auth";

export function PasswordMeter({ value }: { value: string }) {
  const strength = useMemo(() => passwordStrength(value), [value]);
  return (
    <div className="space-y-1">
      <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
        <div className="h-full bg-[#4ee0b8] transition-all" style={{ width: `${strength.percent}%` }} />
      </div>
      <p className="text-xs text-[#9cc4b8]">Seguridad: {strength.label}</p>
    </div>
  );
}

export function AuthForm({
  action,
  children,
  submitLabel,
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  children: React.ReactNode;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      {children}
      {state.error ? <p className="text-sm text-[#ffb4ab]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-[#4ee0b8]">{state.ok}</p> : null}
      <SubmitButton className="btn-mint w-full">{submitLabel}</SubmitButton>
    </form>
  );
}

export function LabeledInput({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  onValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  onValue?: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <label className="block space-y-1.5">
      <span className="label">{label}</span>
      <input
        className="field"
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onValue?.(event.target.value);
        }}
      />
    </label>
  );
}
