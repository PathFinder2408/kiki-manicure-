import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import { useSmartNavbar } from "@/hooks/useMotionEffects";

const Navbar = () => {
  const { isVisible, isAtTop } = useSmartNavbar();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border navbar-smart ${
        !isVisible ? 'navbar-hidden' : ''
      } ${!isAtTop ? 'navbar-scrolled' : ''}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group truncate">
            <span className="brand-elegant text-xl sm:text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-text truncate">
              <span className="brand-kiki">Kiki</span>
              <span className="brand-separator mx-1" />
              <span className="brand-manicure hidden sm:inline-block">Manicure</span>
              <span className="brand-manicure sm:hidden">M.</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link to="/portfolio" className="relative text-foreground hover:text-primary transition-colors font-medium group">
              Portafolio
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full group-hover:left-0" />
            </Link>
            <Link to="/servicios" className="relative text-foreground hover:text-primary transition-colors font-medium group">
              Servicios
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full group-hover:left-0" />
            </Link>
            <Link to="/agendar" className="relative text-foreground hover:text-primary transition-colors font-medium group">
              Agendar Cita
              <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-full group-hover:left-0" />
            </Link>
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link to="/agendar">
              <Button size="sm" variant="hero">
                <Calendar className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
