import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Flame } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { toast } from "sonner";
import { getObtenerUsuarioActualQueryKey, useObtenerUsuarioActual } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: user, isLoading } = useObtenerUsuarioActual({
    query: { retry: false, queryKey: getObtenerUsuarioActualQueryKey() },
  });

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleGoogleLogin = () => {
    window.location.href = `${apiBaseUrl}/api/auth/google`;
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/email/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          nombre: mode === "register" ? nombre : undefined,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.mensaje || "No se pudo iniciar sesion.");
      }

      await queryClient.invalidateQueries({ queryKey: getObtenerUsuarioActualQueryKey() });
      toast.success(mode === "register" ? "Cuenta creada." : "Sesion iniciada.");
      setLocation("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesion.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <picture className="absolute inset-0">
        <source media="(max-width: 767px)" srcSet="/backgrounds/bg-vertical.png" />
        <img
          src="/backgrounds/bg-horizontal.png"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-black/12 to-black/70" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 to-transparent" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-12 bg-primary/60" />
            <Flame className="h-5 w-5 text-primary" />
            <div className="h-px w-12 bg-primary/60" />
          </div>
          <h1 className="font-serif text-5xl font-bold tracking-wider text-primary drop-shadow-[0_3px_16px_rgba(0,0,0,0.7)]">
            MONAKUS
          </h1>
        </div>

        <div className="w-full border border-primary/55 bg-black/45 p-4 shadow-2xl shadow-black/50 backdrop-blur-md">
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="h-13 w-full justify-center gap-3 border-2 border-primary/70 bg-[#8b6431] font-serif text-base font-bold text-[#fff4c8] shadow-inner shadow-white/15 hover:bg-[#9b713b]"
          >
            Continuar con Google
            <SiGoogle className="h-5 w-5" />
          </Button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-primary/35" />
            <span className="font-serif text-xs uppercase tracking-[0.2em] text-primary/80">o</span>
            <div className="h-px flex-1 bg-primary/35" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3 text-left">
            {mode === "register" && (
              <Input
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Nombre"
                className="h-11 border-primary/45 bg-black/45 font-sans text-[#fff4c8] placeholder:text-[#fff4c8]/55"
              />
            )}
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Correo electronico"
              className="h-11 border-primary/45 bg-black/45 font-sans text-[#fff4c8] placeholder:text-[#fff4c8]/55"
              required
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Contrasena"
                className="h-11 border-primary/45 bg-black/45 pr-11 font-sans text-[#fff4c8] placeholder:text-[#fff4c8]/55"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/75 hover:text-primary"
                aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="outline"
              className="h-11 w-full border-primary/55 bg-black/35 font-serif text-[#fff4c8] hover:bg-primary hover:text-primary-foreground"
            >
              {isSubmitting
                ? "Entrando..."
                : mode === "login"
                  ? "Entrar con correo"
                  : "Crear cuenta"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
            className="mt-4 font-sans text-sm text-[#fff4c8]/75 underline underline-offset-4 hover:text-[#fff4c8]"
          >
            {mode === "login" ? "Crear cuenta con correo" : "Ya tengo cuenta"}
          </button>
        </div>

        <p className="mt-auto pt-10 text-center font-sans text-xs font-semibold leading-relaxed text-white/85 drop-shadow-md">
          Este sitio ofrece contenido espiritual y no sustituye la guia profesional o espiritual personal.
        </p>
      </section>
    </main>
  );
}
