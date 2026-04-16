import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, Home, Plus, Bookmark, User, LogOut, Loader2, Flame, Moon, Sun } from "lucide-react";
import { useObtenerUsuarioActual, useCerrarSesion, getObtenerUsuarioActualQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    return window.localStorage.getItem("mesa-theme") === "light" ? "light" : "dark";
  });
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useObtenerUsuarioActual({
    query: { retry: false, queryKey: getObtenerUsuarioActualQueryKey() },
  });

  const logout = useCerrarSesion();

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("mesa-theme", theme);
  }, [theme]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getObtenerUsuarioActualQueryKey() });
        setLocation("/");
      },
    });
  };

  const desktopLinks = [
    { href: "/", label: "Inicio" },
    ...(user
      ? [
          { href: "/crear", label: "Escribir" },
          { href: "/favoritos", label: "Favoritos" },
        ]
      : []),
  ];

  return (
    <div className="monastic-page-bg min-h-[100dvh] flex flex-col bg-background/70">
      {/* Barra superior */}
      <header className="sticky top-0 z-50 w-full border-b border-primary/15 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Flame className="h-5 w-5 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="font-serif text-base font-bold text-primary tracking-wider hidden sm:inline">
              Mesa de Oración
            </span>
          </Link>

          {/* Nav escritorio */}
          <nav className="hidden md:flex items-center gap-6">
            {desktopLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-sans transition-colors hover:text-primary",
                  location === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Zona de usuario */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              className="h-8 w-8 inline-flex items-center justify-center rounded-sm border border-primary/35 bg-card/75 text-primary shadow-sm shadow-black/20 transition-colors hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              title={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
              aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative h-8 w-8 rounded-full border border-primary/25 bg-muted hover:border-primary/50 transition-colors overflow-hidden focus:outline-none focus:ring-1 focus:ring-primary">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-primary absolute inset-0 m-auto" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-card border-primary/20">
                  <div className="px-3 py-2">
                    <p className="font-sans font-medium text-foreground text-sm truncate">{user.nombre}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-primary/15" />
                  <DropdownMenuItem asChild>
                    <Link href="/mis-oraciones" className="cursor-pointer flex items-center gap-2 font-sans text-sm">
                      <BookOpen className="h-4 w-4" />
                      Panel de autor
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favoritos" className="cursor-pointer flex items-center gap-2 font-sans text-sm">
                      <Bookmark className="h-4 w-4" />
                      Mis favoritos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-primary/15" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive font-sans text-sm gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-serif text-xs h-8"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-card/30 py-6 pb-24 md:pb-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3 opacity-30">
            <div className="h-px w-16 bg-primary" />
            <Flame className="h-4 w-4 text-primary" />
            <div className="h-px w-16 bg-primary" />
          </div>
          <p className="text-xs text-muted-foreground font-sans max-w-md mx-auto leading-relaxed">
            Mesa de Oración · Contenido espiritual compartido por la comunidad.
            Este sitio no sustituye la guía espiritual personal.
          </p>
        </div>
      </footer>

      {/* Barra navegación móvil */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-primary/15 bg-background/96 backdrop-blur-md">
        <div className="flex items-center h-16">
          <Link
            href="/"
            className={cn(
              "flex-1 flex flex-col items-center justify-center h-full gap-1 text-[10px] transition-colors",
              location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <Home className="h-5 w-5" />
            Inicio
          </Link>

          <Link
            href="/favoritos"
            className={cn(
              "flex-1 flex flex-col items-center justify-center h-full gap-1 text-[10px] transition-colors",
              location === "/favoritos" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <Bookmark className="h-5 w-5" />
            Favoritos
          </Link>

          {/* Botón central crear */}
          <div className="flex-none px-4 flex justify-center">
            <Link
              href="/crear"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity border-2 border-background -mt-5"
            >
              <Plus className="h-5 w-5" />
            </Link>
          </div>

          <Link
            href="/mis-oraciones"
            className={cn(
              "flex-1 flex flex-col items-center justify-center h-full gap-1 text-[10px] transition-colors",
              location === "/mis-oraciones" ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <BookOpen className="h-5 w-5" />
            Mis Oraciones
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center justify-center h-full gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Salir
            </button>
          ) : (
            <Link
              href="/login"
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-full gap-1 text-[10px] transition-colors",
                location === "/login" ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <User className="h-5 w-5" />
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
