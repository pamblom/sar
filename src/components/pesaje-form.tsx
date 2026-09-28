"use client";

import { useActionState, useMemo, useState } from "react";
import { crearPesajeRecolector, type ActionState } from "@/actions/pesajes";
import { SubmitButton } from "./submit-button";
import type { Material } from "@/lib/types";

export function PesajeForm({ materiales }: { materiales: Material[] }) {
  const [state, action] = useActionState(crearPesajeRecolector, {} as ActionState);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const guess = useMemo(() => {
    const file = fileName.toLowerCase();
    return (
      materiales.find((item) => file.includes(item.Nombre.toLowerCase().slice(0, 4))) ??
      materiales.find((item) => file.includes(item.Categoria.toLowerCase().slice(0, 4))) ??
      materiales[0]
    );
  }, [fileName, materiales]);

  return (
    <form action={action} className="space-y-4">
      <label className="kpi-card flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-6 text-center">
        <span className="label">Foto del material</span>
        <span className="text-sm text-[#9cc4b8]">La IA identifica tipo y código pericial</span>
        <input
          className="sr-only"
          type="file"
          name="foto"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setFileName(file?.name || "");
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Vista previa del material" className="max-h-40 rounded-xl object-cover" />
        ) : (
          <span className="rounded-full bg-surface-high px-4 py-2 text-sm">Capturar código en pantalla</span>
        )}
      </label>
      {guess ? (
        <p className="text-sm text-[#9cc4b8]">
          Sugerencia IA: <strong className="text-[#f0fdf8]">{guess.Nombre}</strong>
        </p>
      ) : null}
      <label className="block space-y-1">
        <span className="label">Material</span>
        <select name="material_id" className="field" defaultValue={guess?.ID_Material}>
          {materiales.map((item) => (
            <option key={item.ID_Material} value={item.ID_Material}>
              {item.Nombre} · {item.Puntos_por_Kg} pts/kg
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="label">Kilos (pesaje físico previo)</span>
        <input className="field" name="kilos" type="number" min="0.1" step="0.1" required />
      </label>
      {state.error ? <p className="text-sm text-[#ffb4ab]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-[#4ee0b8]">{state.ok}</p> : null}
      <SubmitButton className="btn-mint w-full" pendingLabel="Analizando…">
        Enviar validación al administrador
      </SubmitButton>
    </form>
  );
}
