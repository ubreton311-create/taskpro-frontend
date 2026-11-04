import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail,
  ShieldCheck, Sparkles, Star, Wrench, Zap,
} from "lucide-react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type UserRole = "ADMIN" | "PROVIDER" | "CLIENT";

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    [key: string]: unknown;
  };
}

// Ajustado a las rutas reales de tu proyecto
function getDashboard(role: UserRole): string {
  switch (role) {
    case "ADMIN": return "/admin";
    case "PROVIDER": return "/provider";
    default: return "/";
  }
}

export default function LoginView() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function completeLogin(auth: AuthResponse) {
    if (!auth.access_token || !auth.user?.role) throw new Error("Respuesta inválida del servidor.");
    localStorage.setItem("token", auth.access_token);
    localStorage.setItem("role", auth.user.role);
    navigate(getDashboard(auth.user.role), { replace: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Ingresa correo y contraseña.");
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Credenciales incorrectas.");
      await completeLogin(data as AuthResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) return setError("Google no devolvió credencial.");
    
    setError(""); setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/google/credential`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Error al iniciar sesión con Google.");
      await completeLogin(data as AuthResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error con Google.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F9FC] p-0 font-sans text-[#252136] selection:bg-purple-200">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row lg:p-4">
        
        {/* PANEL IZQUIERDO: BRANDING (Diseño Premium de GPT) */}
        <section className="relative hidden min-h-[720px] w-full flex-col justify-between overflow-hidden rounded-[28px] bg-[#7028B5] p-10 text-white lg:flex lg:w-[52%] xl:p-14">
          <div className="pointer-events-none absolute -right-28 -top-32 h-[480px] w-[480px] rounded-full bg-fuchsia-400/25 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-24 h-[450px] w-[450px] rounded-full bg-indigo-950/35 blur-[100px]" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur-md">
              <Wrench className="h-6 w-6" strokeWidth={2.3} />
            </div>
            <span className="text-2xl font-bold tracking-tight">Task<span className="text-purple-200">Pro</span></span>
          </div>

          <div className="relative z-10 my-12 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-purple-50 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-amber-300" /> Tu próximo proyecto empieza aquí
            </div>
            <h1 className="text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
              El talento ideal.<br /><span className="text-purple-200">A un clic</span> de distancia.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-purple-100/90">
              Conecta con profesionales de confianza, encuentra soluciones y convierte tus pendientes en proyectos terminados.
            </p>
            
            <div className="relative mt-12 max-w-md">
              <div className="relative rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7028B5]"><Zap className="h-6 w-6" /></div>
                    <div><p className="font-semibold">Servicios a tu medida</p><p className="mt-1 text-sm text-purple-100">Encuentra a tu próximo experto</p></div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-purple-200" />
                </div>
                <div className="my-5 h-px bg-white/15" />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex -space-x-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#8651bf] bg-amber-200 text-xs font-bold text-amber-900">M</div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#8651bf] bg-sky-200 text-xs font-bold text-sky-900">J</div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#8651bf] bg-pink-200 text-xs font-bold text-pink-900">A</div>
                  </div>
                  <div className="flex-1"><p className="text-sm font-medium">Personas que hacen que suceda</p></div>
                  <div className="flex items-center gap-1 text-sm font-semibold"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /><span>4.9</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 text-sm text-purple-100/80">
            <span>© {new Date().getFullYear()} TaskPro</span>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><span>Una experiencia segura y confiable</span></div>
          </div>
        </section>

        {/* PANEL DERECHO: FORMULARIO */}
        <section className="flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-10 lg:min-h-0 lg:w-[48%] lg:px-12 xl:px-20">
          <div className="w-full max-w-[420px]">
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7A2FBF] text-white shadow-lg"><Wrench className="h-6 w-6" /></div>
              <span className="text-2xl font-bold tracking-tight">Task<span className="text-[#7A2FBF]">Pro</span></span>
            </div>

            <div className="mb-9">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#7A2FBF]">Bienvenido de nuevo</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-[2.15rem]">Inicia sesión</h2>
              <p className="mt-3 leading-6 text-[#777386]">Accede a tu cuenta y continúa donde lo dejaste.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#393448]">Correo electrónico</label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9691A4] transition-colors group-focus-within:text-[#7A2FBF]" />
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full rounded-2xl border border-[#E8E5EF] bg-white py-4 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-[#AAA5B6] focus:border-[#7A2FBF] focus:ring-4 focus:ring-purple-100" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="text-sm font-semibold text-[#393448]">Contraseña</label>
                  <a href="/forgot-password" className="text-xs font-semibold text-[#7A2FBF] hover:underline">¿La olvidaste?</a>
                </div>
                <div className="group relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9691A4] transition-colors group-focus-within:text-[#7A2FBF]" />
                  <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ingresa tu contraseña" className="w-full rounded-2xl border border-[#E8E5EF] bg-white py-4 pl-12 pr-12 text-sm outline-none transition-all placeholder:text-[#AAA5B6] focus:border-[#7A2FBF] focus:ring-4 focus:ring-purple-100" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#9691A4] hover:text-[#7A2FBF]">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7A2FBF] px-5 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#64239F] disabled:opacity-60">
                {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <>Iniciar sesión <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-[#E8E5EF]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A09BAC]">O continúa con</span>
              <div className="h-px flex-1 bg-[#E8E5EF]" />
            </div>

            {/* BOTÓN DE GOOGLE INTEGRADO DIRECTAMENTE */}
            <div className="relative flex min-h-[48px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#E4E1EA] bg-white transition-all hover:border-[#CFC6DB] hover:shadow-md [&>div]:!w-full [&_iframe]:!max-w-full">
              <div className="flex w-full items-center justify-center px-2 py-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google no pudo completar el inicio de sesión.")}
                  text="signin_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="360"
                  logo_alignment="left"
                />
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-[#777386]">
              ¿Todavía no tienes cuenta? <a href="/register" className="font-semibold text-[#7A2FBF] hover:underline">Crear cuenta</a>
            </p>
            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-[#A09BAC]">
              <Check className="h-4 w-4 text-[#7A2FBF]" /> <span>Al continuar, aceptas nuestros términos y privacidad.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}