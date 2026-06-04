/**
 * Envía notificación por WhatsApp usando CallMeBot API (gratis).
 * El mensaje se envía al número del negocio (Kiki) cuando una clienta agenda.
 *
 * Requisito: el número debe haber enviado "I allow callmebot to send me messages"
 * al +34 644 31 98 27 en WhatsApp.
 */

interface BookingNotification {
  nombre: string;
  servicio: string;
  fecha: string;
  hora: string;
  telefono: string;
}

export async function sendWhatsAppNotification(data: BookingNotification): Promise<void> {
  const phone = import.meta.env.VITE_CALLMEBOT_PHONE;
  const apiKey = import.meta.env.VITE_CALLMEBOT_API_KEY;

  if (!phone || !apiKey) {
    console.warn('[WhatsApp] Credenciales de CallMeBot no configuradas en .env');
    return;
  }

  const message = [
    '📅 *Nueva Cita Agendada!*',
    '',
    `👤 *Cliente:* ${data.nombre}`,
    `💅 *Servicio:* ${data.servicio}`,
    `📆 *Fecha:* ${data.fecha}`,
    `🕐 *Hora:* ${data.hora}`,
    `📱 *Teléfono:* ${data.telefono}`,
    '',
    '✨ _Kiki Manicure_',
  ].join('\n');

  const encodedMessage = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apiKey}`;

  try {
    // CallMeBot no soporta CORS, usamos no-cors.
    // El mensaje se envía igualmente aunque no podamos leer la respuesta.
    await fetch(url, { mode: 'no-cors' });
    console.log('[WhatsApp] Notificación enviada exitosamente');
  } catch (error) {
    // No bloquear la reserva si falla el WhatsApp
    console.warn('[WhatsApp] Error al enviar notificación:', error);
  }
}
