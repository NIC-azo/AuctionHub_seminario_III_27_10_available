import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Gavel,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login, register } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import type { LoginInput, RegisterInput } from "../../types/types.bd";

type AuthPagesProps = { mode: "login" | "register" };

export function AuthPages({ mode }: AuthPagesProps) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const location = useLocation();
  const saveSession = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const destination = (location.state as { from?: string } | null)?.from ?? "/";
  const onAuthenticated = (session: Awaited<ReturnType<typeof login>>) => {
    saveSession(session);
    navigate(isLogin ? destination : "/", { replace: true });
  };
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: onAuthenticated,
  });
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: onAuthenticated,
  });
  const isPending = isLogin
    ? loginMutation.isPending
    : registerMutation.isPending;
  const mutationError = isLogin
    ? loginMutation.error
    : registerMutation.error;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (isLogin) {
      loginMutation.mutate({
        email: String(formData.get("email")).trim(),
        password: String(formData.get("password")),
      } satisfies LoginInput);
      return;
    }

    const roleValue = formData.get("role");
    const role: RegisterInput["role"] =
      roleValue === "seller" ? "seller" : "buyer";
    registerMutation.mutate({
      username: String(formData.get("username")).trim(),
      email: String(formData.get("email")).trim(),
      password: String(formData.get("password")),
      role,
    });
  }

  return (
    <section className="grid min-h-[calc(100vh-68px)] lg:grid-cols-[.9fr_1.1fr]">
      <aside className="relative hidden min-h-[650px] overflow-hidden bg-emerald-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Link className="relative z-10 flex items-center gap-2 font-bold tracking-tight" to="/">
          <span className="grid size-9 place-items-center rounded-xl bg-lime-200 text-emerald-950"><Gavel size={19} /></span>
          <span className="text-lg">Auction<span className="text-lime-200">Hub</span></span>
        </Link>
        <div className="absolute left-1/2 top-[42%] grid size-[360px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-lime-100/10 before:absolute before:size-[270px] before:rounded-full before:border before:border-lime-100/10 after:absolute after:size-[190px] after:rounded-full after:border after:border-lime-100/10">
          <div className="z-10 flex h-48 w-32 -rotate-6 flex-col items-center justify-end drop-shadow-2xl">
            <div className="h-7 w-16 rounded-[50%] border border-amber-900/60 bg-gradient-to-r from-amber-800 via-amber-200 to-amber-700" />
            <div className="-mt-2 h-10 w-10 border-x-4 border-amber-800/70 bg-gradient-to-r from-amber-700 via-amber-100 to-amber-800" />
            <div className="-mt-3 h-24 w-28 rounded-[48%_48%_35%_35%/32%_32%_58%_58%] border border-amber-900/50 bg-gradient-to-r from-amber-800 via-amber-200 to-amber-800" />
            <div className="-mt-2 h-5 w-32 rounded-[50%_50%_10px_10px] border border-amber-950/50 bg-gradient-to-r from-amber-800 via-amber-200 to-amber-800" />
          </div>
          <span className="absolute right-8 top-14 text-3xl text-lime-200">✳</span>
        </div>
        <div className="relative z-10 max-w-md">
          <span className="text-[10px] font-bold uppercase tracking-[.18em] text-lime-200">Más que un marketplace</span>
          <p className="mt-3 text-3xl font-semibold leading-tight tracking-tight">Un gran hallazgo siempre <span className="font-serif font-normal italic text-lime-200">encuentra</span> su lugar.</p>
          <Link className="mt-7 inline-flex items-center gap-2 text-xs font-semibold text-white/70 transition hover:text-white" to="/"><ArrowLeft size={15} /> Volver al catálogo</Link>
        </div>
      </aside>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <Link className="mb-9 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-900 lg:hidden" to="/"><ArrowLeft size={15} /> Volver al catálogo</Link>
          <span className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-800">{isLogin ? "Qué bueno tenerte de vuelta" : "Tu historia empieza aquí"}</span>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-[-.04em] text-slate-900">
            {isLogin ? <>Tu próximo<br /><span className="font-serif font-normal italic text-emerald-800">hallazgo te espera.</span></> : <>Descubre. Comparte.<br /><span className="font-serif font-normal italic text-emerald-800">Encuentra tu lugar.</span></>}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{isLogin ? "Entra a tu cuenta y sigue descubriendo piezas únicas." : "Crea una cuenta para descubrir artículos o compartir tus piezas con la comunidad."}</p>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            {!isLogin && (
              <>
                <FieldLabel htmlFor="auth-username">Nombre de usuario</FieldLabel>
                <InputWithIcon icon={<UserRound size={17} />}>
                  <input className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" id="auth-username" name="username" autoComplete="username" placeholder="Tu nombre público" required minLength={3} maxLength={40} pattern="[\w.-]+" title="Usa letras, números, puntos, guiones o guiones bajos." />
                </InputWithIcon>
              </>
            )}
            <FieldLabel htmlFor="auth-email">Correo electrónico</FieldLabel>
            <InputWithIcon icon={<Mail size={17} />}>
              <input className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" id="auth-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required maxLength={254} />
            </InputWithIcon>
            {!isLogin && (
              <>
                <FieldLabel htmlFor="auth-role">¿Cómo quieres participar?</FieldLabel>
                <select className="w-full rounded-lg border border-stone-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/10" id="auth-role" name="role" defaultValue="buyer">
                  <option value="buyer">Quiero descubrir y comprar</option>
                  <option value="seller">Quiero publicar mis artículos</option>
                </select>
              </>
            )}
            <FieldLabel htmlFor="auth-password">Contraseña</FieldLabel>
            <InputWithIcon icon={<LockKeyhole size={17} />}>
              <input className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={isLogin ? "current-password" : "new-password"} placeholder={isLogin ? "Tu contraseña" : "Mínimo 8 caracteres"} required minLength={isLogin ? undefined : 8} />
              <button className="text-slate-400 transition hover:text-emerald-900" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </InputWithIcon>
            {mutationError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-800" role="alert">{mutationError.message}</p>}
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isPending}>
              {isPending ? (isLogin ? "Ingresando..." : "Creando cuenta...") : (isLogin ? "Ingresar a mi cuenta" : "Crear mi cuenta")} <ArrowRight size={17} />
            </button>
            {!isLogin && <p className="text-center text-[10px] leading-5 text-slate-400">Al continuar, aceptas usar AuctionHub de forma responsable.</p>}
          </form>

          <p className="mt-7 border-t border-stone-200 pt-5 text-center text-xs text-slate-500">
            {isLogin ? "¿Aún no tienes cuenta?" : "¿Ya eres parte?"}{" "}
            <Link className="inline-flex items-center gap-1 font-bold text-emerald-900 hover:text-emerald-700" to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Únete a AuctionHub" : "Inicia sesión"} <ArrowRight size={13} />
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-700" htmlFor={htmlFor}>{children}</label>;
}

function InputWithIcon({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return <div className="flex min-h-11 items-center gap-2.5 rounded-lg border border-stone-200 bg-white px-3 text-slate-400 transition focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10">{icon}{children}</div>;
}
