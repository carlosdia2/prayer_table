import { Oracion } from "@workspace/api-client-react/src/generated/api.schemas";
import { OracionCard } from "./oracion-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

interface OracionListProps {
  oraciones?: Oracion[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function OracionList({ oraciones, isLoading, emptyMessage = "No se encontraron oraciones." }: OracionListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[300px] border border-primary/20 rounded-lg bg-card/50 p-4 flex flex-col gap-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-20 bg-primary/10" />
              <Skeleton className="h-4 w-12 bg-primary/10" />
            </div>
            <Skeleton className="h-8 w-3/4 bg-primary/10" />
            <div className="space-y-2 mt-4 flex-1">
              <Skeleton className="h-4 w-full bg-primary/10" />
              <Skeleton className="h-4 w-full bg-primary/10" />
              <Skeleton className="h-4 w-2/3 bg-primary/10" />
            </div>
            <div className="flex justify-between items-center mt-auto border-t border-primary/10 pt-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full bg-primary/10" />
                <Skeleton className="h-4 w-24 bg-primary/10" />
              </div>
              <Skeleton className="h-4 w-16 bg-primary/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!oraciones || oraciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-primary/30 rounded-lg bg-card/30">
        <Sparkles className="h-12 w-12 text-primary/40 mb-4" />
        <p className="text-muted-foreground font-serif text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {oraciones.map((oracion) => (
        <OracionCard key={oracion.id} oracion={oracion} />
      ))}
    </div>
  );
}