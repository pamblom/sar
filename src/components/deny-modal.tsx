"use client";

import { useActionState, useState } from "react";
import { denegarSolicitud, type ActionState } from "@/actions/pesajes";
import { SubmitButton } from "./submit-button";

export function DenyModal({ id, codigo }: { id: number; codigo: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(denegarSolicitud, {} as ActionState);

  return (
    <>
      <button type="button" className="min-h-11 rounded-lg bg-surface-high px-3 text-sm text-on-variant" onClick={() => setOpen(true)}>
        Denegar
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <form action={action} className="kpi-card w-full max-w-md space-y-4 rounded-2xl p-5">
            <h2 className="text-lg font-semibold">Denegar {codigo}</h2>
            <p className="text-sm text-[#9cc4b8]">El motivo y el comentario son obligatorios (P-07.1).</p>
            <input type="hidden" name="id" value={id} />
            <label className="block space-y-1">
              <span className="label">Motivo</span>
              <select name="motivo" className="field" required defaultValue="">
                <option value="" disabled>
                  Selecciona
                </option>
                <option>Material contaminado</option>
                <option>Peso no coincide con telemetría</option>
                <option>Foto ilegible</option>
                <option>Material no admitido</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="label">Comentario</span>
              <textarea name="comentario" className="field min-h-24 py-2" required />
            </label>
            {state.error ? <p className="text-sm text-[#ffb4ab]">{state.error}</p> : null}
            <div className="flex gap-2">
              <SubmitButton className="btn-mint flex-1">Confirmar denegación</SubmitButton>
              <button type="button" className="flex-1 rounded-lg bg-surface-high py-2" onClick={() => setOpen(false)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
