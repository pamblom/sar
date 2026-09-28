import { Leaf } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4ee0b8] text-[#081613] shadow-[0_0_16px_rgba(78,224,184,0.35)]">
        <Leaf className="h-5 w-5" aria-hidden />
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight text-[#f0fdf8]">SAR</span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-[#9cc4b8]">
            Acopio de residuos
          </span>
        </span>
      ) : null}
    </div>
  );
}
