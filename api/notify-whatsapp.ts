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
 * Serverless Function en Vercel para enviar alertas instantáneas de nuevas citas.
 * Soporta Telegram Bot API (recomendado, gratis e ilimitado) y CallMeBot WhatsApp.
 * Mantiene todas las credenciales privadas en el servidor.
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

  const { nombre, servicio, fecha, hora, telefono } = parsed.data;

  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const callmebotPhone = process.env.CALLMEBOT_PHONE || process.env.VITE_CALLMEBOT_PHONE;
  const callmebotKey = process.env.CALLMEBOT_API_KEY || process.env.VITE_CALLMEBOT_API_KEY;

  if (!telegramToken && !(callmebotPhone && callmebotKey)) {
    return res.status(500).json({
      ok: false,
      error: "No hay canal de notificación configurado en el servidor",
    });
  }

  const results: { telegram?: boolean; whatsapp?: boolean } = {};

  // 1. Canal principal: Telegram Bot API
  if (telegramToken && telegramChatId) {
    const text = [
      "📅 <b>Nueva Cita Agendada</b>",
      "",
      `👤 <b>Cliente:</b> ${escapeHtml(nombre)}`,
      `💅 <b>Servicio:</b> ${escapeHtml(servicio)}`,
      `📆 <b>Fecha:</b> ${escapeHtml(fecha)}`,
      `🕐 <b>Hora:</b> ${escapeHtml(hora)}`,
      `📱 <b>Teléfono:</b> ${escapeHtml(telefono)}`,
    ].join("\n");

    try {
      const tgRes = await fetch(
        `https://api.telegram.org/bot${telegramToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text,
            parse_mode: "HTML",
          }),
        }
      );
      results.telegram = tgRes.ok;
    } catch (error) {
      console.error("[API notify] Error Telegram:", error);
      results.telegram = false;
    }
  }

  // 2. Canal opcional: CallMeBot WhatsApp
  if (callmebotPhone && callmebotKey) {
    const waMessage = [
      "📅 *Nueva Cita Agendada!*",
      "",
      `👤 *Cliente:* ${nombre}`,
      `💅 *Servicio:* ${servicio}`,
      `📆 *Fecha:* ${fecha}`,
      `🕐 *Hora:* ${hora}`,
      `📱 *Teléfono:* ${telefono}`,
    ].join("\n");

    const cleanPhone = callmebotPhone.replace(/\s+/g, "");
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(waMessage)}&apikey=${encodeURIComponent(callmebotKey)}`;
    try {
      const waRes = await fetch(url, { method: "GET" });
      results.whatsapp = waRes.ok;
    } catch (error) {
      console.error("[API notify] Error CallMeBot:", error);
      results.whatsapp = false;
    }
  }

  const anyOk = results.telegram === true || results.whatsapp === true;
  return res.status(anyOk ? 200 : 502).json({ ok: anyOk, channels: results });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
