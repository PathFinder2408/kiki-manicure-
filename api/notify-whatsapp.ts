import { z } from "zod";

const notificationSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  servicio: z.string().trim().min(2).max(160),
  fecha: z.string().trim().min(4).max(40),
  hora: z.string().trim().min(4).max(20),
  telefono: z.string().trim().min(6).max(30),
  email: z.string().trim().email().optional(),
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
 * Soporta Telegram Bot API, Resend Email, Web Push nativo (App Admin) y CallMeBot.
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

  const { nombre, servicio, fecha, hora, telefono, email } = parsed.data;

  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL || "Kiki Spa <onboarding@resend.dev>";
  const adminEmail = process.env.ADMIN_EMAIL;
  const callmebotPhone = process.env.CALLMEBOT_PHONE || process.env.VITE_CALLMEBOT_PHONE;
  const callmebotKey = process.env.CALLMEBOT_API_KEY || process.env.VITE_CALLMEBOT_API_KEY;
  const vapidPublic = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@kikispa.app";
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !telegramToken &&
    !resendApiKey &&
    !(vapidPublic && vapidPrivate && supabaseUrl && supabaseServiceKey) &&
    !(callmebotPhone && callmebotKey)
  ) {
    return res.status(500).json({
      ok: false,
      error: "No hay canal de notificación configurado en el servidor",
    });
  }

  const results: {
    telegram?: boolean;
    email?: boolean;
    push?: number;
    whatsapp?: boolean;
  } = {};

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

  // 2. Canal correo electrónico: Resend API
  if (resendApiKey && (email || adminEmail)) {
    const recipients = [email, adminEmail].filter(Boolean) as string[];
    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ECE5DC; border: 1px solid #C9A25E; border-radius: 16px; color: #2D2422;">
        <h2 style="font-family: Georgia, serif; color: #7E524E; margin-top: 0;">✨ Confirmación de Cita · Kiki Spa</h2>
        <p>Hola <strong>${escapeHtml(nombre)}</strong>, tu reserva ha sido registrada con éxito:</p>
        <div style="background: #F6F1EA; padding: 16px; border-radius: 12px; border: 1px solid #E2D9CE; margin: 16px 0;">
          <p style="margin: 6px 0;"><strong>💅 Servicio:</strong> ${escapeHtml(servicio)}</p>
          <p style="margin: 6px 0;"><strong>📆 Fecha:</strong> ${escapeHtml(fecha)}</p>
          <p style="margin: 6px 0;"><strong>🕐 Hora:</strong> ${escapeHtml(hora)} hrs</p>
          <p style="margin: 6px 0;"><strong>📱 Teléfono:</strong> ${escapeHtml(telefono)}</p>
        </div>
        <p style="font-size: 13px; color: #746561;">¡Te esperamos! Si necesitas reprogramar, contáctanos con anticipación.</p>
      </div>
    `;

    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: resendFrom,
          to: recipients,
          subject: `Confirmación de Cita · ${fecha} ${hora} hrs`,
          html,
        }),
      });
      results.email = emailRes.ok;
    } catch (error) {
      console.error("[API notify] Error Resend Email:", error);
      results.email = false;
    }
  }

  // 3. Canal Web Push nativo a la App Admin instalada (dynamic import ESM-safe)
  if (vapidPublic && vapidPrivate && supabaseUrl && supabaseServiceKey) {
    try {
      const webpushMod = await import("web-push");
      const wp =
        (webpushMod as unknown as { default?: typeof webpushMod }).default?.sendNotification
          ? (webpushMod as unknown as { default: typeof webpushMod }).default
          : webpushMod;

      wp.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

      const subsRes = await fetch(
        `${supabaseUrl}/rest/v1/push_subscriptions?select=id,subscription`,
        {
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
        }
      );

      if (subsRes.ok) {
        const subs = (await subsRes.json()) as { id: string; subscription: unknown }[];
        if (subs.length > 0) {
          const pushPayload = JSON.stringify({
            title: `Nueva Cita: ${nombre} ✨`,
            body: `${servicio} · ${fecha} a las ${hora} hrs`,
            url: "/admin",
          });

          let sentCount = 0;
          const expiredIds: string[] = [];

          await Promise.all(
            subs.map(async (row) => {
              try {
                await wp.sendNotification(
                  row.subscription as Parameters<typeof wp.sendNotification>[0],
                  pushPayload
                );
                sentCount += 1;
              } catch (err: unknown) {
                const statusCode = (err as { statusCode?: number })?.statusCode;
                if (statusCode === 404 || statusCode === 410) {
                  expiredIds.push(row.id);
                }
              }
            })
          );

          if (expiredIds.length > 0) {
            await fetch(
              `${supabaseUrl}/rest/v1/push_subscriptions?id=in.(${expiredIds.join(",")})`,
              {
                method: "DELETE",
                headers: {
                  apikey: supabaseServiceKey,
                  Authorization: `Bearer ${supabaseServiceKey}`,
                },
              }
            );
          }
          results.push = sentCount;
        } else {
          results.push = 0;
        }
      }
    } catch (error) {
      console.error("[API notify] Error Web Push:", error);
      results.push = 0;
    }
  }

  // 4. Canal opcional: CallMeBot WhatsApp
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

  const anyOk =
    results.telegram === true ||
    results.email === true ||
    (results.push ?? 0) > 0 ||
    results.whatsapp === true;
  return res.status(anyOk ? 200 : 502).json({ ok: anyOk, channels: results });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
