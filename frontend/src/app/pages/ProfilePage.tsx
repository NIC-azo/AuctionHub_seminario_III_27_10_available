import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CircleHelp, Mail, UserRound } from "lucide-react";
import { getUser } from "../../api/users.api";
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

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
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
    </section>
  );
}
