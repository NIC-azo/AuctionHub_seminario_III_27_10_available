import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CircleHelp, Image as ImageIcon, ShieldCheck, Tag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../../api/products.api";
import { useAuthStore } from "../../store/auth.store";

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

export function ProductDetailPage() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const productQuery = useQuery({
    queryKey: ["products", id],
    queryFn: () => {
      if (!id) throw new Error("No se encontró el identificador del artículo.");
      return getProduct(id);
    },
    enabled: Boolean(id),
  });

  if (productQuery.isPending) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500" role="status">Cargando artículo...</div>;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
        <CircleHelp className="text-rose-700" size={30} />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">No pudimos encontrar este artículo.</h1>
        <p className="mt-2 text-sm text-slate-500">{productQuery.error?.message ?? "Puede que ya no esté disponible."}</p>
        <Link className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-4 py-2.5 text-xs font-semibold text-white" to="/"><ArrowLeft size={15} /> Volver al catálogo</Link>
      </section>
    );
  }

  const product = productQuery.data;
  const isAvailable = product.status === "available";
  const isOwner = user?.id === product.sellerId;
  const isPrivilegedSeller = user?.role === "admin" || user?.role === "seller";

  return (
    <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <Link className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-emerald-900" to="/"><ArrowLeft size={15} /> Volver al catálogo</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
        <div className="relative grid min-h-[340px] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-stone-100 to-emerald-50 sm:min-h-[500px]">
          {product.imageUrl ? (
            <img className="absolute inset-0 h-full w-full object-contain" src={product.imageUrl} alt={product.title} />
          ) : (
            <ImageIcon className="text-emerald-900/40" size={42} />
          )}
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[11px] font-semibold text-emerald-900 shadow-sm backdrop-blur">
            <span className={`size-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-slate-400"}`} />
            {isAvailable ? "Disponible" : "Vendido"}
          </span>
        </div>

        <div className="flex flex-col py-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-800"><Tag size={13} /> Artículo de la comunidad</span>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.04em] text-slate-900 sm:text-5xl">{product.title}</h1>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={15} /> Publicado el {new Date(product.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}</div>

          <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5">
            <span className="text-xs text-slate-500">{isAvailable ? "Precio actual" : "Precio final"}</span>
            <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-950">{currency.format(product.currentPrice)}</p>
            <p className="mt-1 text-[11px] text-slate-400">Precio inicial: {currency.format(product.initialPrice)}</p>
          </div>

          <div className="mt-7">
            <h2 className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Sobre este artículo</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{product.description}</p>
          </div>

          {isAvailable && isPrivilegedSeller && !isOwner && (
            <p className="mt-7 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900" role="status">
              <ShieldCheck className="mr-1 inline-block" size={14} /> Esta cuenta puede publicar artículos, pero solo el vendedor propietario puede gestionar esta publicación.
            </p>
          )}
          {!isAvailable && (
            <p className="mt-7 rounded-lg border border-stone-200 bg-stone-100 px-4 py-3 text-xs text-slate-600" role="status">
              Este artículo ya no está disponible en el catálogo.
            </p>
          )}
          <Link className="mt-auto inline-flex w-fit items-center gap-2 pt-8 text-xs font-bold text-emerald-900 hover:text-emerald-700" to="/"><ArrowLeft size={14} /> Seguir explorando</Link>
        </div>
      </div>
    </section>
  );
}
