import { ArrowUpRight, Image as ImageIcon, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../../types/types.bd";

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

export function ProductCard({ product }: { product: Product }) {
  const isAvailable = product.status === "available";

  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/5">
      <Link
        className="relative grid h-60 place-items-center overflow-hidden bg-gradient-to-br from-stone-100 to-emerald-50"
        to={`/products/${product.id}`}
        aria-label={`Ver ${product.title}`}
      >
        {product.imageUrl ? (
          <img
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
          />
        ) : (
          <ImageIcon className="text-emerald-900/40" size={38} />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-900 backdrop-blur">
          <span className={`size-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-slate-400"}`} />
          {isAvailable ? "Disponible" : "Vendido"}
        </span>
        <span className="absolute bottom-3 right-3 grid size-8 translate-y-1 place-items-center rounded-full bg-white text-emerald-900 opacity-0 shadow transition group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={16} />
        </span>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          <span className="inline-flex items-center gap-1 text-emerald-800"><Tag size={12} /> Comunidad</span>
          <span>{new Date(product.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}</span>
        </div>
        <h3 className="mt-2 text-base font-bold tracking-tight text-slate-900">
          <Link className="transition hover:text-emerald-800" to={`/products/${product.id}`}>{product.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{product.description}</p>
        <div className="mt-4 flex items-end justify-between border-t border-stone-100 pt-3">
          <div>
            <span className="block text-[10px] text-slate-400">{isAvailable ? "Precio actual" : "Precio final"}</span>
            <strong className="mt-0.5 block text-lg font-bold tracking-tight text-emerald-950">{currency.format(product.currentPrice)}</strong>
          </div>
          <span className="grid size-8 place-items-center rounded-full bg-lime-100 text-[10px] font-bold text-emerald-900" title="Vendedor">
            {product.sellerId.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
    </article>
  );
}
