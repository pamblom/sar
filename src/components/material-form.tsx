"use client";

import { useActionState } from "react";
import { guardarMaterial, type ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import type { Material } from "@/lib/types";

export function MaterialForm({ material }: { material?: Material }) {
  const [state, action] = useActionState(guardarMaterial, {} as ActionState);
  return (
    <form action={action} className="kpi-card grid gap-3 rounded-2xl p-4 md:grid-cols-2">
      {material ? <input type="hidden" name="id" value={material.ID_Material} /> : null}
      <label className="block space-y-1 md:col-span-2">
        <span className="label">Nombre</span>
        <input className="field" name="nombre" required defaultValue={material?.Nombre} />
      </label>
      <label className="block space-y-1">
        <span className="label">Categoría</span>
        <input className="field" name="categoria" required defaultValue={material?.Categoria} />
      </label>
      <label className="block space-y-1">
        <span className="label">Kg CO₂ / kg</span>
        <input className="field" name="co2" type="number" step="0.0001" required defaultValue={material?.Impacto_Huella_Carbono} />
      </label>
      <label className="block space-y-1">
        <span className="label">Puntos por kg</span>
        <input className="field" name="puntos" type="number" step="0.01" required defaultValue={material?.Puntos_por_Kg} />
      </label>
      <label className="block space-y-1">
        <span className="label">Estado</span>
        <select name="estado" className="field" defaultValue={material?.Estado ?? "Activo"}>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </label>
      {state.error ? <p className="text-sm text-red-700 md:col-span-2">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-800 md:col-span-2">{state.ok}</p> : null}
      <div className="md:col-span-2">
        <SubmitButton className="btn-mint">{material ? "Guardar" : "Agregar material"}</SubmitButton>
      </div>
    </form>
  );
}
