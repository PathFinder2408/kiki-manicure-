import { useEffect, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabase";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationToggleProps {
  compact?: boolean;
}

export const PushNotificationToggle = ({ compact = false }: PushNotificationToggleProps) => {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);

    if (!ok) return;

    navigator.serviceWorker
      .getRegistration("/sw.js")
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => {
        if (sub && Notification.permission === "granted") {
          setEnabled(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!supported) return null;

  const handleEnablePush = async () => {
    if (!vapidPublicKey) {
      toast.error("Falta configurar VITE_VAPID_PUBLIC_KEY en Vercel");
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permiso de notificaciones denegado en este dispositivo");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });
      }

      const { data: userData } = await supabase.auth.getUser();
      const subJson = subscription.toJSON();

      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_email: userData.user?.email ?? "",
          endpoint: subscription.endpoint,
          subscription: subJson,
        },
        { onConflict: "endpoint" }
      );

      if (error) {
        toast.error("No se pudo guardar la suscripción Push en Supabase");
        return;
      }

      setEnabled(true);
      toast.success("¡Notificaciones Push activadas en este dispositivo! 🔔");
    } catch (error) {
      console.error("[Push] Error:", error);
      toast.error("No se pudieron activar las notificaciones Push");
    } finally {
      setLoading(false);
    }
  };

  const handleDisablePush = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setEnabled(false);
      toast.success("Notificaciones Push desactivadas en este dispositivo");
    } finally {
      setLoading(false);
    }
  };

  if (enabled) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleDisablePush}
        className={
          compact
            ? "h-8 px-2.5 rounded-xl gap-1 text-xs border-green-300 bg-green-50 text-green-800"
            : "w-full justify-start gap-2 rounded-xl border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
        }
        title="Notificaciones Push activas (clic para desactivar)"
      >
        <Check className="w-3.5 h-3.5 shrink-0" />
        <span>{compact ? "Alertas ON" : "Alertas Push Activas"}</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleEnablePush}
      className={
        compact
          ? "h-8 px-2.5 rounded-xl gap-1 text-xs border-primary/30 bg-primary/10 text-primary"
          : "w-full justify-start gap-2 rounded-xl border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
      }
      title="Recibir notificaciones directo en este celular"
    >
      {loading ? <BellOff className="w-3.5 h-3.5 animate-pulse" /> : <Bell className="w-3.5 h-3.5 shrink-0" />}
      <span>{loading ? "Activando..." : compact ? "Alertas Push" : "Activar Alertas Push"}</span>
    </Button>
  );
};
