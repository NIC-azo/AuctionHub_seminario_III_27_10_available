import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CircleHelp,
  Gavel,
  History,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Tag,
  UserCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  buyProduct,
  getProduct,
  listProductBids,
  placeBid,
} from "../../api/products.api";
import { useAuthStore } from "../../store/auth.store";

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  maximumFractionDigits: 2,
});

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [bidAmount, setBidAmount] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const productQuery = useQuery({
    queryKey: ["products", id],
    queryFn: () => {
      if (!id) throw new Error("No se encontró el identificador del artículo.");
      return getProduct(id);
    },
    enabled: Boolean(id),
  });

  const bidsQuery = useQuery({
    queryKey: ["products", id, "bids"],
    queryFn: () => {
      if (!id) return [];
      return listProductBids(id);
    },
    enabled: Boolean(id),
  });

  const bidMutation = useMutation({
    mutationFn: (amount: number) => {
      if (!id) throw new Error("ID de producto no válido");
      return placeBid(id, amount);
    },
    onSuccess: () => {
      setActionSuccess("¡Tu puja ha sido registrada con éxito!");
      setActionError(null);
      setBidAmount("");
      void queryClient.invalidateQueries({ queryKey: ["products", id] });
      void queryClient.invalidateQueries({ queryKey: ["products", id, "bids"] });
    },
    onError: (err: any) => {
      setActionError(err?.message || "Ocurrió un error al procesar la puja.");
      setActionSuccess(null);
    },
  });

  const buyMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID de producto no válido");
      return buyProduct(id);
    },
    onSuccess: () => {
      setActionSuccess("¡Felicitaciones! Has adquirido este artículo.");
      setActionError(null);
      void queryClient.invalidateQueries({ queryKey: ["products", id] });
      void queryClient.invalidateQueries({ queryKey: ["products", id, "bids"] });
    },
    onError: (err: any) => {
      setActionError(err?.message || "Ocurrió un error al realizar la compra.");
      setActionSuccess(null);
    },
  });

  if (productQuery.isPending) {
    return (
      <div
        className="grid min-h-[60vh] place-items-center text-sm text-slate-500"
        role="status"
      >
        <Loader2 className="animate-spin text-emerald-800" size={28} />
      </div>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 text-center">
        <CircleHelp className="text-rose-700" size={30} />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          No pudimos encontrar este artículo.
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {productQuery.error?.message ?? "Puede que ya no esté disponible."}
        </p>
        <Link
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-950 px-4 py-2.5 text-xs font-semibold text-white"
          to="/"
        >
          <ArrowLeft size={15} /> Volver al catálogo
        </Link>
      </section>
    );
  }

  const product = productQuery.data;
  const isAvailable = product.status === "available";
  const isOwner = user?.id === product.sellerId;
  const isWinner = user?.id === product.winnerId;
  const minRequiredBid = product.currentPrice > 0 ? product.currentPrice : product.initialPrice;

  function handleBidSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const numericAmount = Number(bidAmount);
    if (!numericAmount || numericAmount <= minRequiredBid) {
      setActionError(`La puja debe ser mayor a ${currency.format(minRequiredBid)}`);
      return;
    }

    bidMutation.mutate(numericAmount);
  }

  function handleBuySubmit() {
    setActionError(null);
    setActionSuccess(null);

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (
      window.confirm(
        `¿Confirmas la compra inmediata por ${currency.format(product.currentPrice > 0 ? product.currentPrice : product.initialPrice)}?`,
      )
    ) {
      buyMutation.mutate();
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <Link
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-emerald-900"
        to="/"
      >
        <ArrowLeft size={15} /> Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
        {/* Columna Izquierda: Imagen y Estado */}
        <div className="flex flex-col gap-6">
          <div className="relative grid min-h-[340px] place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-stone-100 to-emerald-50 sm:min-h-[460px]">
            {product.imageUrl ? (
              <img
                className="absolute inset-0 h-full w-full object-contain"
                src={product.imageUrl}
                alt={product.title}
              />
            ) : (
              <ImageIcon className="text-emerald-900/40" size={42} />
            )}
            <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[11px] font-semibold text-emerald-900 shadow-sm backdrop-blur">
              <span
                className={`size-1.5 rounded-full ${
                  isAvailable ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {isAvailable ? "Disponible en subasta" : "Subasta finalizada / Vendido"}
            </span>
          </div>

          {/* Historial de Pujas */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-slate-600">
                <History size={15} className="text-emerald-800" /> Historial de Pujas
              </h2>
              <span className="text-[11px] text-slate-400">
                {bidsQuery.data?.length ?? 0} {bidsQuery.data?.length === 1 ? "oferta" : "ofertas"}
              </span>
            </div>

            <div className="mt-3 divide-y divide-stone-100 max-h-64 overflow-y-auto">
              {bidsQuery.isPending && (
                <p className="py-4 text-center text-xs text-slate-400">Cargando pujas...</p>
              )}
              {bidsQuery.data && bidsQuery.data.length === 0 && (
                <p className="py-5 text-center text-xs text-slate-400">
                  Aún no hay pujas registradas. ¡Sé el primero en ofertar!
                </p>
              )}
              {bidsQuery.data?.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="grid size-6 place-items-center rounded-full bg-stone-100 font-semibold text-slate-600 text-[10px]">
                      {b.user?.username?.slice(0, 2).toUpperCase() ?? "AH"}
                    </span>
                    <span className="font-medium">{b.user?.username ?? "Usuario"}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-900">
                      {currency.format(b.amount)}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {new Date(b.createdAt).toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Detalles y Acciones de Subasta */}
        <div className="flex flex-col py-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-emerald-800">
            <Tag size={13} /> Artículo de la comunidad
          </span>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.04em] text-slate-900 sm:text-5xl">
            {product.title}
          </h1>
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={15} /> Publicado el{" "}
            {new Date(product.createdAt).toLocaleDateString("es-PE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          {/* Tarjeta de Precios */}
          <div className="mt-8 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <span className="text-xs text-slate-500">
              {isAvailable ? "Precio actual de subasta" : "Precio final adjudicado"}
            </span>
            <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-950">
              {currency.format(product.currentPrice > 0 ? product.currentPrice : product.initialPrice)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Precio base inicial: {currency.format(product.initialPrice)}
            </p>
          </div>

          {/* Notificaciones de éxito o error */}
          {actionSuccess && (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900">
              {actionSuccess}
            </div>
          )}
          {actionError && (
            <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800">
              {actionError}
            </div>
          )}

          {/* Acciones de Pujar y Comprar */}
          {isAvailable && !isOwner && (
            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
              <h3 className="text-xs font-bold uppercase tracking-[.12em] text-emerald-950">
                Participar en la subasta
              </h3>

              <form onSubmit={handleBidSubmit} className="mt-4 flex flex-col gap-3">
                <label className="text-[11px] font-medium text-slate-600">
                  Ofertar un monto mayor a {currency.format(minRequiredBid)}:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-semibold">S/</span>
                    <input
                      type="number"
                      step="any"
                      min={minRequiredBid + 0.01}
                      placeholder={(minRequiredBid + 5).toFixed(2)}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-white pl-8 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={bidMutation.isPending || !bidAmount}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {bidMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Gavel size={14} />
                    )}
                    Pujar ahora
                  </button>
                </div>
              </form>

              <div className="relative my-4 flex items-center justify-center">
                <div className="w-full border-t border-stone-200" />
                <span className="absolute bg-emerald-50 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  o
                </span>
              </div>

              <button
                type="button"
                onClick={handleBuySubmit}
                disabled={buyMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-900/20 bg-white px-4 py-2.5 text-xs font-semibold text-emerald-950 shadow-sm transition hover:bg-emerald-100 disabled:opacity-50"
              >
                {buyMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ShoppingBag size={14} />
                )}
                Compra directa inmediata
              </button>
            </div>
          )}

          {isOwner && (
            <p
              className="mt-6 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-xs leading-5 text-slate-600"
              role="status"
            >
              <ShieldCheck className="mr-1 inline-block text-emerald-800" size={14} /> Eres el
              vendedor de este artículo. Las pujas de la comunidad se reflejarán aquí.
            </p>
          )}

          {!isAvailable && (
            <div className="mt-6 rounded-lg border border-stone-200 bg-stone-100 p-4 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Esta subasta ha concluido.</p>
              {isWinner && (
                <p className="mt-1 text-emerald-800 font-medium">
                  <UserCheck size={14} className="inline mr-1" /> ¡Eres el comprador ganador de este
                  artículo!
                </p>
              )}
            </div>
          )}

          <div className="mt-7">
            <h2 className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
              Sobre este artículo
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {product.description}
            </p>
          </div>

          <Link
            className="mt-auto inline-flex w-fit items-center gap-2 pt-8 text-xs font-bold text-emerald-900 hover:text-emerald-700"
            to="/"
          >
            <ArrowLeft size={14} /> Seguir explorando
          </Link>
        </div>
      </div>
    </section>
  );
}
