import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getObtenerUsuarioActualQueryKey,
  useCrearOracion,
  useObtenerCategorias,
  useObtenerUsuarioActual,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Feather, Flame, Sparkles } from "lucide-react";

const formSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres").max(200),
  texto: z.string().min(10, "La oración debe tener al menos 10 caracteres"),
  categoria: z.string().min(1, "Selecciona una categoría"),
  duracionMinutos: z.coerce.number().min(1, "Debe ser al menos 1 minuto").optional().or(z.literal("")),
  imagen: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

export default function CrearOracion() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = useObtenerUsuarioActual({
    query: { retry: false, queryKey: getObtenerUsuarioActualQueryKey() },
  });
  
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  const { data: categorias } = useObtenerCategorias();
  const crearOracion = useCrearOracion();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      texto: "",
      categoria: "",
      duracionMinutos: "",
      imagen: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    crearOracion.mutate(
      { 
        data: {
          ...values,
          duracionMinutos: values.duracionMinutos ? Number(values.duracionMinutos) : null,
          imagen: values.imagen || null
        } 
      },
      {
        onSuccess: (data) => {
          toast.success("Oración publicada con éxito");
          setLocation(`/oracion/${data.id}`);
        },
        onError: () => {
          toast.error("Hubo un error al publicar la oración");
        }
      }
    );
  };

  if (userLoading) return <Layout><div className="flex-1 flex items-center justify-center"><Flame className="animate-pulse text-primary w-8 h-8" /></div></Layout>;
  if (!user) return null;

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-4rem)] w-full py-12 px-4">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(max-width: 767px)" srcSet="/backgrounds/bg-vertical.png" />
            <img src="/backgrounds/bg-horizontal.png" alt="Fondo" className="w-full h-full object-cover opacity-60" />
          </picture>
          <div className="absolute inset-0 bg-background/64" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Feather className="w-10 h-10 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-serif font-bold text-primary tracking-wide">Escribir Oración</h1>
            <p className="text-muted-foreground font-serif italic mt-2">"Las palabras son el puente entre el alma y lo divino"</p>
          </div>

          <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-xl p-8 shadow-2xl relative overflow-hidden">

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-lg text-foreground">Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Oración de la mañana" className="font-serif text-lg bg-background/50 border-primary/30 h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="texto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-lg text-foreground">Texto de la oración</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Escribe tu oración aquí..." 
                          className="font-serif text-lg min-h-[250px] bg-background/50 border-primary/30 leading-relaxed resize-y" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-serif text-lg text-foreground">Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="font-serif bg-background/50 border-primary/30 h-12">
                              <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="font-serif border-primary/30">
                            {categorias?.map((cat) => (
                              <SelectItem key={cat.categoria} value={cat.categoria}>
                                {cat.categoria}
                              </SelectItem>
                            ))}
                            {!categorias && <SelectItem value="Alabanza">Alabanza</SelectItem>}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duracionMinutos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-serif text-lg text-foreground">Duración (minutos)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Opcional" className="font-serif bg-background/50 border-primary/30 h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imagen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-lg text-foreground">URL de Imagen (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://ejemplo.com/imagen.jpg" className="font-serif bg-background/50 border-primary/30 h-12 text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-6 flex justify-between items-center border-t border-primary/20">
                  <Button type="button" variant="ghost" className="font-serif text-muted-foreground" onClick={() => setLocation("/")}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="lg" className="font-serif px-8" disabled={crearOracion.isPending}>
                    {crearOracion.isPending ? "Publicando..." : "Publicar Oración"}
                    {!crearOracion.isPending && <Sparkles className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
