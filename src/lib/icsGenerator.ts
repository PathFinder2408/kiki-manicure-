/**
 * Genera y descarga un archivo .ics compatible con Apple Calendar, Outlook y calendarios móviles.
 */
export function downloadAppointmentICS(params: {
  title: string;
  description: string;
  location: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  durationMin: number;
}) {
  const { title, description, location, dateStr, timeStr, durationMin } = params;
  const { startStr, endStr } = buildCalendarDates(dateStr, timeStr, durationMin);

  const pad = (n: number) => String(n).padStart(2, "0");
  const now = new Date();
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `T${pad(now.getHours())}${pad(now.getMinutes())}00`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kiki Manicure//Booking//ES",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@kikimanicure.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Recordatorio de tu cita en 1 hora",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cita-${dateStr}-${timeStr.replace(":", "")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Construye el enlace directo para agendar el recordatorio en Google Calendar.
 */
export function getGoogleCalendarUrl(params: {
  title: string;
  description: string;
  location: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  durationMin: number;
}): string {
  const { startStr, endStr } = buildCalendarDates(
    params.dateStr,
    params.timeStr,
    params.durationMin
  );

  const query = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${startStr}/${endStr}`,
    details: params.description,
    location: params.location,
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

function buildCalendarDates(dateStr: string, timeStr: string, durationMin: number) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const start = new Date(year, month - 1, day, hour, minute, 0);
  const end = new Date(start.getTime() + durationMin * 60_000);

  const formatDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
      `T${pad(d.getHours())}${pad(d.getMinutes())}00`
    );
  };

  return { startStr: formatDate(start), endStr: formatDate(end) };
}
