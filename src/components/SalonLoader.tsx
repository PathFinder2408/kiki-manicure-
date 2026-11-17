import { useEffect, useState } from "react";
import { BookOpen, CalendarClock, ClipboardList, Flower2, Sparkles } from "lucide-react";

const APP_MESSAGES = [
  "Puliendo cada detalle...",
  "Preparando tus tonos favoritos...",
  "Alistando tu espacio de spa...",
  "Dando brillo final...",
];

export type LoaderContext = "app" | "slots" | "services" | "blog" | "ficha" | "client";

const CONTEXT_CONFIG: Record<
  LoaderContext,
  {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    skeletonRows?: number;
  }
> = {
  app: {
    title: "Kiki Spa",
    subtitle: "Alistando tu espacio de bienestar...",
    icon: Flower2,
  },
  slots: {
    title: "Buscando tu momento ideal",
    subtitle: "Revisando espacios libres en cabina...",
    icon: CalendarClock,
    skeletonRows: 3,
  },
  services: {
    title: "Preparando carta de tratamientos",
    subtitle: "Cargando manicura, spa y rituales...",
    icon: Sparkles,
    skeletonRows: 2,
  },
  blog: {
    title: "Actualizando revista de belleza",
    subtitle: "Cargando consejos de cosmetología y dermatología...",
    icon: BookOpen,
    skeletonRows: 3,
  },
  ficha: {
    title: "Abriendo ficha personal",
    subtitle: "Consultando memoria de tonos y atenciones...",
    icon: ClipboardList,
    skeletonRows: 2,
  },
  client: {
    title: "Preparando tu agenda",
    subtitle: "Verificando tu cuenta de Kiki Spa...",
    icon: Flower2,
  },
};

export const SalonLoader = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % APP_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 select-none">
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-8 rounded-full bg-accent/20 blur-2xl animate-pulse" />

        <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-card border border-accent/40 shadow-sm mb-5">
          <Sparkles className="w-4 h-4 text-accent absolute top-2 right-2 animate-pulse" />
          <Sparkles className="w-3 h-3 text-primary/60 absolute bottom-2.5 left-2.5 animate-bounce" />
          <Flower2
            className="w-10 h-10 text-primary animate-pulse"
            style={{ animationDuration: "1.8s" }}
          />
        </div>

        <p className="font-serif font-semibold text-lg text-foreground tracking-wide">
          Kiki Spa
        </p>
        <p className="text-xs text-muted-foreground mt-1 transition-opacity duration-300">
          {APP_MESSAGES[msgIndex]}
        </p>
      </div>
    </div>
  );
};

interface InlineSalonLoaderProps {
  context: Exclude<LoaderContext, "app">;
}

export const InlineSalonLoader = ({ context }: InlineSalonLoaderProps) => {
  const cfg = CONTEXT_CONFIG[context];
  const Icon = cfg.icon;

  return (
    <div className="py-6 px-4 rounded-2xl border border-accent/25 bg-card/70 text-center space-y-4 animate-fade-in">
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-12 h-12 rounded-2xl bg-primary/10 border border-accent/30 flex items-center justify-center text-primary">
          <Icon className="w-5 h-5 animate-pulse" />
          <Sparkles className="w-3 h-3 text-accent absolute -top-1 -right-1 animate-ping" />
        </div>
        <div>
          <p className="font-serif font-semibold text-sm text-foreground">{cfg.title}</p>
          <p className="text-xs text-muted-foreground">{cfg.subtitle}</p>
        </div>
      </div>

      {context === "slots" && (
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-9 rounded-xl bg-muted/70 animate-pulse"
              style={{ animationDelay: `${n * 90}ms` }}
            />
          ))}
        </div>
      )}

      {(context === "services" || context === "blog" || context === "ficha") && (
        <div className="space-y-2 max-w-md mx-auto pt-1">
          {Array.from({ length: cfg.skeletonRows ?? 2 }).map((_, idx) => (
            <div
              key={idx}
              className="h-12 rounded-xl bg-muted/60 animate-pulse"
              style={{ animationDelay: `${idx * 120}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
