import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Gavel, LogOut, Plus, UserRound } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export function MainLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  function signOut() {
    logout();
    queryClient.clear();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link className="flex items-center gap-2.5 font-bold tracking-tight" to="/">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-900 text-lime-200">
              <Gavel size={19} strokeWidth={2.5} />
            </span>
            <span className="text-lg">Auction<span className="text-emerald-700">Hub</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 sm:flex" aria-label="Navegación principal">
            <NavLink className={({ isActive }) => isActive ? "text-emerald-900" : "transition hover:text-emerald-800"} to="/" end>Explorar</NavLink>
            <Link className="transition hover:text-emerald-800" to="/#como-funciona">Cómo funciona</Link>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {(user.role === "seller" || user.role === "admin") && (
                  <Link className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900 px-2.5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800 sm:px-3.5" to="/products/new">
                    <Plus size={15} /><span className="hidden sm:inline">Publicar</span>
                  </Link>
                )}
                <Link className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-emerald-800" to="/profile" aria-label="Mi perfil">
                  <UserRound size={16} /><span className="hidden sm:inline">{user.username}</span>
                </Link>
                <button className="grid size-9 place-items-center rounded-lg border border-stone-200 text-slate-500 transition hover:border-stone-300 hover:bg-white hover:text-emerald-900" type="button" onClick={signOut} aria-label="Cerrar sesión" title="Cerrar sesión">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link className="text-xs font-semibold text-slate-600 transition hover:text-emerald-900" to="/login">Ingresar</Link>
                <Link className="inline-flex items-center gap-1 rounded-lg bg-emerald-900 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-800" to="/register">
                  Crear cuenta <ArrowUpRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
      <footer id="como-funciona" className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link className="flex items-center gap-2 font-bold text-slate-800" to="/">
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-900 text-lime-200"><Gavel size={14} /></span>
            AuctionHub
          </Link>
          <p>Encuentra piezas únicas. Vende con confianza.</p>
          <span className="text-slate-400">Un marketplace en construcción, hecho para buenas historias.</span>
        </div>
      </footer>
    </div>
  );
}
