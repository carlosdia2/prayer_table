import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useObtenerOracion,
  useAlternarFavorito,
  useReaccionarOracion,
  useListarComentarios,
  useCrearComentario,
  getObtenerOracionQueryKey,
  getListarComentariosQueryKey,
  getObtenerUsuarioActualQueryKey,
  useObtenerUsuarioActual,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock, MessageCircle, Star, Send, ArrowLeft, Flame } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function OracionDetalle() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const oracionId = id ? parseInt(id, 10) : 0;

  const queryClient = useQueryClient();
  const [comentarioTexto, setComentarioTexto] = useState("");

  const { data: currentUser } = useObtenerUsuarioActual({
    query: { retry: false, queryKey: getObtenerUsuarioActualQueryKey() },
  });

  const { data: oracion, isLoading, error } = useObtenerOracion(oracionId, {
    query: {
      enabled: !!oracionId,
      queryKey: getObtenerOracionQueryKey(oracionId),
    },
  });

  const { data: comentariosData, isLoading: loadingComentarios } = useListarComentarios(oracionId, {
    query: {
      enabled: !!oracionId,
      queryKey: getListarComentariosQueryKey(oracionId),
    },
  });

  const toggleFavorito = useAlternarFavorito();
  const reaccionar = useReaccionarOracion();
  const crearComentario = useCrearComentario();

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-destructive font-sans text-lg mb-4">No se pudo cargar la oración.</p>
          <Button variant="outline" onClick={() => setLocation("/")} className="font-serif border-primary/30">
            Volver al inicio
          </Button>
        </div>
      </Layout>
    );
  }

  const handleFavorito = () => {
    if (!currentUser) {
      toast("Inicia sesión para guardar favoritos");
      setLocation("/login");
      return;
    }
    toggleFavorito.mutate(
      { id: oracionId },
      {
        onSuccess: (data) => {
          toast.success(data.mensaje);
          queryClient.invalidateQueries({ queryKey: getObtenerOracionQueryKey(oracionId) });
        },
        onError: () => toast.error("Error al guardar"),
      }
    );
  };

  const handleReaccion = (tipo: "amen" | "me_ayuda" | "la_rezare_hoy") => {
    if (!currentUser) {
      toast("Inicia sesión para reaccionar");
      setLocation("/login");
      return;
    }
    reaccionar.mutate(
      { id: oracionId, data: { tipo } },
      {
        onSuccess: (data) => {
          toast.success(data.mensaje);
          queryClient.invalidateQueries({ queryKey: getObtenerOracionQueryKey(oracionId) });
        },
        onError: () => toast.error("Error al reaccionar"),
      }
    );
  };

  const handleComentar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast("Inicia sesión para comentar");
      setLocation("/login");
      return;
    }
    if (!comentarioTexto.trim()) return;

    crearComentario.mutate(
      { id: oracionId, data: { texto: comentarioTexto } },
      {
        onSuccess: () => {
          setComentarioTexto("");
          toast.success("Comentario publicado");
          queryClient.invalidateQueries({ queryKey: getListarComentariosQueryKey(oracionId) });
          queryClient.invalidateQueries({ queryKey: getObtenerOracionQueryKey(oracionId) });
        },
        onError: () => toast.error("Error al publicar el comentario"),
      }
    );
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Volver */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-sans text-sm mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Volver
        </button>

        {isLoading || !oracion ? (
          <div className="space-y-6">
            <Skeleton className="w-full h-64 rounded-sm bg-primary/10" />
            <Skeleton className="w-28 h-5 rounded-full bg-primary/10" />
            <Skeleton className="w-3/4 h-10 bg-primary/10" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-full h-4 bg-primary/10" />
              ))}
              <Skeleton className="w-2/3 h-4 bg-primary/10" />
            </div>
          </div>
        ) : (
          <>
            <article className="bg-card border border-primary/20 rounded-sm overflow-hidden shadow-xl shadow-black/30">
              {/* Imagen */}
              {oracion.imagen && (
                <div className="w-full h-64 md:h-80 overflow-hidden relative border-b border-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent z-10" />
                  <img
                    src={oracion.imagen}
                    alt={oracion.titulo}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              )}

              {/* Sin imagen: línea decorativa */}
              {!oracion.imagen && (
                <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
              )}

              <div className="p-6 md:p-10">
                {/* Meta */}
                <div className="flex flex-wrap gap-3 items-center mb-6">
                  <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/25 rounded-sm text-[10px] uppercase tracking-widest font-sans">
                    {oracion.categoria}
                  </span>
                  {oracion.duracionMinutos && (
                    <span className="flex items-center text-muted-foreground text-sm font-mono gap-1">
                      <Clock className="w-3.5 h-3.5 opacity-60" />
                      {oracion.duracionMinutos} min
                    </span>
                  )}
                  <span className="text-muted-foreground text-sm font-sans ml-auto">
                    {format(new Date(oracion.creadoEn), "d 'de' MMMM, yyyy", { locale: es })}
                  </span>
                </div>

                {/* Título */}
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-8 leading-tight">
                  {oracion.titulo}
                </h1>

                {/* Texto */}
                <div className="mb-10 space-y-4">
                  {oracion.texto.split("\n").filter(Boolean).map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="font-sans text-foreground/85 leading-loose text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Separador ornamental */}
                <div className="flex items-center gap-3 mb-8 opacity-50">
                  <div className="flex-1 h-px bg-primary" />
                  <span className="text-primary text-xs">✦ ✦ ✦</span>
                  <div className="flex-1 h-px bg-primary" />
                </div>

                {/* Autor y acciones */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Autor */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border-2 border-primary/25">
                      <AvatarImage src={oracion.autor.avatar || undefined} />
                      <AvatarFallback className="bg-primary/15 text-primary font-serif text-sm">
                        {getInitials(oracion.autor.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-muted-foreground font-sans italic">Escrita por</p>
                      <p className="text-sm font-medium text-foreground">{oracion.autor.nombre}</p>
                    </div>
                  </div>

                  {/* Reacciones y favorito */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={oracion.miReaccion === "amen" ? "default" : "outline"}
                      size="sm"
                      className="rounded-sm border-primary/25 font-sans text-xs h-8 gap-1.5"
                      onClick={() => handleReaccion("amen")}
                      disabled={reaccionar.isPending}
                    >
                      <Flame className="w-3 h-3" />
                      Amén
                      <span className="bg-background/20 px-1.5 py-0.5 rounded-sm text-[10px]">
                        {oracion.totalAmenes}
                      </span>
                    </Button>
                    <Button
                      variant={oracion.miReaccion === "me_ayuda" ? "default" : "outline"}
                      size="sm"
                      className="rounded-sm border-primary/25 font-sans text-xs h-8"
                      onClick={() => handleReaccion("me_ayuda")}
                      disabled={reaccionar.isPending}
                    >
                      Me ayuda
                      <span className="ml-1.5 bg-background/20 px-1.5 py-0.5 rounded-sm text-[10px]">
                        {oracion.totalMeAyuda}
                      </span>
                    </Button>
                    <Button
                      variant={oracion.miReaccion === "la_rezare_hoy" ? "default" : "outline"}
                      size="sm"
                      className="rounded-sm border-primary/25 font-sans text-xs h-8"
                      onClick={() => handleReaccion("la_rezare_hoy")}
                      disabled={reaccionar.isPending}
                    >
                      La rezaré hoy
                      <span className="ml-1.5 bg-background/20 px-1.5 py-0.5 rounded-sm text-[10px]">
                        {oracion.totalLaRezareHoy}
                      </span>
                    </Button>

                    <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

                    <Button
                      variant={oracion.esFavorito ? "default" : "outline"}
                      size="sm"
                      className="rounded-sm border-primary/25 h-8 w-8 p-0"
                      onClick={handleFavorito}
                      disabled={toggleFavorito.isPending}
                      title={oracion.esFavorito ? "Quitar de favoritos" : "Guardar en favoritos"}
                    >
                      <Star className={`w-3.5 h-3.5 ${oracion.esFavorito ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </div>
              </div>
            </article>

            {/* Sección de comentarios */}
            <section className="mt-10">
              <h2 className="text-xl font-serif text-primary mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comentarios
                <span className="text-muted-foreground text-base font-sans">({oracion.totalComentarios})</span>
              </h2>

              {/* Formulario */}
              {currentUser ? (
                <form onSubmit={handleComentar} className="mb-8 bg-card border border-primary/15 rounded-sm p-4">
                  <Textarea
                    placeholder="Añade una reflexión o petición..."
                    className="min-h-[90px] bg-background/50 border-primary/20 font-sans text-base resize-none mb-3 focus-visible:ring-primary"
                    value={comentarioTexto}
                    onChange={(e) => setComentarioTexto(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={crearComentario.isPending || !comentarioTexto.trim()}
                      className="font-serif gap-2"
                    >
                      {crearComentario.isPending ? "Publicando..." : "Publicar"}
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mb-8 bg-card/40 border border-dashed border-primary/20 p-6 rounded-sm text-center">
                  <p className="text-muted-foreground font-sans mb-4 text-sm">
                    Inicia sesión para dejar un comentario.
                  </p>
                  <Button asChild variant="outline" size="sm" className="border-primary/30 font-serif">
                    <Link href="/login">Iniciar sesión</Link>
                  </Button>
                </div>
              )}

              {/* Lista de comentarios */}
              <div className="space-y-4">
                {loadingComentarios ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full bg-primary/10 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="w-1/3 h-4 bg-primary/10" />
                        <Skeleton className="w-full h-14 bg-primary/10" />
                      </div>
                    </div>
                  ))
                ) : comentariosData && comentariosData.length > 0 ? (
                  comentariosData.map((comentario) => (
                    <div
                      key={comentario.id}
                      className="flex gap-3 p-4 rounded-sm bg-card/40 border border-primary/8"
                    >
                      <Avatar className="h-8 w-8 border border-primary/20 mt-0.5 shrink-0">
                        <AvatarImage src={comentario.autor.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-serif text-xs">
                          {getInitials(comentario.autor.nombre)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1.5">
                          <span className="font-medium text-foreground text-sm">{comentario.autor.nombre}</span>
                          <span className="text-xs text-muted-foreground font-sans shrink-0">
                            {format(new Date(comentario.creadoEn), "d MMM yyyy", { locale: es })}
                          </span>
                        </div>
                        <p className="text-foreground/75 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                          {comentario.texto}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground font-sans italic py-10 border border-dashed border-primary/15 rounded-sm text-sm">
                    Aún no hay comentarios. Sé el primero en compartir una reflexión.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
