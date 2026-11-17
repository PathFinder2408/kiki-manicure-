export interface BookedSlot {
  hora: string;
  duracion_min: number;
}

export interface TimeSlotOption {
  time: string;
  available: boolean;
}

export interface ShiftWindow {
  openTime: string;
  closeTime: string;
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
 * 1. Uno o dos bloques diarios (ej. Mañana 09:00-12:00 y Tarde 17:00-20:00).
 * 2. Que el servicio quepa antes del cierre de ese bloque.
 * 3. Margen mínimo si la reserva es para hoy (30 min de anticipación).
 * 4. Solapamiento exacto con citas ya reservadas según duración.
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
  secondShift?: ShiftWindow | null;
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
    secondShift,
  } = params;

  const isToday = dateStr === todayStr;
  const minAllowedToday = nowMinutes + 30;

  const bookedIntervals = bookedSlots.map((b) => {
    const start = timeToMinutes(b.hora);
    const dur = b.duracion_min > 0 ? b.duracion_min : 60;
    return { start, end: start + dur };
  });

  const windows: ShiftWindow[] = [{ openTime, closeTime }];
  if (secondShift && secondShift.openTime && secondShift.closeTime) {
    windows.push(secondShift);
  }

  const slotMap = new Map<string, boolean>();

  for (const win of windows) {
    const baseSlots = generateTimeSlots(win.openTime, win.closeTime, intervalMin);
    const winCloseMinutes = timeToMinutes(win.closeTime);

    for (const time of baseSlots) {
      const slotStart = timeToMinutes(time);
      const slotEnd = slotStart + serviceDurationMin;

      let available = true;
      if (slotEnd > winCloseMinutes) available = false;
      if (isToday && slotStart < minAllowedToday) available = false;
      if (
        available &&
        bookedIntervals.some((b) => slotStart < b.end && slotEnd > b.start)
      ) {
        available = false;
      }

      // Si un bloque ya marcó disponible un horario, se conserva
      const prev = slotMap.get(time);
      slotMap.set(time, prev === true ? true : available);
    }
  }

  return Array.from(slotMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, available]) => ({ time, available }));
}
