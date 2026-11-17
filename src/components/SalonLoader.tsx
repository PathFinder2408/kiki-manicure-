import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const LOADING_MESSAGES = [
  "Puliendo cada detalle...",
  "Preparando tus tonos favoritos...",
  "Alistando tu espacio de spa...",
  "Dando brillo final...",
];

export const SalonLoader = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 select-none">
      <div className="relative flex flex-col items-center">
        {/* Halo suave */}
        <div className="absolute -inset-6 rounded-full bg-primary/10 blur-2xl animate-pulse" />

        {/* Icono SVG animado de frasco de esmalte + destellos */}
        <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-card border border-accent/30 shadow-sm mb-5">
          <Sparkles className="w-4 h-4 text-accent absolute top-2 right-2 animate-pulse" />
          <Sparkles className="w-3 h-3 text-primary/60 absolute bottom-2.5 left-2.5 animate-bounce" />

          <svg
            viewBox="0 0 64 64"
            className="w-11 h-11 text-primary animate-bounce"
            style={{ animationDuration: "1.8s" }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Tapa / pincel del esmalte */}
            <rect x="25" y="6" width="14" height="16" rx="3" fill="currentColor" opacity="0.9" />
            <rect x="28" y="22" width="8" height="5" rx="1" fill="#C8A27A" />
            {/* Frasco */}
            <path
              d="M17 31C17 28.7909 18.7909 27 21 27H43C45.2091 27 47 28.7909 47 31V50C47 54.4183 43.4183 58 39 58H25C20.5817 58 17 54.4183 17 50V31Z"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="#FAF8F5"
            />
            {/* Esmalte interior */}
            <path
              d="M21 38H43V50C43 52.2091 41.2091 54 39 54H25C22.7909 54 21 52.2091 21 50V38Z"
              fill="currentColor"
              opacity="0.85"
            />
            {/* Brillo */}
            <path
              d="M25 41V49"
              stroke="#FAF8F5"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>

        <p className="font-serif font-semibold text-base text-foreground tracking-wide">
          Kiki Manicure
        </p>
        <p className="text-xs text-muted-foreground mt-1 transition-opacity duration-300">
          {LOADING_MESSAGES[msgIndex]}
        </p>
      </div>
    </div>
  );
};
