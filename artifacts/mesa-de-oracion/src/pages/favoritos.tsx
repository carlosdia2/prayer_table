import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  getListarFavoritosQueryKey,
  getObtenerUsuarioActualQueryKey,
  useListarFavoritos,
  useObtenerUsuarioActual,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { OracionList } from "@/components/oracion-list";
import { Bookmark, Flame } from "lucide-react";

export default function Favoritos() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = useObtenerUsuarioActual({
    query: { retry: false, queryKey: getObtenerUsuarioActualQueryKey() },
  });
  
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  const { data: favoritos, isLoading: favsLoading } = useListarFavoritos({
    query: { enabled: !!user, queryKey: getListarFavoritosQueryKey() }
  });

  if (userLoading) return <Layout><div className="flex-1 flex items-center justify-center"><Flame className="animate-pulse text-primary w-8 h-8" /></div></Layout>;
  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-primary/20">
          <Bookmark className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary tracking-wide">Mis Favoritos</h1>
            <p className="text-muted-foreground font-serif italic">Las oraciones que guardaste en tu corazón.</p>
          </div>
        </div>

        <OracionList 
          oraciones={favoritos} 
          isLoading={favsLoading} 
          emptyMessage="Aún no has guardado ninguna oración en favoritos."
        />
      </div>
    </Layout>
  );
}
