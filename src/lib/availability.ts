export interface BookedSlot {
  hora: string;
  duracion_min: number;
}

export interface TimeSlotOption {
  time: string;
  available: boolean;
}

/** Convierte "HH:mm" o "HH:mm:ss" a minutos desde medianoche. */
export function timeToMinutes(hhmm: string): number {
  const [hStr = "0", mStr = "0"] = hhmm.split(":");
  const h = Number.parseInt(hStr, 10);
  const m = Number.parseInt(mStr, 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

/** Convierte minutos desde medianoche a "HH:mm". */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Genera la grilla base de horarios entre apertura y cierre. */
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  intervalMin: number
): string[] {
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);
  const step = Math.max(15, intervalMin);
  const slots: string[] = [];

  for (let current = open; current < close; current += step) {
    slots.push(minutesToTime(current));
  }
  return slots;
}

/**
 * Calcula qué horarios están realmente disponibles considerando:
 * 1. Horario de cierre (que el servicio quepa antes de cerrar).
 * 2. Margen mínimo si la reserva es para hoy (30 min de anticipación).
 * 3. Solapamiento exacto con citas ya reservadas según duración.
 */
export function getAvailableSlots(params: {
  dateStr: string;
  todayStr: string;
  nowMinutes: number;
  serviceDurationMin: number;
  openTime: string;
  closeTime: string;
  intervalMin: number;
  bookedSlots: BookedSlot[];
}): TimeSlotOption[] {
  const {
    dateStr,
    todayStr,
    nowMinutes,
    serviceDurationMin,
    openTime,
    closeTime,
    intervalMin,
    bookedSlots,
  } = params;

  const baseSlots = generateTimeSlots(openTime, closeTime, intervalMin);
  const closeMinutes = timeToMinutes(closeTime);
  const isToday = dateStr === todayStr;
  const minAllowedToday = nowMinutes + 30;

  const bookedIntervals = bookedSlots.map((b) => {
    const start = timeToMinutes(b.hora);
    const dur = b.duracion_min > 0 ? b.duracion_min : 60;
    return { start, end: start + dur };
  });

  return baseSlots.map((time) => {
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + serviceDurationMin;

    if (slotEnd > closeMinutes) {
      return { time, available: false };
    }

    if (isToday && slotStart < minAllowedToday) {
      return { time, available: false };
    }

    const overlaps = bookedIntervals.some(
      (b) => slotStart < b.end && slotEnd > b.start
    );

    return { time, available: !overlaps };
  });
}
