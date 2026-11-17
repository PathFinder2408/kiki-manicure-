import { Link, useLocation } from "react-router-dom";
import { Calendar, Home, Image, UserCheck } from "lucide-react";

const TABS = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/agendar", label: "Agendar", icon: Calendar },
  { to: "/portfolio", label: "Portafolio", icon: Image },
  { to: "/mi-agenda", label: "Mi Agenda", icon: UserCheck },
];

export const MobileBottomNav = () => {
  const { pathname } = useLocation();

  // No mostrar en rutas privadas de administración
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <nav
      aria-label="Navegación rápida móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-6px_rgba(110,44,59,0.08)]"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  active ? "bg-primary/10" : ""
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
