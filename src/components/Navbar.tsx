import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Lock, Menu, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InstallAppButton } from "@/components/admin/InstallAppButton";
import { useSmartNavbar } from "@/hooks/useMotionEffects";

const Navbar = () => {
  const { isVisible, isAtTop } = useSmartNavbar();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: "/portfolio", label: "Portafolio" },
    { to: "/servicios", label: "Servicios" },
    { to: "/blog", label: "Blog" },
    { to: "/agendar", label: "Agendar Cita" },
    { to: "/mi-agenda", label: "Mi Agenda" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-card/85 backdrop-blur-md border-b border-border navbar-smart ${
        !isVisible ? "navbar-hidden" : ""
      } ${!isAtTop ? "navbar-scrolled" : ""}`}
    >
      <div className="container mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group truncate">
            <span className="brand-elegant text-xl sm:text-2xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-text truncate">
              <span className="brand-kiki">Kiki</span>
              <span className="brand-separator mx-1" />
              <span className="brand-manicure">Spa</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="relative text-sm text-foreground hover:text-primary transition-colors font-medium group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
            <Link to="/admin" title="Acceso Administración">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/agendar">
              <Button size="sm" className="rounded-xl gap-1.5 text-xs">
                <Calendar className="h-3.5 w-3.5" /> Agendar
              </Button>
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl h-9 w-9" aria-label="Abrir menú">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] flex flex-col justify-between bg-background">
                <div>
                  <SheetHeader className="text-left pb-4 border-b">
                    <SheetTitle className="font-serif flex items-center gap-2 text-primary">
                      <Sparkles className="w-4 h-4" /> Kiki Spa
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-1.5 mt-5">
                    <Link
                      to="/"
                      onClick={() => setOpen(false)}
                      className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Inicio
                    </Link>
                    {navLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <InstallAppButton label="Descargar App Clienta" />
                  </div>
                </div>

                {/* Acceso sutil de dueña */}
                <div className="pt-4 border-t">
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" /> Acceso Dueña (Admin)
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
