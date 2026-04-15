import { useState } from "react";
import { Link } from "wouter";
import { Search, Flame, ScrollText, Cross } from "lucide-react";
import { useObtenerOracionesDestacadas, useObtenerOracionesRecientes, useObtenerCategorias, useListarOraciones } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { OracionList } from "@/components/oracion-list";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import heroImg from "@assets/5b66c678-515a-4ec2-af93-c5565adb9eab_1776263375028.png";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas");

  // Add debounce logic here if needed
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(searchTerm);
  };

  const { data: categorias, isLoading: loadingCategorias } = useObtenerCategorias();
  
  // Default views
  const { data: destacadas, isLoading: loadingDestacadas } = useObtenerOracionesDestacadas();
  const { data: recientes, isLoading: loadingRecientes } = useObtenerOracionesRecientes();

  // Search/Filter view
  const isSearching = debouncedSearch !== "" || selectedCategoria !== "todas";
  const { data: searchResults, isLoading: loadingSearch } = useListarOraciones(
    { 
      busqueda: debouncedSearch || undefined, 
      categoria: selectedCategoria !== "todas" ? selectedCategoria : undefined 
    },
    { query: { enabled: isSearching } }
  );

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-background border-b border-primary/20">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src={heroImg} alt="Interior de monasterio" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
          <Flame className="w-12 h-12 text-primary animate-pulse mb-6 opacity-80" />
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary mb-4 tracking-wider drop-shadow-md">
            Mesa de Oración
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-serif italic mb-8">
            "Donde peregrinos modernos encuentran palabras para rezar."
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-md relative flex items-center mb-12">
            <Search className="absolute left-3 w-5 h-5 text-primary/50" />
            <Input 
              type="text" 
              placeholder="Buscar oraciones, palabras, intenciones..." 
              className="w-full pl-10 pr-4 py-6 bg-card/80 border-primary/30 text-foreground placeholder:text-muted-foreground/70 rounded-full focus-visible:ring-primary font-serif text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="absolute right-2 rounded-full font-serif h-9">
              Buscar
            </Button>
          </form>
          
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
            {loadingCategorias ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full bg-primary/10" />)
            ) : (
              <>
                <Button 
                  variant={selectedCategoria === "todas" ? "default" : "outline"} 
                  size="sm" 
                  className={`rounded-full font-serif border-primary/30 ${selectedCategoria === "todas" ? "" : "bg-card/50 text-muted-foreground"}`}
                  onClick={() => setSelectedCategoria("todas")}
                >
                  Todas
                </Button>
                {categorias?.map((cat) => (
                  <Button 
                    key={cat.categoria} 
                    variant={selectedCategoria === cat.categoria ? "default" : "outline"} 
                    size="sm" 
                    className={`rounded-full font-serif border-primary/30 ${selectedCategoria === cat.categoria ? "" : "bg-card/50 text-muted-foreground hover:text-primary"}`}
                    onClick={() => setSelectedCategoria(cat.categoria)}
                  >
                    {cat.categoria} <span className="ml-1 opacity-50 text-[10px]">({cat.conteo})</span>
                  </Button>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {isSearching ? (
          <div>
            <div className="flex items-center gap-2 mb-8">
              <ScrollText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-bold text-foreground">Resultados de búsqueda</h2>
            </div>
            <OracionList 
              oraciones={searchResults?.oraciones} 
              isLoading={loadingSearch} 
              emptyMessage="No se encontraron oraciones que coincidan con tu búsqueda."
            />
          </div>
        ) : (
          <Tabs defaultValue="destacadas" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-card border border-primary/20 p-1">
                <TabsTrigger value="destacadas" className="font-serif data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Oraciones Destacadas
                </TabsTrigger>
                <TabsTrigger value="recientes" className="font-serif data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Añadidas Recientemente
                </TabsTrigger>
              </TabsList>
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