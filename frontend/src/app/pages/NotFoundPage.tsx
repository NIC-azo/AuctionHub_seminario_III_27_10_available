import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="grid min-h-[65vh] place-items-center px-5 py-16 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-900"><SearchX size={27} /></span>
        <p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-800">Error 404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Esta página no está en el catálogo.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Puede que el enlace haya cambiado. Vuelve al inicio para seguir explorando.</p>
        <Link className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800" to="/"><ArrowLeft size={15} /> Ir al catálogo</Link>
      </div>
    </section>
  );
}
