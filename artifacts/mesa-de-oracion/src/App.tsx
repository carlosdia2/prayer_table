import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import Login from "@/pages/login";
import OracionDetalle from "@/pages/oracion-detalle";
import CrearOracion from "@/pages/crear-oracion";
import Favoritos from "@/pages/favoritos";
import MisOraciones from "@/pages/mis-oraciones";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/oracion/:id" component={OracionDetalle} />
      <Route path="/crear" component={CrearOracion} />
      <Route path="/favoritos" component={Favoritos} />
      <Route path="/mis-oraciones" component={MisOraciones} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "hsl(30, 18%, 9%)",
              color: "hsl(45, 30%, 90%)",
              border: "1px solid hsl(43, 74%, 49%, 0.4)",
              fontFamily: "'Crimson Text', serif",
              fontSize: "1.05rem",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;