import { z } from "zod";
import { Link, useLocation } from "wouter";
import { BookOpen, Home, Plus, Bookmark, User, LogOut, Loader2, Sparkles, X, Menu } from "lucide-react";
import { useObtenerUsuarioActual, useCerrarSesion, getObtenerUsuarioActualQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useObtenerUsuarioActual({
    query: {
      retry: false,
    }
  });

  const logout = useCerrarSesion();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getObtenerUsuarioActualQueryKey() });
        setLocation("/login");
      }
    });
  };

  const navLinks = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/crear", label: "Publicar", icon: Plus, requiresAuth: true },
    { href: "/favoritos", label: "Favoritos", icon: Bookmark, requiresAuth: true },
    { href: "/mis-oraciones", label: "Mis Oraciones", icon: BookOpen, requiresAuth: true },
  ];

  const visibleLinks = navLinks.filter(link => !link.requiresAuth || user);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-monastery">
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-primary tracking-wider hidden sm:inline-block">Mesa de Oración</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {visibleLinks.map((link) => (
              <Link key={link.href} href={link.href} className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                location === link.href ? "text-primary" : "text-muted-foreground"
              )}>
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-primary/20 bg-muted hover:bg-muted/80">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.nombre} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-foreground font-serif">{user.nombre}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-border my-1" />
                  <DropdownMenuItem asChild>
                    <Link href="/mis-oraciones" className="cursor-pointer w-full flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Panel de autor</span>
                    </Link>
                  </DropdownMenuItem>
                  <div className="border-t border-border my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground font-serif">
                <Link href="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <Sparkles className="h-5 w-5 mx-auto mb-4 opacity-50" />
          <p className="text-sm max-w-md mx-auto italic">
            "Este sitio ofrece contenido espiritual y no es sustituto de ayuda profesional o guía espiritual."
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          <Link href="/" className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs",
            location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}>
            <Home className="h-5 w-5" />
            <span>Inicio</span>
          </Link>
          <Link href="/favoritos" className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs",
            location === "/favoritos" ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}>
            <Bookmark className="h-5 w-5" />
            <span>Favoritos</span>
          </Link>
          
          <div className="relative -top-5 px-2">
            <Link href="/crear" className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform border-2 border-background">
              <Plus className="h-6 w-6" />
            </Link>
          </div>

          <Link href="/mis-oraciones" className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs",
            location === "/mis-oraciones" ? "text-primary" : "text-muted-foreground hover:text-primary"
          )}>
            <BookOpen className="h-5 w-5" />
            <span>Mis Oraciones</span>
          </Link>
          
          {user ? (
             <button onClick={handleLogout} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-xs text-muted-foreground hover:text-destructive">
               <LogOut className="h-5 w-5" />
               <span>Salir</span>
             </button>
          ) : (
            <Link href="/login" className="flex flex-col items-center justify-center w-full h-full space-y-1 text-xs text-muted-foreground hover:text-primary">
              <User className="h-5 w-5" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
