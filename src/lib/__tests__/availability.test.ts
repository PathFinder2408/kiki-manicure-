import { describe, expect, it } from "vitest";
import { generateTimeSlots, getAvailableSlots } from "../availability";

describe("availability engine", () => {
  it("generates expected slots within open and close hours", () => {
    const slots = generateTimeSlots("09:00", "12:00", 60);
    expect(slots).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("blocks overlapping slots based on booked duration and prevents exceeding closing time", () => {
    const result = getAvailableSlots({
      dateStr: "2026-12-01",
      todayStr: "2026-11-17",
      nowMinutes: 600,
      serviceDurationMin: 90,
      openTime: "09:00",
      closeTime: "13:00",
      intervalMin: 60,
      bookedSlots: [{ hora: "10:00", duracion_min: 60 }],
    });

    const map = Object.fromEntries(result.map((r) => [r.time, r.available]));
    // 09:00 + 90m = 10:30 -> overlaps 10:00-11:00
    expect(map["09:00"]).toBe(false);
    // 10:00 is directly booked
    expect(map["10:00"]).toBe(false);
    // 11:00 + 90m = 12:30 <= 13:00 -> available
    expect(map["11:00"]).toBe(true);
    // 12:00 + 90m = 13:30 > 13:00 -> exceeds closing time
    expect(map["12:00"]).toBe(false);
  });

  it("blocks past slots and applies 30-min buffer for today", () => {
    const result = getAvailableSlots({
      dateStr: "2026-11-17",
      todayStr: "2026-11-17",
      nowMinutes: 10 * 60 + 40, // 10:40 -> buffer until 11:10
      serviceDurationMin: 45,
      openTime: "09:00",
      closeTime: "13:00",
      intervalMin: 60,
      bookedSlots: [],
    });

    const map = Object.fromEntries(result.map((r) => [r.time, r.available]));
    expect(map["10:00"]).toBe(false);
    expect(map["11:00"]).toBe(false);
    expect(map["12:00"]).toBe(true);
  });
});
