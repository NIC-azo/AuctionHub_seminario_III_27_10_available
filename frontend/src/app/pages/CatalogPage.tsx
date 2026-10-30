import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CircleHelp,
  Filter,
  Layers,
  Package,
  PackageSearch,
  Search,
  ShoppingBag,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { listProducts } from "../../api/products.api";
import { ProductCard } from "../components/ProductCard";
import { useAuthStore } from "../../store/auth.store";

type ScopeFilter = "all" | "mine" | "purchases";
type StatusFilter = "all" | "available" | "sold";

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const user = useAuthStore((state) => state.user);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
    staleTime: 30_000,
  });

  const rawProducts = productsQuery.data ?? [];

  // Conteos para los chips
  const totalCount = rawProducts.length;
  const availableCount = rawProducts.filter((p) => p.status === "available").length;
  const soldCount = rawProducts.filter((p) => p.status === "sold").length;
  const myProductsCount = user
    ? rawProducts.filter((p) => p.sellerId === user.id).length
    : 0;
  const myPurchasesCount = user
    ? rawProducts.filter((p) => p.winnerId === user.id).length
    : 0;

  const products = useMemo(() => {
    let list = rawProducts;

    // Filtro por pertenencia / rol de usuario
    if (scope === "mine" && user?.id) {
      list = list.filter((product) => product.sellerId === user.id);
    } else if (scope === "purchases" && user?.id) {
      list = list.filter((product) => product.winnerId === user.id);
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      list = list.filter((product) => product.status === statusFilter);
    }

    // Filtro por búsqueda de texto
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    if (!normalizedSearch) return list;

    return list.filter((product) =>
      `${product.title} ${product.description}`
        .toLocaleLowerCase("es")
        .includes(normalizedSearch),
    );
  }, [rawProducts, scope, statusFilter, search, user?.id]);

  return (
    <>
      <section className="overflow-hidden bg-[#f0f1e9]">
        <div className="mx-auto grid min-h-[480px] max-w-7xl items-center gap-7 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-emerald-900">
              <Sparkles size={13} /> Un lugar para lo extraordinario
            </span>
            <h1 className="mt-6 max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-.055em] text-slate-900 sm:text-6xl lg:text-7xl">
              Lo que buscas<br />está <span className="font-serif font-normal italic text-emerald-800">por descubrir.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600">
              Explora objetos únicos y encuentra su próximo capítulo. Publica con facilidad, descubre con curiosidad.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <a className="inline-flex items-center gap-2 rounded-lg bg-lime-200 px-5 py-3 text-xs font-bold text-emerald-950 transition hover:bg-lime-300" href="#catalogo">
                Explorar artículos <ArrowDown size={16} />
              </a>
              <Link className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900 hover:text-emerald-700" to={user?.role === "seller" || user?.role === "admin" ? "/products/new" : "/register"}>
                Empieza a vender <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-3 text-[11px] leading-5 text-slate-500">
              <span className="flex -space-x-2">
                <span className="grid size-8 place-items-center rounded-full border-2 border-[#f0f1e9] bg-emerald-900 text-[9px] font-bold text-lime-100">AH</span>
                <span className="grid size-8 place-items-center rounded-full border-2 border-[#f0f1e9] bg-orange-200 text-[9px] font-bold text-orange-900">+</span>
              </span>
              <span><strong className="text-slate-700">Descubrimientos auténticos</strong><br />Cada pieza tiene una historia</span>
            </div>
          </div>

          <div className="relative mx-auto grid h-[330px] w-full max-w-[500px] place-items-center sm:h-[390px]">
            <div className="absolute size-[300px] rounded-full border border-emerald-900/10 sm:size-[370px]" />
            <div className="absolute size-[235px] rounded-full border border-emerald-900/10 sm:size-[300px]" />
            <div className="absolute right-[12%] top-[10%] size-14 rounded-full bg-orange-300/80 shadow-[0_0_0_12px_rgba(253,186,116,.15)]" />
            <div className="relative z-10 flex h-60 w-40 -rotate-6 flex-col items-center justify-end drop-shadow-2xl">
              <div className="z-10 h-9 w-20 rounded-[50%] border border-amber-900/60 bg-gradient-to-r from-amber-800 via-amber-200 to-amber-700" />
              <div className="-mt-2 h-12 w-12 border-x-4 border-amber-800/70 bg-gradient-to-r from-amber-700 via-amber-100 to-amber-800" />
              <div className="-mt-3 h-32 w-36 rounded-[48%_48%_35%_35%/32%_32%_58%_58%] border border-amber-900/50 bg-gradient-to-r from-amber-800 via-amber-200 to-amber-800 shadow-inner" />
              <div className="-mt-2 h-6 w-40 rounded-[50%_50%_10px_10px] border border-amber-950/50 bg-gradient-to-r from-amber-800 via-amber-200 to-amber-800" />
            </div>
            <div className="absolute left-[5%] top-[28%] rounded-lg border border-white/70 bg-white/85 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-lg backdrop-blur">
              <span className="mr-2 text-emerald-700">01</span> Pieza única
            </div>
            <div className="absolute bottom-[13%] right-[2%] rounded-lg border border-white/70 bg-white/85 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-lg backdrop-blur">
              <span className="mr-2 text-emerald-700">✦</span> Descubre algo especial
            </div>
            <p className="absolute bottom-[1%] right-[2%] text-right text-sm font-bold leading-5 text-emerald-950">
              Objetos con<br /><span className="font-serif text-base font-normal italic text-emerald-700">otra historia.</span>
            </p>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl justify-between border-t border-emerald-900/10 px-5 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500 sm:px-8">
          <span>Curado para quienes buscan diferente</span>
          <span className="inline-flex items-center gap-1">Scroll para descubrir <ArrowDown size={12} /></span>
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">El escaparate</span>
            <h2 data-testid="catalog-heading" className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Hallazgos <span className="font-serif font-normal italic text-emerald-800">para hoy.</span>
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              {scope === "mine"
                ? "Mostrando tus publicaciones registradas en la plataforma."
                : scope === "purchases"
                ? "Mostrando los artículos adjudicados a tu cuenta."
                : "Artículos compartidos por nuestra comunidad."}
            </p>
          </div>
          <label className="flex h-11 w-full items-center gap-2.5 rounded-lg border border-stone-200 bg-white px-3 text-slate-400 transition focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10 sm:max-w-xs">
            <Search size={17} />
            <span className="sr-only">Buscar productos</span>
            <input
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busca algo especial..."
            />
          </label>
        </div>

        {/* Barra de Filtros interactiva (Alcance y Estado) */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-3 sm:p-4">
          {/* Filtro de Alcance (Comunidad vs Mis Publicaciones / Compras) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 hidden items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:inline-flex">
              <Filter size={13} /> Filtrar:
            </span>

            <button
              type="button"
              onClick={() => setScope("all")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                scope === "all"
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "bg-stone-100 text-slate-600 hover:bg-stone-200"
              }`}
            >
              <Layers size={13} />
              Comunidad
              <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${scope === "all" ? "bg-emerald-800 text-lime-200" : "bg-stone-200 text-slate-600"}`}>
                {totalCount}
              </span>
            </button>

            {user?.role === "seller" && (
              <button
                type="button"
                onClick={() => setScope("mine")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  scope === "mine"
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "bg-stone-100 text-slate-600 hover:bg-stone-200"
                }`}
              >
                <UserCheck size={13} />
                Mis Publicaciones
                <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${scope === "mine" ? "bg-emerald-800 text-lime-200" : "bg-stone-200 text-slate-600"}`}>
                  {myProductsCount}
                </span>
              </button>
            )}

            {user?.role === "buyer" && (
              <button
                type="button"
                onClick={() => setScope("purchases")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  scope === "purchases"
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "bg-stone-100 text-slate-600 hover:bg-stone-200"
                }`}
              >
                <ShoppingBag size={13} />
                Mis Compras
                <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${scope === "purchases" ? "bg-emerald-800 text-lime-200" : "bg-stone-200 text-slate-600"}`}>
                  {myPurchasesCount}
                </span>
              </button>
            )}
          </div>

          {/* Filtro de Estado (Disponibles vs Vendidos vs Todos) */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-medium text-slate-400">Estado:</span>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white font-semibold"
                  : "text-slate-600 hover:bg-stone-100"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("available")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                statusFilter === "available"
                  ? "bg-emerald-100 text-emerald-900 font-semibold"
                  : "text-slate-600 hover:bg-stone-100"
              }`}
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Disponibles ({availableCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("sold")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                statusFilter === "sold"
                  ? "bg-slate-200 text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-stone-100"
              }`}
            >
              <CheckCircle2 size={12} className="text-slate-500" />
              Vendidos ({soldCount})
            </button>
          </div>
        </div>

        {productsQuery.isPending ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-slate-500" role="status">
            <span className="size-7 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-800" />
            Preparando el escaparate...
          </div>
        ) : productsQuery.isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-center" role="alert">
            <CircleHelp className="text-rose-700" size={28} />
            <h3 className="font-semibold text-slate-800">No pudimos cargar los productos.</h3>
            <p className="max-w-md text-xs leading-5 text-slate-500">{productsQuery.error.message}</p>
            <button className="rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800" type="button" onClick={() => void productsQuery.refetch()}>Reintentar</button>
          </div>
        ) : products.length > 0 ? (
          <div>
            <div className="mb-4 text-xs font-medium text-slate-500">
              Mostrando <strong className="text-slate-800">{products.length}</strong> artículo{products.length === 1 ? "" : "s"}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 text-center">
            <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-900"><PackageSearch size={27} /></span>
            <span className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">
              {search ? "Sin coincidencias" : scope === "mine" ? "Sin artículos publicados" : "El primer capítulo"}
            </span>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              {search
                ? "No encontramos artículos con esa búsqueda."
                : scope === "mine"
                ? "Aún no has publicado ningún artículo con esta cuenta."
                : scope === "purchases"
                ? "Aún no has ganado ninguna compra en subasta."
                : "El escaparate espera su primera pieza."}
            </h3>
            <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
              {search
                ? "Prueba cambiando los filtros o las palabras de búsqueda."
                : scope === "mine"
                ? "Puedes hacer clic en 'Publicar un artículo' para añadir nuevas piezas al catálogo."
                : "Sé de los primeros en compartir algo especial con la comunidad."}
            </p>
            {user?.role === "seller" && (
              <Link className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800" to="/products/new">
                Publicar un artículo <ArrowRight size={15} />
              </Link>
            )}
          </div>
        )}
      </section>

      <section className="mx-auto mb-16 grid max-w-7xl gap-4 px-5 sm:grid-cols-3 sm:px-8">
        <PromiseItem icon={<BadgeCheck size={19} />} title="Publicación sencilla" detail="Tu pieza, en pocos pasos." />
        <PromiseItem icon={<Sparkles size={19} />} title="Encuentra lo inesperado" detail="Un catálogo que crece contigo." />
        <PromiseItem icon={<CircleHelp size={19} />} title="Comunidad primero" detail="Personas reales, buenas historias." />
      </section>
    </>
  );
}

function PromiseItem({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-4">
      <span className="text-emerald-700">{icon}</span>
      <span className="text-[11px] leading-5 text-slate-500"><strong className="text-slate-800">{title}</strong><br />{detail}</span>
    </div>
  );
}
