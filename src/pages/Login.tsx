import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Email o contraseña incorrectos");
      setLoading(false);
      return;
    }

    toast.success("Bienvenida 👑");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-6 sm:p-8 border-2 border-border bg-gradient-card">
        <div className="text-center mb-8">
          <div className="mb-2">
            <span className="brand-elegant text-2xl sm:text-3xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-text flex flex-wrap justify-center items-center gap-1">
              <span className="brand-kiki">Kiki</span>
              <span className="brand-separator hidden sm:inline-block mx-1" />
              <span className="brand-manicure hidden sm:inline-block">Manicure</span>
              <span className="brand-manicure sm:hidden w-full text-sm">Manicure</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">Acceso al panel de administración</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="mb-2 block">Email</Label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-2"
            />
          </div>
          <div>
            <Label className="mb-2 block">Contraseña</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-xl border-2"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;

