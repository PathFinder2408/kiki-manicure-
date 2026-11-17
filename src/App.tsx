import { Component, Suspense, lazy, useEffect, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SalonLoader } from "@/components/SalonLoader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { supabase } from "@/supabase";
import Home from "./pages/Home";

// Code Splitting: separa el Dashboard (Recharts) y rutas secundarias del bundle inicial
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Services = lazy(() => import("./pages/Services"));
const Blog = lazy(() => import("./pages/Blog"));
const Booking = lazy(() => import("./pages/Booking"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

class RouteErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error?.message || "Error inesperado" };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (error.message?.includes("Failed to fetch dynamically imported module")) {
      const reloaded = sessionStorage.getItem("kiki_chunk_reload");
      if (!reloaded) {
        sessionStorage.setItem("kiki_chunk_reload", "1");
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center gap-4">
          <p className="font-serif text-xl font-semibold">
            Actualizamos Kiki Spa con mejoras ✨
          </p>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("kiki_chunk_reload");
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            Recargar página
          </button>
          {this.state.errorMessage && (
            <p className="text-[11px] text-muted-foreground max-w-md opacity-70">
              {this.state.errorMessage}
            </p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<unknown>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return <SalonLoader />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteErrorBoundary>
          <Suspense fallback={<SalonLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/servicios" element={<Services />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/agendar" element={<Booking />} />
              <Route path="/mi-agenda" element={<ClientPortal />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileBottomNav />
          </Suspense>
        </RouteErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
