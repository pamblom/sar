"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, recoverAction, registerAdminAction, registerRecolectorAction } from "@/actions/auth";
import { AuthForm, LabeledInput, PasswordMeter } from "@/components/auth-form";
import { FoliageGlow, Icon, SarMark } from "@/components/brand";
import { SAR_FOLIAGE } from "@/lib/brand";
import { ZONAS } from "@/lib/format";

const roles = ["Admin", "Operador", "Recolector"] as const;

export default function AccesoPage() {
  const params = useSearchParams();
  const initial = (params.get("rol") as (typeof roles)[number]) || "Recolector";
  const [rol, setRol] = useState<(typeof roles)[number]>(roles.includes(initial) ? initial : "Recolector");
  const [tab, setTab] = useState<"login" | "registro" | "recuperar">("login");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const hint = useMemo(() => {
    if (rol === "Admin") return "pablo.corrales@sar.local · sar2026 · SAR-ADM-01";
    if (rol === "Operador") return "juan.llanes@sar.local · sar2026";
    return "jean.saldana@sar.local · sar2026";
  }, [rol]);

  return (
    <main className="relative flex min-h-full flex-col overflow-x-hidden bg-surface">
      <FoliageGlow />
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={SAR_FOLIAGE} className="h-full w-full scale-105 object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/85 to-surface" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-5 py-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="absolute -inset-2 rounded-full bg-tertiary/30 blur-xl" />
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-surface-high p-1 shadow-2xl">
              <SarMark size={88} />
            </div>
          </div>
          <div className="mb-2 flex items-center gap-1.5 rounded-full bg-secondary-container/40 px-3 py-1 backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />
            <span className="text-[11px] font-semibold tracking-widest text-primary-fixed uppercase">SAR Enterprise</span>
          </div>
          <h1 className="text-[28px] font-bold tracking-tight">
            SAR <span className="text-tertiary">{rol === "Admin" ? "Quantum" : rol === "Operador" ? "Acopio" : "Mobile"}</span>
          </h1>
          <p className="mt-0.5 text-[11px] tracking-widest text-secondary uppercase">Sistema de Acopio de Residuos</p>
        </div>

        <div className="mb-4 grid w-full grid-cols-3 gap-1 rounded-full bg-surface-container/70 p-1">
          {roles.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRol(item)}
              className={`min-h-10 rounded-full text-xs font-semibold ${rol === item ? "bg-primary-container text-on-primary-container" : "text-on-variant"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="relative w-full overflow-hidden rounded-xl bg-surface-container/70 p-5 shadow-2xl backdrop-blur-2xl">
          <div className="absolute -top-12 left-1/2 h-12 w-48 -translate-x-1/2 bg-tertiary/20 blur-xl" />
          {tab === "login" ? (
            <>
              <h2 className="text-xl font-semibold">Bienvenido de nuevo</h2>
              <p className="mt-1 mb-4 text-xs leading-relaxed text-on-variant">
                Ingresa tus credenciales para acceder a la red pericial de acopio circular.
              </p>
              <p className="mb-3 text-[11px] text-secondary">{hint}</p>
              <AuthForm action={loginAction} submitLabel="Iniciar sesión">
                <input type="hidden" name="rol" value={rol} />
                <LabeledInput label="Usuario o correo electrónico" name="correo" type="email" required autoComplete="email" />
                <div className="relative">
                  <LabeledInput label="Contraseña" name="password" type={show ? "text" : "password"} required autoComplete="current-password" />
                  <button type="button" className="absolute right-3 top-9 text-on-variant" onClick={() => setShow((v) => !v)} aria-label="Mostrar contraseña">
                    <Icon name={show ? "visibility_off" : "visibility"} className="text-[20px]" />
                  </button>
                </div>
                {rol === "Admin" ? <LabeledInput label="Código administrador" name="codigo_admin" required /> : null}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-variant">Recordar dispositivo</span>
                  <button type="button" className="text-primary" onClick={() => setTab("recuperar")}>
                    ¿Olvidaste la clave?
                  </button>
                </div>
              </AuthForm>
            </>
          ) : null}

          {tab === "registro" && rol === "Recolector" ? (
            <AuthForm action={registerRecolectorAction} submitLabel="Crear cuenta SAR">
              <div className="grid grid-cols-2 gap-2">
                <LabeledInput label="Nombres *" name="nombres" required />
                <LabeledInput label="Apellidos *" name="apellidos" required />
              </div>
              <LabeledInput label="Fecha de nacimiento *" name="nacimiento" type="date" required />
              <LabeledInput label="Correo electrónico personal *" name="correo" type="email" required />
              <LabeledInput label="Teléfono móvil *" name="telefono" required />
              <label className="block space-y-1">
                <span className="label">Zona</span>
                <select name="zona" className="field">
                  {ZONAS.map((zona) => (
                    <option key={zona}>{zona}</option>
                  ))}
                </select>
              </label>
              <LabeledInput label="Contraseña de acceso *" name="password" type="password" required onValue={setPassword} />
              <PasswordMeter value={password} />
            </AuthForm>
          ) : null}

          {tab === "registro" && rol === "Admin" ? (
            <AuthForm action={registerAdminAction} submitLabel="Crear cuenta admin">
              <LabeledInput label="Nombres *" name="nombres" required />
              <LabeledInput label="Apellidos *" name="apellidos" required />
              <LabeledInput label="Fecha de nacimiento *" name="nacimiento" type="date" required />
              <LabeledInput label="Número de documento *" name="numero_documento" required />
              <LabeledInput label="Correo *" name="correo" type="email" required />
              <LabeledInput label="Contraseña *" name="password" type="password" required onValue={setPassword} />
              <PasswordMeter value={password} />
            </AuthForm>
          ) : null}

          {tab === "registro" && rol === "Operador" ? (
            <p className="text-sm text-on-variant">Las cuentas de operador las crea el administrador del centro de acopio.</p>
          ) : null}

          {tab === "recuperar" ? (
            <AuthForm action={recoverAction} submitLabel="Restablecer contraseña">
              <LabeledInput label="Correo, ID o código admin" name="identificador" required />
              <LabeledInput label="PIN de respaldo" name="pin" required />
              <LabeledInput label="Nueva contraseña" name="nueva" type="password" required />
            </AuthForm>
          ) : null}

          <div className="mt-4 text-center text-xs text-on-variant">
            {tab === "login" ? (
              <button type="button" className="font-semibold text-tertiary" onClick={() => setTab("registro")}>
                Solicitar alta / Crear cuenta SAR
              </button>
            ) : (
              <button type="button" className="font-semibold text-tertiary" onClick={() => setTab("login")}>
                Volver al inicio de sesión
              </button>
            )}
          </div>
        </div>
        <p className="mt-6 flex items-center gap-2 text-[11px] text-on-variant/70">
          <Icon name="verified_user" className="text-[15px] text-tertiary" />
          Cifrado TLS 1.3 • Nodo pericial SAR Mobile v2.4
        </p>
        <Link href="/" className="mt-3 text-[11px] text-secondary">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
