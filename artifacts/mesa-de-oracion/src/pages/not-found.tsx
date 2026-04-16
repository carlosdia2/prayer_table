import { Link } from "wouter";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="flex items-center gap-3 mb-6 opacity-30">
          <div className="h-px w-12 bg-primary" />
          <Flame className="w-5 h-5 text-primary" />
          <div className="h-px w-12 bg-primary" />
        </div>
        <p className="text-7xl font-serif font-bold text-primary/20 mb-4 leading-none">404</p>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-3">Página no encontrada</h1>
        <p className="text-muted-foreground font-sans max-w-sm mb-8 leading-relaxed text-sm">
          Esta página no existe o ha sido movida. Regresa al inicio para continuar rezando.
        </p>
        <Button asChild className="font-serif">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </Layout>
  );
}
