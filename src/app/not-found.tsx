import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="mt-3 text-sm text-[#9cc4b8]">La ruta no existe o no tienes permiso.</p>
      <Link href="/" className="mt-6 text-sm font-semibold text-[#4ee0b8]">
        Volver al inicio
      </Link>
    </div>
  );
}
