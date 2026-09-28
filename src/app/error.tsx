"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">No se pudo cargar SAR</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-[#9cc4b8]">
        Revisa que la aplicación pueda escribir en la carpeta data.
      </p>
      <button type="button" onClick={reset} className="btn-mint mt-6 rounded-lg px-4 py-2">
        Reintentar
      </button>
    </div>
  );
}
