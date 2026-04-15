import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useObtenerOracion, useAlternarFavorito, useReaccionarOracion, useListarComentarios, useCrearComentario, getObtenerOracionQueryKey, getListarComentariosQueryKey, useObtenerUsuarioActual } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, Clock, MessageCircle, Star, Send, ArrowLeft, ArrowUpCircle, HandsPraying } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function OracionDetalle() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const oracionId = id ? parseInt(id, 10) : 0;
  
  const queryClient = useQueryClient();
  const [comentarioTexto, setComentarioTexto] = useState("");
  
  const { data: currentUser } = useObtenerUsuarioActual({ query: { retry: false } });

  const { data: oracion, isLoading, error } = useObtenerOracion(oracionId, {
    query: {
      enabled: !!oracionId,
      queryKey: getObtenerOracionQueryKey(oracionId),
    }
  });

  const { data: comentariosData, isLoading: loadingComentarios } = useListarComentarios(oracionId, undefined, {
    query: {
      enabled: !!oracionId,
      queryKey: getListarComentariosQueryKey(oracionId),
    }
  });

  const toggleFavorito = useAlternarFavorito();
  const reaccionar = useReaccionarOracion();
  const crearComentario = useCrearComentario();

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-destructive font-serif text-lg">No se pudo cargar la oración.</p>
          <Button variant="link" onClick={() => setLocation("/")} className="mt-4">Volver al inicio</Button>
        </div>
      </Layout>
    );
  }

  const handleFavorito = () => {
    if (!currentUser) {
      toast("Debes iniciar sesión para guardar favoritos");
      setLocation("/login");
      return;
    }
    
    toggleFavorito.mutate({ oracionId }, {
      onSuccess: (data) => {
        toast(data.mensaje);
        queryClient.invalidateQueries({ queryKey: getObtenerOracionQueryKey(oracionId) });
      },
      onError: () => {
        toast.error("Hubo un error al guardar");
      }
    });
  };

  const handleReaccion = (tipo: 'amen' | 'me_ayuda' | 'la_rezare_hoy') => {
    if (!currentUser) {
      toast("Debes iniciar sesión para reaccionar");
      setLocation("/login");
      return;
    }

    reaccionar.mutate({ oracionId, data: { tipo } }, {
      onSuccess: (data) => {
        toast.success(data.mensaje);
        queryClient.invalidateQueries({ queryKey: getObtenerOracionQueryKey(oracionId) });
      },
      onError: () => {
        toast.error("Hubo un error al reaccionar");
      }
    });
  };

  const handleComentar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast("Debes iniciar sesión para comentar");
      setLocation("/login");
      return;
    }
    
    if (!comentarioTexto.trim()) return;

    crearComentario.mutate({ oracionId, data: { texto: comentarioTexto } }, {
      onSuccess: () => {
        setComentarioTexto("");
        toast.success("Comentario publicado");
        queryClient.invalidateQueries({ queryKey: getListarComentariosQueryKey(oracionId) });
        queryClient.invalidateQueries({ queryKey: getObtenerOracionQueryKey(oracionId) });
      },
      onError: () => {
        toast.error("Hubo un error al publicar el comentario");
      }
    });
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-primary font-serif" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        {isLoading || !oracion ? (
          <div className="space-y-8">
            <Skeleton className="w-full h-64 rounded-xl bg-primary/10" />
            <Skeleton className="w-32 h-6 rounded-full bg-primary/10" />
            <Skeleton className="w-3/4 h-12 bg-primary/10" />
            <div className="space-y-4">
              <Skeleton className="w-full h-4 bg-primary/10" />
              <Skeleton className="w-full h-4 bg-primary/10" />
              <Skeleton className="w-5/6 h-4 bg-primary/10" />
            </div>
          </div>
        ) : (
          <article className="bg-card/80 border border-primary/20 rounded-xl overflow-hidden shadow-2xl shadow-primary/5">
            {oracion.imagen && (
              <div className="w-full h-64 md:h-96 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10" />
                <img src={oracion.imagen} alt={oracion.titulo} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="p-6 md:p-10 relative">
              <div className="flex flex-wrap gap-3 mb-6 items-center">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full font-serif text-xs uppercase tracking-widest">
                  {oracion.categoria}
                </span>
                {oracion.duracionMinutos && (
                  <span className="flex items-center text-muted-foreground text-sm font-mono">
                    <Clock className="w-4 h-4 mr-1" />
                    {oracion.duracionMinutos} min
                  </span>
                )}
                <span className="text-muted-foreground text-sm ml-auto">
                  {format(new Date(oracion.creadoEn), "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-8 leading-tight">
                {oracion.titulo}
              </h1>

              <div className="prose prose-invert prose-lg max-w-none mb-12 font-serif text-foreground/90 leading-loose">
                {oracion.texto.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>

              <Separator className="bg-primary/20 mb-8" />

              <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/30">
                    <AvatarImage src={oracion.autor.avatar || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-serif">
                      {getInitials(oracion.autor.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground font-serif italic">Escrita por</p>
                    <p className="font-medium text-foreground">{oracion.autor.nombre}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant={oracion.miReaccion === 'amen' ? "default" : "outline"}
                    size="sm"
                    className="rounded-full border-primary/30 font-serif"
                    onClick={() => handleReaccion('amen')}
                    disabled={reaccionar.isPending}
                  >
                    Amén <span className="ml-2 bg-background/20 px-2 py-0.5 rounded-full text-xs">{oracion.totalAmenes}</span>
                  </Button>
                  <Button 
                    variant={oracion.miReaccion === 'me_ayuda' ? "default" : "outline"}
                    size="sm"
                    className="rounded-full border-primary/30 font-serif"
                    onClick={() => handleReaccion('me_ayuda')}
                    disabled={reaccionar.isPending}
                  >
                    Me ayuda <span className="ml-2 bg-background/20 px-2 py-0.5 rounded-full text-xs">{oracion.totalMeAyuda}</span>
                  </Button>
                  <Button 
                    variant={oracion.miReaccion === 'la_rezare_hoy' ? "default" : "outline"}
                    size="sm"
                    className="rounded-full border-primary/30 font-serif"
                    onClick={() => handleReaccion('la_rezare_hoy')}
                    disabled={reaccionar.isPending}
                  >
                    La rezaré hoy <span className="ml-2 bg-background/20 px-2 py-0.5 rounded-full text-xs">{oracion.totalLaRezareHoy}</span>
                  </Button>
                  
                  <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

                  <Button 
                    variant={oracion.esFavorito ? "default" : "outline"}
                    size="icon"
                    className="rounded-full border-primary/30"
                    onClick={handleFavorito}
                    disabled={toggleFavorito.isPending}
                  >
                    <Star className={`w-4 h-4 ${oracion.esFavorito ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Comments Section */}
        {oracion && (
          <div className="mt-12">
            <h3 className="text-2xl font-serif text-primary mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Comentarios ({oracion.totalComentarios})
            </h3>

            {currentUser ? (
              <form onSubmit={handleComentar} className="mb-10 bg-card/50 p-4 rounded-xl border border-primary/10">
                <Textarea 
                  placeholder="Añade una reflexión o petición..."
                  className="min-h-[100px] bg-background/50 border-primary/20 font-serif text-lg resize-none mb-3"
                  value={comentarioTexto}
                  onChange={(e) => setComentarioTexto(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={crearComentario.isPending || !comentarioTexto.trim()} className="font-serif">
                    {crearComentario.isPending ? "Publicando..." : "Publicar comentario"}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mb-10 bg-card/30 p-6 rounded-xl border border-primary/10 text-center">
                <p className="text-muted-foreground font-serif mb-4">Inicia sesión para dejar un comentario.</p>
                <Button asChild variant="outline" className="border-primary/30 font-serif">
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
              </div>
            )}

            <div className="space-y-6">
              {loadingComentarios ? (
                 Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-10 h-10 rounded-full bg-primary/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="w-1/4 h-4 bg-primary/10" />
                      <Skeleton className="w-full h-16 bg-primary/10" />
                    </div>
                  </div>
                ))
              ) : comentariosData && comentariosData.length > 0 ? (
                comentariosData.map((comentario) => (
                  <div key={comentario.id} className="flex gap-4 p-4 rounded-lg bg-card/30 border border-primary/5">
                    <Avatar className="h-10 w-10 border border-primary/20 mt-1">
                      <AvatarImage src={comentario.autor.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-serif">
                        {getInitials(comentario.autor.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-medium text-foreground">{comentario.autor.nombre}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comentario.creadoEn), "d MMM yyyy", { locale: es })}
                        </span>
                      </div>
                      <p className="text-foreground/80 font-serif whitespace-pre-wrap">{comentario.texto}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground font-serif italic py-8 border border-dashed border-primary/20 rounded-lg">
                  Aún no hay comentarios. Sé el primero en compartir una reflexión.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}