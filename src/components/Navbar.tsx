import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Menu, ShieldCheck, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InstallAppButton } from "@/components/admin/InstallAppButton";
import { useSmartNavbar } from "@/hooks/useMotionEffects";
import { isAdminEmail, resolveDisplayName } from "@/lib/greetings";
import { supabase } from "@/supabase";

const Navbar = () => {
  const { isVisible, isAtTop } = useSmartNavbar();
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const syncUser = (
      session: { user?: { email?: string; user_metadata?: Record<string, unknown> } } | null
    ) => {
      const u = session?.user;
      setUserEmail(u?.email ?? null);
      setUserName((u?.user_metadata?.full_name as string) || "");
    };

    supabase.auth.getSession().then(({ data }) => syncUser(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => syncUser(session));

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = isAdminEmail(userEmail);
  const displayName = resolveDisplayName(userEmail, userName);

  const navLinks = [
    { to: "/agendar", label: "Agendar Cita" },
    { to: "/portfolio", label: "Portafolio" },
    { to: "/servicios", label: "Servicios" },
    { to: "/blog", label: "Blog" },
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

            {userEmail ? (
              <Link
                to={isAdmin ? "/admin" : "/mi-agenda"}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-colors ${
                  isAdmin
                    ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-accent/40 bg-accent/15 text-foreground hover:border-primary/40"
                }`}
                title={isAdmin ? "Ir al Dashboard Admin" : "Ir a Mi Agenda"}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Admin · {displayName}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    <span>Hola, {displayName} ✨</span>
                  </>
                )}
              </Link>
            ) : (
              <Link
                to="/mi-agenda"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background/70 hover:border-primary/40 hover:text-primary text-xs font-medium transition-colors"
                title="Ingresar a mi cuenta"
              >
                <User className="h-3.5 w-3.5" /> Ingresar
              </Link>
            )}
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/agendar">
              <Button size="sm" className="rounded-full px-4 gap-1.5 text-xs shadow-sm">
                <Calendar className="h-3.5 w-3.5" /> Agendar
              </Button>
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-9 w-9 border-primary/20 bg-card"
                  aria-label="Abrir menú"
                >
                  <Menu className="h-4 w-4 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[290px] flex flex-col justify-between bg-gradient-to-b from-background to-secondary/30 border-l border-border/70"
              >
                <div>
                  <SheetHeader className="text-left pb-4 border-b border-border/60">
                    <SheetTitle className="font-serif flex items-center gap-2 text-primary text-xl">
                      <Sparkles className="w-4 h-4 text-accent" /> Kiki Spa
                    </SheetTitle>
                    {userEmail ? (
                      <p className="text-xs font-medium text-primary">
                        {isAdmin
                          ? `Admin · ${displayName}`
                          : `Bienvenida, ${displayName} ✨`}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Belleza, cuidado y bienestar en cada detalle
                      </p>
                    )}
                  </SheetHeader>

                  <div className="flex flex-col gap-1.5 mt-5">
                    <Link
                      to="/"
                      onClick={() => setOpen(false)}
                      className="px-3.5 py-2.5 rounded-2xl text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      Inicio
                    </Link>
                    {navLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="px-3.5 py-2.5 rounded-2xl text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setOpen(false)}
                        className="px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-primary bg-primary/10 flex items-center gap-2 mt-1"
                      >
                        <ShieldCheck className="w-4 h-4" /> Dashboard Admin
                      </Link>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 space-y-2">
                  {isAdmin ? (
                    <InstallAppButton alwaysShow appTitle="Kiki Admin" label="Descargar App Admin" />
                  ) : (
                    <InstallAppButton label="Descargar App Kiki Spa" />
                  )}
                  <p className="text-[11px] text-center text-muted-foreground">
                    {isAdmin
                      ? "Gestión exclusiva del salón"
                      : "Agenda y revisa tus citas desde tu celular"}
                  </p>
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
