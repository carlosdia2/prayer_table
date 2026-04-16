import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, MessageCircle, Star, Flame } from "lucide-react";
import type { Oracion } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface OracionCardProps {
  oracion: Oracion;
}

const CATEGORY_ICONS: Record<string, string> = {
  "Alabanza": "✦",
  "Súplica": "✦",
  "Acción de gracias": "✦",
  "Intercesión": "✦",
  "Contrición": "✦",
  "Meditación": "✦",
  "Novena": "✦",
  "Rosario": "✦",
  "Salmo": "✦",
  "Serenidad": "✦",
  "Sanación": "✦",
  "Sabiduría": "✦",
};

export function OracionCard({ oracion }: OracionCardProps) {
  const initials = oracion.autor.nombre.substring(0, 2).toUpperCase();
  const totalReacciones = oracion.totalAmenes + oracion.totalMeAyuda + oracion.totalLaRezareHoy;

  return (
    <Link href={`/oracion/${oracion.id}`}>
      <article className="group h-full flex flex-col cursor-pointer relative bg-card border border-primary/15 rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
        
        {/* Imagen de cabecera si existe */}
        {oracion.imagen && (
          <div className="w-full h-36 overflow-hidden shrink-0 border-b border-primary/10">
            <img
              src={oracion.imagen}
              alt={oracion.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
            />
          </div>
        )}

        {/* Sin imagen: línea decorativa superior */}
        {!oracion.imagen && (
          <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        )}

        <div className="flex flex-col flex-1 p-5">
          {/* Cabecera: categoría y duración */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-sm text-[10px] uppercase tracking-widest font-sans">
              {oracion.categoria}
            </span>
            {oracion.duracionMinutos && (
              <div className="flex items-center text-muted-foreground text-xs font-mono gap-0.5 shrink-0">
                <Clock className="w-3 h-3 opacity-60" />
                {oracion.duracionMinutos}m
              </div>
            )}
          </div>

          {/* Título */}
          <h3 className="font-serif text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3">
            {oracion.titulo}
          </h3>

          {/* Extracto */}
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed font-sans flex-1">
            {oracion.texto}
          </p>

          {/* Separador ornamental */}
          <div className="flex items-center gap-2 my-3 opacity-30">
            <div className="flex-1 h-px bg-primary" />
            <span className="text-primary text-[8px]">✦</span>
            <div className="flex-1 h-px bg-primary" />
          </div>

          {/* Pie: autor y stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-primary/20 shrink-0">
                <AvatarImage src={oracion.autor.avatar || undefined} />
                <AvatarFallback className="bg-primary/15 text-primary text-[9px] font-serif">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-sans truncate max-w-[100px]">
                {oracion.autor.nombre}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {totalReacciones > 0 && (
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-primary/60" />
                  <span>{totalReacciones}</span>
                </div>
              )}
              {oracion.totalComentarios > 0 && (
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{oracion.totalComentarios}</span>
                </div>
              )}
              {oracion.esFavorito && (
                <Star className="w-3 h-3 text-primary fill-primary" />
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
