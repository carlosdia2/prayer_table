import { useEffect } from "react";
import { useLocation } from "wouter";
import { useListarMisOraciones, useObtenerUsuarioActual, useEliminarOracion, getListarMisOracionesQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { BookOpen, Flame, Trash2, Clock, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function MisOraciones() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useObtenerUsuarioActual({ query: { retry: false } });
  
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  const { data: misOraciones, isLoading: oracionesLoading } = useListarMisOraciones({
    query: { enabled: !!user }
  });

  const eliminarOracion = useEliminarOracion();

  const handleEliminar = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm("¿Estás seguro de que deseas eliminar esta oración? Esta acción no se puede deshacer.")) {
      eliminarOracion.mutate(id, {
        onSuccess: (data) => {
          toast.success(data.mensaje);
          queryClient.invalidateQueries({ queryKey: getListarMisOracionesQueryKey() });
        },
        onError: () => {
          toast.error("Hubo un error al eliminar la oración");
        }
      });
    }
  };

  if (userLoading) return <Layout><div className="flex-1 flex items-center justify-center"><Flame className="animate-pulse text-primary w-8 h-8" /></div></Layout>;
  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-primary/20 flex-wrap">
          <BookOpen className="w-8 h-8 text-primary" />
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold text-primary tracking-wide">Panel de Autor</h1>
            <p className="text-muted-foreground font-serif italic">Oraciones que has compartido con la comunidad.</p>
          </div>
          <Button onClick={() => setLocation("/crear")} className="font-serif">
            Escribir nueva
          </Button>
        </div>

        {oracionesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-card/50 border-primary/20 h-32 animate-pulse" />
            ))}
          </div>
        ) : misOraciones && misOraciones.length > 0 ? (
          <div className="space-y-6">
            {misOraciones.map(oracion => (
              <Card key={oracion.id} className="bg-card/80 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setLocation(`/oracion/${oracion.id}`)}>
                <div className="flex flex-col md:flex-row">
                  {oracion.imagen && (
                    <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden">
                      <img src={oracion.imagen} alt={oracion.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="border-primary/30 text-primary font-serif">{oracion.categoria}</Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(oracion.creadoEn), "dd/MM/yyyy")}
                        </span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-foreground mb-2">{oracion.titulo}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 font-serif">{oracion.texto}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary/10">
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1" title="Reacciones"><Heart className="w-3 h-3"/> {oracion.totalAmenes + oracion.totalMeAyuda + oracion.totalLaRezareHoy}</span>
                        <span className="flex items-center gap-1" title="Comentarios"><MessageCircle className="w-3 h-3"/> {oracion.totalComentarios}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                        onClick={(e) => handleEliminar(oracion.id, e)}
                        disabled={eliminarOracion.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/30 border border-dashed border-primary/30 rounded-xl">
            <BookOpen className="w-12 h-12 text-primary/40 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-foreground mb-2">Aún no has publicado oraciones</h3>
            <p className="text-muted-foreground font-serif italic mb-6">"Tus palabras podrían ser la luz que alguien más necesita hoy."</p>
            <Button onClick={() => setLocation("/crear")} className="font-serif">
              Compartir mi primera oración
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}