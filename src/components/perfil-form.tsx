"use client";

import { useActionState } from "react";
import { guardarPerfil, type ActionState } from "@/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { ZONAS } from "@/lib/format";
import type { Usuario } from "@/lib/types";

export function PerfilForm({ user }: { user: Usuario }) {
  const [state, action] = useActionState(guardarPerfil, {} as ActionState);
  return (
    <form action={action} className="kpi-card max-w-xl space-y-4 rounded-2xl p-5">
      <label className="block space-y-1">
        <span className="label">Nombres</span>
        <input className="field" name="nombres" defaultValue={user.Nombres} required />
      </label>
      <label className="block space-y-1">
        <span className="label">Apellidos</span>
        <input className="field" name="apellidos" defaultValue={user.Apellidos} required />
      </label>
      <label className="block space-y-1">
        <span className="label">Lugar de acopio</span>
        <input className="field" name="lugar" defaultValue={user.Lugar_Acopio ?? ""} />
      </label>
      <label className="block space-y-1">
        <span className="label">Zona</span>
        <select name="zona" className="field" defaultValue={user.Zona ?? "Centro"}>
          {ZONAS.map((zona) => (
            <option key={zona}>{zona}</option>
          ))}
        </select>
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="two_factor" defaultChecked={user.Two_Factor === 1} />
        Autenticación en dos pasos (PIN)
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" name="alertas" defaultChecked={user.Alertas_Sonoras === 1} />
        Alertas sonoras de nuevas entregas
      </label>
      <label className="block space-y-1">
        <span className="label">Tema</span>
        <select name="tema" className="field" defaultValue={user.Tema ?? "esmeralda"}>
          <option value="esmeralda">Esmeralda</option>
          <option value="crema">Crema</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className="label">Nueva contraseña (opcional)</span>
        <input className="field" name="password" type="password" />
      </label>
      {state.error ? <p className="text-sm text-[#ffb4ab]">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-[#4ee0b8]">{state.ok}</p> : null}
      <SubmitButton className="btn-mint">Guardar cambios</SubmitButton>
    </form>
  );
}
