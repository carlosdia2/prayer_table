import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, Clock, MessageCircle, Star, Sparkles } from "lucide-react";
import { Oracion } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface OracionCardProps {
  oracion: Oracion;
}

export function OracionCard({ oracion }: OracionCardProps) {
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <Link href={`/oracion/${oracion.id}`}>
      <Card className="h-full flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 border border-primary/20 bg-card/80 backdrop-blur-sm overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {oracion.imagen && (
          <div className="w-full h-32 overflow-hidden border-b border-primary/20">
            <img 
              src={oracion.imagen} 
              alt={oracion.titulo} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        )}
        
        <CardHeader className="p-4 pb-2 space-y-2 relative">
          <div className="flex justify-between items-start gap-2">
            <Badge variant="outline" className="bg-background/50 text-primary border-primary/30 font-serif text-xs uppercase tracking-wider backdrop-blur-md">
              {oracion.categoria}
            </Badge>
            {oracion.duracionMinutos && (
              <div className="flex items-center text-muted-foreground text-xs font-mono">
                <Clock className="w-3 h-3 mr-1 opacity-70" />
                {oracion.duracionMinutos}m
              </div>
            )}
          </div>
          <h3 className="font-serif text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {oracion.titulo}
          </h3>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 flex-1">
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {oracion.texto}
          </p>
        </CardContent>
        
        <div className="mx-4 border-t border-primary/10 flex justify-center py-2 opacity-50">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        
        <CardFooter className="p-4 pt-0 flex justify-between items-center bg-transparent mt-auto">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-primary/20">
              <AvatarImage src={oracion.autor.avatar || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-serif">
                {getInitials(oracion.autor.nombre)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground font-medium truncate max-w-[100px]">
              {oracion.autor.nombre}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{oracion.totalAmenes + oracion.totalMeAyuda + oracion.totalLaRezareHoy}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{oracion.totalComentarios}</span>
            </div>
            {oracion.esFavorito && (
              <Star className="w-3 h-3 text-primary fill-primary" />
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}