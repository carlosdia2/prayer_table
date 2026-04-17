import { Link } from "wouter";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HandHeart, PersonStanding, Upload, Unlink2 } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";

const categorias = [
  {
    id: "liberacion",
    nombre: "Liberación",
    icono: Unlink2,
    descripcion:
      "Oraciones para quienes desean poner ante Dios ataduras, miedos, culpas, hábitos que pesan o situaciones que necesitan luz y descanso interior.",
    sirvePara:
      "Sirven especialmente para momentos de angustia, cansancio espiritual, dependencia, confusión o deseo de recuperar paz.",
    muestras: [
      "Para soltar el miedo que vuelve cada noche",
      "Para pedir libertad interior ante una carga",
    ],
  },
  {
    id: "gratitud",
    nombre: "Gratitud",
    icono: HandHeart,
    descripcion:
      "Oraciones para reconocer el bien recibido, dar gracias por lo pequeño y volver a mirar la vida desde la confianza.",
    sirvePara:
      "Sirven especialmente cuando quieres agradecer una ayuda, una respuesta, una persona, una etapa superada o un día sencillo.",
    muestras: [
      "Acción de gracias por una puerta abierta",
      "Para agradecer la presencia de quienes acompañan",
    ],
  },
  {
    id: "humildad",
    nombre: "Humildad",
    icono: PersonStanding,
    descripcion:
      "Oraciones para bajar el ruido del ego, pedir mansedumbre, aceptar límites y aprender a servir sin buscar reconocimiento.",
    sirvePara:
      "Sirven especialmente antes de pedir perdón, tomar decisiones, reconciliarte o volver al centro cuando el orgullo pesa.",
    muestras: [
      "Para pedir un corazón sencillo",
      "Para aprender a escuchar antes de responder",
    ],
  },
];

export default function Oraciones() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);

  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Selecciona un archivo CSV.");
      return;
    }

    setIsImporting(true);
    try {
      const csv = await file.text();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
      const response = await fetch(`${baseUrl}/api/admin/oraciones/import-csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ csv }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.mensaje || "No se pudo importar el CSV.");
      }

      await queryClient.invalidateQueries();

      toast.success(
        `CSV importado: ${result.insertadas} oraciones añadidas${result.omitidas ? `, ${result.omitidas} omitidas` : ""}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo importar el CSV.";
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Layout>
      <section className="relative w-full overflow-hidden border-b border-primary/20 bg-background/50 backdrop-blur-[1px]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/8 via-background/34 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/52 via-background/8 to-background/52" />
          <div className="absolute inset-0 bg-primary/5" />
        </div>

        <div className="container relative z-10 mx-auto px-4 pt-10 pb-9 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-wider leading-tight">
            Oraciones
          </h1>
          <p className="hero-subtitle mx-auto mt-4 max-w-2xl rounded-sm px-4 py-3 font-serif text-base italic leading-relaxed text-foreground/88 drop-shadow-md">
            Encuentra palabras para cada momento: libertad, gratitud y humildad para rezar con calma.
          </p>

          <div className="mx-auto mt-7 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            {categorias.map((categoria) => {
              const Icono = categoria.icono;
              return (
                <a
                  key={categoria.id}
                  href={`#${categoria.id}`}
                  className="group border border-primary/25 bg-card/90 p-4 text-center transition-colors hover:border-primary/55 hover:bg-card"
                >
                  <Icono className="mx-auto h-7 w-7 text-primary transition-transform group-hover:-translate-y-0.5" />
                  <span className="mt-3 block font-serif text-sm font-bold text-foreground">
                    {categoria.nombre}
                  </span>
                </a>
              );
            })}
          </div>

          <div className="mx-auto mt-6 max-w-2xl border border-primary/20 bg-card/88 p-4 text-left shadow-lg shadow-black/10 backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-sm font-bold text-primary">Administración</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Importa un CSV con columnas titulo, texto y categoria. Luego lo ocultaremos para usuarios sin rol admin.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleCsvImport}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2 border-primary/35 font-serif"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {isImporting ? "Importando..." : "Añadir CSV"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto space-y-8 px-4 py-10">
        {categorias.map((categoria) => {
          const Icono = categoria.icono;
          return (
            <section
              key={categoria.id}
              id={categoria.id}
              className="scroll-mt-24 border border-primary/25 bg-card/92 p-6 shadow-xl shadow-black/20 backdrop-blur-md md:p-8"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                      <Icono className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-sans text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        Categoría
                      </p>
                      <h2 className="font-serif text-2xl font-bold text-primary">{categoria.nombre}</h2>
                    </div>
                  </div>

                  <p className="mt-5 font-sans text-base leading-relaxed text-foreground/86">
                    {categoria.descripcion}
                  </p>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-muted-foreground">
                    {categoria.sirvePara}
                  </p>
                </div>

                <Button asChild variant="outline" className="border-primary/35 font-serif">
                  <Link href={`/?categoria=${encodeURIComponent(categoria.nombre)}`}>Ver oraciones</Link>
                </Button>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {categoria.muestras.map((muestra) => (
                  <div key={muestra} className="border border-primary/15 bg-background/35 p-4">
                    <p className="font-serif text-base font-bold text-foreground">{muestra}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Una guía breve para empezar a rezar sin prisa.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </Layout>
  );
}
