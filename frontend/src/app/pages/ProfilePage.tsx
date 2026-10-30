import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CircleHelp, Mail, Package, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { getUser } from "../../api/users.api";
import { listProducts } from "../../api/products.api";
import { ProductCard } from "../components/ProductCard";
import { useAuthStore } from "../../store/auth.store";

const roleName: Record<string, string> = {
  buyer: "Comprador",
  seller: "Vendedor",
  admin: "Administrador",
};

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("No se encontró la sesión del usuario.");
      return getUser(user.id);
    },
    enabled: Boolean(user?.id),
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
    staleTime: 30_000,
  });

  if (profileQuery.isPending) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500" role="status">Cargando tu perfil...</div>;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <CircleHelp className="text-rose-700" size={30} />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">No pudimos cargar tu perfil.</h1>
        <p className="mt-2 text-sm text-slate-500">{profileQuery.error?.message ?? "Vuelve a iniciar sesión e inténtalo de nuevo."}</p>
        <button className="mt-5 rounded-lg bg-emerald-950 px-4 py-2.5 text-xs font-semibold text-white" type="button" onClick={() => void profileQuery.refetch()}>Reintentar</button>
      </section>
    );
  }

  const profile = profileQuery.data;
  const initials = profile.username.slice(0, 2).toUpperCase();

  const allProducts = productsQuery.data ?? [];
  const myPublished = allProducts.filter((p) => p.sellerId === profile.id);
  const myPurchased = allProducts.filter((p) => p.winnerId === profile.id);

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <span className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-800">Tu espacio</span>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Mi perfil</h1>
      <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="h-28 bg-gradient-to-r from-emerald-950 via-emerald-800 to-lime-700" />
        <div className="px-6 pb-7 sm:px-8">
          <div className="-mt-9 grid size-[72px] place-items-center rounded-2xl border-4 border-white bg-lime-200 text-xl font-bold text-emerald-950 shadow-sm">{initials}</div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">{profile.username}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800"><BadgeCheck size={13} /> {roleName[profile.role] ?? profile.role}</span>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-stone-200 p-4">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><Mail size={14} /> Correo electrónico</span>
              <p className="mt-2 text-sm font-medium text-slate-800">{profile.email}</p>
            </div>
            <div className="rounded-xl border border-stone-200 p-4">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400"><UserRound size={14} /> Miembro desde</span>
              <p className="mt-2 text-sm font-medium text-slate-800">{new Date(profile.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección dinámica según el rol */}
      {profile.role === "seller" && (
        <div className="mt-12">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Tus publicaciones</span>
              <h3 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-900">
                <Package size={22} className="text-emerald-800" />
                Artículos que has publicado ({myPublished.length})
              </h3>
            </div>
            <Link to="/products/new" className="rounded-lg bg-emerald-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800">
              + Nueva publicación
            </Link>
          </div>

          {myPublished.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {myPublished.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-xs text-slate-500">
              No has publicado artículos aún.
            </div>
          )}
        </div>
      )}

      {profile.role === "buyer" && (
        <div className="mt-12">
          <div className="border-b border-stone-200 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Tus compras ganadas</span>
            <h3 className="mt-1 flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <ShoppingBag size={22} className="text-emerald-800" />
              Artículos adquiridos ({myPurchased.length})
            </h3>
          </div>

          {myPurchased.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {myPurchased.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-xs text-slate-500">
              Aún no tienes artículos adjudicados. ¡Visita el catálogo para participar en subastas o compras directas!
            </div>
          )}
        </div>
      )}
    </section>
  );
}
