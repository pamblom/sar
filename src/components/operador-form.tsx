"use client";

import { useActionState } from "react";
import { registrarEntregaOperador, type ActionState } from "@/actions/pesajes";
import { SubmitButton } from "./submit-button";
import type { Material, Usuario } from "@/lib/types";

export function OperadorForm({ recolectores, materiales }: { recolectores: Usuario[]; materiales: Material[] }) {
  const [state, action] = useActionState(registrarEntregaOperador, {} as ActionState);
  return (
    <form action={action} className="kpi-card space-y-4 rounded-2xl p-5">
      <h2 className="text-lg font-semibold text-white">Registrar entrega</h2>
      <p className="text-sm text-secondary">Registrar, pesar, validar y confirmar el material en acopio.</p>
      <label className="block space-y-1">
        <span className="label">Recolector</span>
        <select name="recolector_id" className="field" required defaultValue="">
          <option value="" disabled>
            Selecciona
          </option>
          {recolectores.map((item) => (
            <option key={item.ID_Usuario} value={item.ID_Usuario}>
              {item.Nombres} {item.Apellidos} · {item.Zona}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="label">Material</span>
        <select name="material_id" className="field" required>
          {materiales.map((item) => (
            <option key={item.ID_Material} value={item.ID_Material}>
              {item.Nombre} · {item.Puntos_por_Kg} pts/kg
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="label">Kilos</span>
        <input className="field" name="kilos" type="number" min="0.1" step="0.1" required />
      </label>
      <fieldset className="space-y-2">
        <legend className="label">¿Material válido?</legend>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="radio" name="valido" value="si" defaultChecked />
          Aprobar y confirmar
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="radio" name="valido" value="no" />
          Rechazar
        </label>
      </fieldset>
      <label className="block space-y-1">
        <span className="label">Motivo si se rechaza</span>
        <input className="field" name="motivo" placeholder="Contaminado, no admitido…" />
      </label>
      {state.error ? <p className="text-sm text-error">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-tertiary">{state.ok}</p> : null}
      <SubmitButton className="btn-mint w-full">Confirmar registro</SubmitButton>
    </form>
  );
}
