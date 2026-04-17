import { useState } from "react";
import { HeartHandshake, MessageCircle, Send, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ComentarioPeticion = {
  id: number;
  nombre: string;
  texto: string;
  hace: string;
};

type Peticion = {
  id: number;
  nombre: string;
  titulo: string;
  texto: string;
  personasRezando: number;
  acompanamientos: number;
  etiqueta: string;
  hace: string;
  comentarios: ComentarioPeticion[];
};

const peticionesIniciales: Peticion[] = [
  {
    id: 1,
    nombre: "Clara",
    titulo: "Por una operación de mi madre",
    texto:
      "Mañana operan a mi madre y en casa estamos intentando mantener la calma. Pido oración por los médicos, por su recuperación y por paz para nuestra familia.",
    personasRezando: 24,
    acompanamientos: 2,
    etiqueta: "Salud",
    hace: "hace 18 min",
    comentarios: [
      {
        id: 101,
        nombre: "Mateo",
        texto: "Rezo por tu madre y por todo el equipo médico. Que esta noche podáis descansar con paz.",
        hace: "hace 8 min",
      },
      {
        id: 102,
        nombre: "Ana",
        texto: "Señor, acompaña a esta familia y sostenlos en la espera. Gracias por compartirlo.",
        hace: "hace 5 min",
      },
    ],
  },
  {
    id: 2,
    nombre: "Un peregrino",
    titulo: "Necesito luz para una decisión importante",
    texto:
      "Estoy atravesando un cambio de trabajo y siento miedo de equivocarme. Agradezco una oración para actuar con prudencia, humildad y confianza.",
    personasRezando: 11,
    acompanamientos: 1,
    etiqueta: "Discernimiento",
    hace: "hace 42 min",
    comentarios: [
      {
        id: 201,
        nombre: "Lucía",
        texto: "A veces ayuda escribir lo que da paz y lo que nace solo del miedo. Rezo para que encuentres claridad.",
        hace: "hace 21 min",
      },
    ],
  },
];

export default function Peticiones() {
  const [peticiones, setPeticiones] = useState(peticionesIniciales);
  const [apoyadas, setApoyadas] = useState<number[]>([]);
  const [nombre, setNombre] = useState("");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [comentarios, setComentarios] = useState<Record<number, string>>({});
  const [nombresComentario, setNombresComentario] = useState<Record<number, string>>({});

  const apoyarPeticion = (id: number) => {
    if (apoyadas.includes(id)) {
      toast.info("Ya estás rezando por esta petición.");
      return;
    }

    setApoyadas((actuales) => [...actuales, id]);
    setPeticiones((actuales) =>
      actuales.map((peticion) =>
        peticion.id === id
          ? { ...peticion, personasRezando: peticion.personasRezando + 1 }
          : peticion
      )
    );
    toast.success("Gracias por acompañar esta intención.");
  };

  const publicarPeticion = (event: React.FormEvent) => {
    event.preventDefault();

    if (titulo.trim().length < 4 || texto.trim().length < 12) {
      toast.error("Escribe una petición un poco más concreta para poder acompañarte.");
      return;
    }

    const nuevaPeticion: Peticion = {
      id: Date.now(),
      nombre: nombre.trim() || "Alguien de la comunidad",
      titulo: titulo.trim(),
      texto: texto.trim(),
      personasRezando: 0,
      acompanamientos: 0,
      etiqueta: "Nueva petición",
      hace: "ahora",
      comentarios: [],
    };

    setPeticiones((actuales) => [nuevaPeticion, ...actuales]);
    setNombre("");
    setTitulo("");
    setTexto("");
    toast.success("Tu petición queda compartida con respeto y cuidado.");
  };

  const publicarComentario = (event: React.FormEvent, peticionId: number) => {
    event.preventDefault();

    const textoComentario = comentarios[peticionId]?.trim() || "";
    const nombreComentario = nombresComentario[peticionId]?.trim() || "Alguien de la comunidad";

    if (textoComentario.length < 4) {
      toast.error("Escribe un acompañamiento breve antes de enviarlo.");
      return;
    }

    setPeticiones((actuales) =>
      actuales.map((peticion) =>
        peticion.id === peticionId
          ? {
              ...peticion,
              acompanamientos: peticion.acompanamientos + 1,
              comentarios: [
                ...peticion.comentarios,
                {
                  id: Date.now(),
                  nombre: nombreComentario,
                  texto: textoComentario,
                  hace: "ahora",
                },
              ],
            }
          : peticion
      )
    );
    setComentarios((actuales) => ({ ...actuales, [peticionId]: "" }));
    setNombresComentario((actuales) => ({ ...actuales, [peticionId]: "" }));
    toast.success("Gracias por dejar una muestra de acompañamiento.");
  };

  return (
    <Layout>
      <section className="relative w-full overflow-hidden border-b border-primary/20 bg-background/50 backdrop-blur-[1px]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/38 to-background/72" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/55 via-background/8 to-background/55" />
          <div className="absolute inset-0 bg-primary/5" />
        </div>

        <div className="container relative z-10 mx-auto px-4 pt-10 pb-9 text-center">
          <HeartHandshake className="mx-auto mb-4 h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-wider leading-tight">
            Peticiones de Oración
          </h1>
          <p className="hero-subtitle mx-auto mt-4 max-w-2xl rounded-sm px-4 py-3 font-serif text-base italic leading-relaxed text-foreground/88 drop-shadow-md">
            Comparte una carga concreta. La comunidad puede leer, rezar y dejar una señal sencilla de acompañamiento.
          </p>
        </div>
      </section>

      <section className="container mx-auto grid gap-8 px-4 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <aside className="space-y-5">
          <div className="border border-primary/25 bg-card/88 p-6 shadow-xl shadow-black/20 backdrop-blur-md">
            <div className="flex items-center gap-3 border-b border-primary/15 pb-4">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-xl font-bold text-primary">Un lugar cuidado</h2>
            </div>
            <p className="mt-4 font-sans text-sm leading-relaxed text-foreground/82">
              Puedes publicar una petición de oración, una necesidad o una intención concreta.
              Este espacio está pensado para hablar con respeto, sin juicios y sin exposición innecesaria.
            </p>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <p>Las peticiones deben ser respetuosas y no usar datos privados de otras personas.</p>
              <p>Las muestras de apoyo son señales de oración, no consejos médicos, legales o espirituales definitivos.</p>
            </div>
          </div>

          <form onSubmit={publicarPeticion} className="border border-primary/25 bg-card/90 p-6 shadow-xl shadow-black/20 backdrop-blur-md">
            <h2 className="font-serif text-xl font-bold text-primary">Publicar petición</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Escribe solo lo necesario. La sencillez también protege.
            </p>

            <div className="mt-5 space-y-4">
              <Input
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Tu nombre o anónimo"
                className="bg-background/55 border-primary/30 font-sans"
              />
              <Input
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                placeholder="Ej. Por mi familia"
                className="bg-background/55 border-primary/30 font-sans"
              />
              <Textarea
                value={texto}
                onChange={(event) => setTexto(event.target.value)}
                placeholder="Cuenta brevemente tu intención..."
                className="min-h-36 bg-background/55 border-primary/30 font-sans leading-relaxed"
              />
              <Button type="submit" className="w-full gap-2 font-serif">
                <Send className="h-4 w-4" />
                Compartir petición
              </Button>
            </div>
          </form>
        </aside>

        <div className="space-y-5">
          <div className="flex flex-col gap-2 border-b border-primary/15 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Intenciones de la comunidad</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Hay personas rezando por esto. Puedes unirte con discreción.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 border border-primary/20 bg-card/70 px-3 py-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              {peticiones.reduce((total, peticion) => total + peticion.personasRezando, 0)} apoyos de oración
            </div>
          </div>

          {peticiones.map((peticion) => (
            <article key={peticion.id} className="border border-primary/25 bg-card/86 p-6 shadow-lg shadow-black/20 backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="border border-primary/30 bg-primary/12 px-3 py-1 font-serif text-xs uppercase tracking-wide text-primary">
                    {peticion.etiqueta}
                  </span>
                  <span className="text-xs text-muted-foreground">{peticion.hace}</span>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {peticion.personasRezando === 1
                    ? "Hay 1 persona rezando por esto"
                    : `${peticion.personasRezando} personas están rezando por esto`}
                </span>
              </div>

              <h3 className="mt-5 font-serif text-2xl font-bold leading-snug text-foreground">
                {peticion.titulo}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">Compartida por {peticion.nombre}</p>
              <p className="mt-4 font-sans text-base leading-relaxed text-foreground/86">
                {peticion.texto}
              </p>

              <div className="mt-6 flex flex-col gap-3 border-t border-primary/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  {peticion.acompanamientos} muestras de acompañamiento espiritual
                </div>
                <Button
                  type="button"
                  variant={apoyadas.includes(peticion.id) ? "secondary" : "default"}
                  className="gap-2 font-serif"
                  onClick={() => apoyarPeticion(peticion.id)}
                >
                  <HeartHandshake className="h-4 w-4" />
                  {apoyadas.includes(peticion.id) ? "Estás rezando" : "Estoy rezando por esto"}
                </Button>
              </div>

              <div className="mt-5 border-t border-primary/12 pt-5">
                <h4 className="font-serif text-base font-bold text-foreground">Acompañamientos</h4>
                <div className="mt-3 space-y-3">
                  {peticion.comentarios.length > 0 ? (
                    peticion.comentarios.map((comentario) => (
                      <div key={comentario.id} className="border-l-2 border-primary/30 bg-background/28 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-primary">{comentario.nombre}</span>
                          <span>{comentario.hace}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/82">{comentario.texto}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sé la primera persona en dejar una palabra de compañía.
                    </p>
                  )}
                </div>

                <form onSubmit={(event) => publicarComentario(event, peticion.id)} className="mt-4 space-y-3">
                  <Input
                    value={nombresComentario[peticion.id] || ""}
                    onChange={(event) =>
                      setNombresComentario((actuales) => ({
                        ...actuales,
                        [peticion.id]: event.target.value,
                      }))
                    }
                    placeholder="Tu nombre o anónimo"
                    className="bg-background/45 border-primary/25 font-sans"
                  />
                  <Textarea
                    value={comentarios[peticion.id] || ""}
                    onChange={(event) =>
                      setComentarios((actuales) => ({
                        ...actuales,
                        [peticion.id]: event.target.value,
                      }))
                    }
                    placeholder="Puedes dejar un consejo, una oración, una recomendación, unas gracias o una palabra de ánimo..."
                    className="min-h-24 bg-background/45 border-primary/25 font-sans leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="outline" className="gap-2 border-primary/35 font-serif">
                      <MessageCircle className="h-4 w-4" />
                      Dejar acompañamiento
                    </Button>
                  </div>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
