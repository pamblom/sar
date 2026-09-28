import { SAR_LOGO } from "@/lib/brand";

export function Icon({
  name,
  filled,
  className = "",
}: {
  name: string;
  filled?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: `"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24` } : undefined}
      aria-hidden
    >
      {name}
    </span>
  );
}

export function SarMark({ size = 40 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SAR_LOGO}
      alt="SAR"
      width={size}
      height={size}
      className="rounded-full object-cover bg-[#081613]"
      style={{ width: size, height: size }}
    />
  );
}

export function FoliageGlow() {
  return (
    <>
      <div className="pointer-events-none absolute -top-32 left-1/2 z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-secondary-container/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-24 right-0 z-0 h-80 w-80 rounded-full bg-tertiary-container/15 blur-[120px]" />
    </>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  badge,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  badge?: string;
  icon: string;
}) {
  return (
    <article className="kpi-card relative flex flex-col justify-between overflow-hidden rounded-2xl p-5">
      <div className="pointer-events-none absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-emerald-400/10 blur-xl" />
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/90">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">
          <Icon name={icon} className="text-[20px]" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-2">
        <p className="text-3xl font-extrabold tracking-tight text-white">{value}</p>
        {badge ? (
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-200">
            {badge}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-2 text-[11px] text-emerald-200/70">{hint}</p> : null}
    </article>
  );
}

export function PageHead({
  kicker,
  title,
  badge,
  subtitle,
  icon,
}: {
  kicker?: string;
  title: string;
  badge?: string;
  subtitle?: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3.5 border-b border-primary/10 pb-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#123F36] to-[#2A6B5C] text-primary-fixed shadow-lg shadow-black/40">
        <Icon name={icon} />
      </div>
      <div>
        {kicker ? <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary/80">{kicker}</p> : null}
        <h1 className="flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-tight text-white">
          {title}
          {badge ? (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-fixed">
              {badge}
            </span>
          ) : null}
        </h1>
        {subtitle ? <p className="mt-1 text-sm text-secondary/80">{subtitle}</p> : null}
      </div>
    </div>
  );
}
