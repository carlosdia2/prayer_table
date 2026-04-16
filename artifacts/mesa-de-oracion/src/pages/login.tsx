import { useEffect } from "react";
import { useLocation } from "wouter";
import { Sparkles, Flame } from "lucide-react";
import { getObtenerUsuarioActualQueryKey, useObtenerUsuarioActual } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiGoogle } from "react-icons/si";

export default function Login() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useObtenerUsuarioActual({
    query: { retry: false, queryKey: getObtenerUsuarioActualQueryKey() }
  });

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="monastic-page-bg min-h-screen w-full flex items-center justify-center relative bg-background/70">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 767px)" srcSet="/backgrounds/bg-vertical.png" />
          <img src="/backgrounds/bg-horizontal.png" alt="Catedral" className="w-full h-full object-cover opacity-65" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-b from-background/18 via-background/58 to-background/88" />
      </div>

      <div className="relative z-10 w-full max-w-md p-4">
        <Card className="border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl shadow-primary/10">
          <CardHeader className="text-center space-y-6 pt-10 pb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary blur-2xl opacity-20 rounded-full" />
                <Flame className="w-16 h-16 text-primary relative z-10" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-serif text-primary tracking-wider">Mesa de Oración</CardTitle>
              <CardDescription className="font-serif italic text-muted-foreground/80 text-lg">
                La paz sea contigo
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-10 space-y-6 px-8">
            <p className="text-center text-sm text-foreground/80 leading-relaxed font-serif">
              Únete a nuestra comunidad de peregrinos. Guarda tus oraciones favoritas, comparte las tuyas y encuentra palabras para cada momento.
            </p>
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleGoogleLogin}
                className="w-full h-12 bg-white text-black hover:bg-gray-100 font-medium font-sans flex items-center gap-3 border border-white/20 shadow-lg"
              >
                <SiGoogle className="w-5 h-5" />
                Continuar con Google
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-8 opacity-50">
              <div className="h-px bg-primary/30 flex-1" />
              <Sparkles className="w-4 h-4 text-primary" />
              <div className="h-px bg-primary/30 flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
