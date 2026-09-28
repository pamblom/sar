import { PesajeForm } from "@/components/pesaje-form";
import { Icon } from "@/components/brand";
import { listMateriales } from "@/lib/sar";

export default async function PesajePage() {
  const materiales = await listMateriales(true);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-tertiary">
          <span className="h-2 w-2 rounded-full bg-tertiary" />
          Sensor lidar activo
        </p>
        <Icon name="help" className="text-on-variant" />
      </div>
      <div className="relative overflow-hidden rounded-3xl bg-surface-lowest">
        <div className="flex h-56 items-center justify-center bg-[radial-gradient(circle,rgba(75,221,181,0.12),transparent_60%)]">
          <div className="relative h-40 w-40">
            <div className="absolute inset-0 rounded-3xl border-2 border-tertiary/70" />
            <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-tertiary text-tertiary">
              <Icon name="qr_code_2" />
            </div>
          </div>
        </div>
        <p className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-surface-container px-3 py-1 text-[11px]">Buscando QR de estación…</p>
        <p className="pb-4 text-center text-xs text-on-variant">Apunta el visor al código QR de la pantalla en la báscula de pesaje</p>
      </div>
      <PesajeForm materiales={materiales} />
    </div>
  );
}
