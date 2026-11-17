/**
 * Envía notificación por WhatsApp a través de nuestra Vercel Serverless Function (/api/notify-whatsapp),
 * manteniendo las credenciales de CallMeBot seguras en el servidor.
 */

export interface BookingNotification {
  nombre: string;
  servicio: string;
  fecha: string;
  hora: string;
  telefono: string;
  email?: string;
}

export async function sendWhatsAppNotification(data: BookingNotification): Promise<boolean> {
  try {
    const response = await fetch("/api/notify-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.warn("[WhatsApp] El servidor no pudo enviar la notificación:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    // No bloquear la reserva si falla la notificación
    console.warn("[WhatsApp] Error de red al notificar:", error);
    return false;
  }
}
