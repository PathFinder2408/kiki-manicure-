import { z } from "zod";

const notificationSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  servicio: z.string().trim().min(2).max(160),
  fecha: z.string().trim().min(4).max(40),
  hora: z.string().trim().min(4).max(20),
  telefono: z.string().trim().min(6).max(30),
});

interface VercelRequest {
  method?: string;
  body?: unknown;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

/**
 * Serverless Function en Vercel para enviar notificaciones de WhatsApp
 * sin exponer credenciales de CallMeBot en el bundle del navegador.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const parsed = notificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Datos de notificación inválidos",
      details: parsed.error.flatten(),
    });
  }

  const phone = process.env.CALLMEBOT_PHONE || process.env.VITE_CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY || process.env.VITE_CALLMEBOT_API_KEY;

  if (!phone || !apiKey) {
    return res.status(500).json({
      ok: false,
      error: "Credenciales de CallMeBot no configuradas en el servidor",
    });
  }

  const { nombre, servicio, fecha, hora, telefono } = parsed.data;
  const message = [
    "📅 *Nueva Cita Agendada!*",
    "",
    `👤 *Cliente:* ${nombre}`,
    `💅 *Servicio:* ${servicio}`,
    `📆 *Fecha:* ${fecha}`,
    `🕐 *Hora:* ${hora}`,
    `📱 *Teléfono:* ${telefono}`,
    "",
    "✨ _Kiki Manicure_",
  ].join("\n");

  const cleanPhone = phone.replace(/\s+/g, "");
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      return res.status(502).json({
        ok: false,
        error: `CallMeBot respondió con estado ${response.status}`,
      });
    }
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[API notify-whatsapp] Error:", error);
    return res.status(500).json({
      ok: false,
      error: "Error interno al conectar con CallMeBot",
    });
  }
}
