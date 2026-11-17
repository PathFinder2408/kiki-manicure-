import { useEffect, useState } from "react";
import { Check, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallAppButtonProps {
  compact?: boolean;
  label?: string;
}

export const InstallAppButton = ({ compact = false, label }: InstallAppButtonProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-100/80 text-green-800 text-xs font-medium">
        <Check className="w-4 h-4 shrink-0" /> App Instalada en Dispositivo
      </div>
    );
  }

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return;
    }
    // En iOS Safari o navegadores sin prompt nativo, mostramos guía visual
    setShowIOSGuide(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "sm"}
        onClick={handleClick}
        className={
          compact
            ? "rounded-xl gap-1.5 border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
            : "w-full justify-start gap-2 rounded-xl border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
        }
      >
        <Smartphone className="w-4 h-4 shrink-0" />
        <span>{label ?? (compact ? "Instalar App" : "Instalar App en Celular")}</span>
      </Button>

      <Dialog open={showIOSGuide} onOpenChange={setShowIOSGuide}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" /> Instalar Kiki Admin en tu Dispositivo
            </DialogTitle>
            <DialogDescription>
              Lleva el tablero de citas y finanzas directo en la pantalla de inicio de tu celular.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm py-2">
            <div className="p-3.5 rounded-xl border bg-muted/30">
              <p className="font-semibold mb-1">En iPhone / iPad (Safari):</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                1. Toca el botón <Share className="w-3.5 h-3.5 inline text-primary" /> <strong>Compartir</strong> abajo en Safari.
                <br />
                2. Elige <strong>&ldquo;Agregar a inicio&rdquo;</strong> y confirma.
              </p>
            </div>
            <div className="p-3.5 rounded-xl border bg-muted/30">
              <p className="font-semibold mb-1">En Android / Chrome / PC:</p>
              <p className="text-xs text-muted-foreground">
                Abre el menú del navegador (<code>⋮</code>) y selecciona <strong>&ldquo;Instalar aplicación&rdquo;</strong> o <strong>&ldquo;Agregar a pantalla principal&rdquo;</strong>.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
