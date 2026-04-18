import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Search, Flame, Plus } from "lucide-react";
import {
  getListarOracionesQueryKey,
  getObtenerUsuarioActualQueryKey,
  useListarOraciones,
  useObtenerCategorias,
  useObtenerOracionesDestacadas,
  useObtenerOracionesRecientes,
  useObtenerUsuarioActual,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { OracionList } from "@/components/oracion-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
  };

  useEffect(() => {
    const categoria = new URLSearchParams(window.location.search).get("categoria");
    if (categoria) {
      setSelectedCategoria(categoria);
      setDebouncedSearch("");
      setSearchTerm("");
    }
  }, []);

  const { data: user } = useObtenerUsuarioActual({
    query: { retry: false, queryKey: getObtenerUsuarioActualQueryKey() },
  });
  const { data: categorias, isLoading: loadingCategorias } = useObtenerCategorias();
  const { data: destacadas, isLoading: loadingDestacadas } = useObtenerOracionesDestacadas();
  const { data: recientes, isLoading: loadingRecientes } = useObtenerOracionesRecientes();

  const isSearching = debouncedSearch !== "" || selectedCategoria !== "todas";
  const searchParams = {
    busqueda: debouncedSearch || undefined,
    categoria: selectedCategoria !== "todas" ? selectedCategoria : undefined,
  };
  const { data: searchResults, isLoading: loadingSearch } = useListarOraciones(searchParams, {
    query: { enabled: isSearching, queryKey: getListarOracionesQueryKey(searchParams) },
  });

  const handleCategoryClick = (cat: string) => {
    setSelectedCategoria(cat);
    setDebouncedSearch("");
    setSearchTerm("");
  };

  return (
    <Layout>
      {/* Hero compacto */}
      <section className="relative w-full overflow-hidden border-b border-primary/20">
        <div className="container relative mx-auto px-4 pt-10 pb-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-primary/40" />
            <Flame className="w-5 h-5 text-primary opacity-70" />
            <div className="h-px w-12 bg-primary/40" />
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-2 tracking-wider drop-shadow-md leading-tight">
            MONAKUS
          </h1>
          <p className="hero-subtitle text-base text-foreground/85 max-w-lg font-sans italic mb-6 drop-shadow-md px-4 py-2 rounded-sm">
            "Donde peregrinos modernos
            <br className="md:hidden" /> encuentran palabras para rezar."
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-lg flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
              <Input
                type="text"
                placeholder="Buscar oraciones, intenciones..."
                className="pl-10 bg-card/80 border-primary/30 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary font-sans h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-11 px-5 font-sans shrink-0">
              Buscar
            </Button>
          </form>

          {/* Filtros de categoría */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
            {loadingCategorias ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-24 rounded-full bg-primary/10" />
              ))
            ) : (
              <>
                <button
                  className={`px-4 py-1 rounded-full text-xs font-sans border transition-all ${
                    selectedCategoria === "todas"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/50 text-muted-foreground border-primary/20 hover:border-primary/50 hover:text-primary"
                  }`}
                  onClick={() => handleCategoryClick("todas")}
                >
                  Todas
                </button>
                {categorias?.map((cat) => (
                  <button
                    key={cat.categoria}
                    className={`px-4 py-1 rounded-full text-xs font-sans border transition-all ${
                      selectedCategoria === cat.categoria
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card/50 text-muted-foreground border-primary/20 hover:border-primary/50 hover:text-primary"
                    }`}
                    onClick={() => handleCategoryClick(cat.categoria)}
                  >
                    {cat.categoria}
                    <span className="ml-1.5 opacity-60 text-[10px]">({cat.conteo})</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="container mx-auto px-4 py-10">
        {isSearching ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">
                  {selectedCategoria !== "todas" ? selectedCategoria : "Resultados de búsqueda"}
                </h2>
                {searchResults && (
                  <p className="text-sm text-muted-foreground font-sans mt-0.5">
                    {searchResults.oraciones.length} oración{searchResults.oraciones.length !== 1 ? "es" : ""} encontrada{searchResults.oraciones.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <button
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans underline underline-offset-4"
                onClick={() => {
                  setSelectedCategoria("todas");
                  setDebouncedSearch("");
                  setSearchTerm("");
                }}
              >
                Limpiar filtro
              </button>
            </div>
            <OracionList
              oraciones={searchResults?.oraciones}
              isLoading={loadingSearch}
              emptyMessage="No se encontraron oraciones que coincidan."
            />
          </div>
        ) : (
          <Tabs defaultValue="destacadas" className="w-full">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <TabsList className="bg-card border border-primary/20 p-1">
                <TabsTrigger
                  value="destacadas"
                  className="font-serif text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Destacadas
                </TabsTrigger>
                <TabsTrigger
                  value="recientes"
                  className="font-serif text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Recientes
                </TabsTrigger>
              </TabsList>

              {user && (
                <Link href="/crear">
                  <Button size="sm" className="font-serif gap-2 h-9">
                    <Plus className="w-4 h-4" />
                    Escribir oración
                  </Button>
                </Link>
              )}
            </div>

            <TabsContent value="destacadas" className="mt-0">
              <OracionList
                oraciones={destacadas}
                isLoading={loadingDestacadas}
                emptyMessage="Aún no hay oraciones destacadas."
              />
            </TabsContent>

            <TabsContent value="recientes" className="mt-0">
              <OracionList
                oraciones={recientes}
                isLoading={loadingRecientes}
                emptyMessage="Aún no hay oraciones recientes."
              />
            </TabsContent>
          </Tabs>
        )}
      </section>
    </Layout>
  );
}
