import { describe, it, expect } from "vitest";
import {
  formatWorldcupDay,
  formatWorldcupDaySub,
} from "../format-worldcup-day.js";

const FIXED_NOW = new Date("2026-06-27T15:00:00Z");

describe("formatWorldcupDay", () => {
  it("returns 'Hoy' for today's date in local TZ", () => {
    const today = `${FIXED_NOW.getFullYear()}-${String(
      FIXED_NOW.getMonth() + 1
    ).padStart(2, "0")}-${String(FIXED_NOW.getDate()).padStart(2, "0")}`;
    expect(formatWorldcupDay(today, FIXED_NOW)).toBe("Hoy");
  });

  it("returns 'Mañana' for tomorrow", () => {
    const tomorrow = new Date(FIXED_NOW);
    tomorrow.setDate(FIXED_NOW.getDate() + 1);
    const key = `${tomorrow.getFullYear()}-${String(
      tomorrow.getMonth() + 1
    ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    expect(formatWorldcupDay(key, FIXED_NOW)).toBe("Mañana");
  });

  it("returns 'Ayer' for yesterday", () => {
    const yesterday = new Date(FIXED_NOW);
    yesterday.setDate(FIXED_NOW.getDate() - 1);
    const key = `${yesterday.getFullYear()}-${String(
      yesterday.getMonth() + 1
    ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    expect(formatWorldcupDay(key, FIXED_NOW)).toBe("Ayer");
  });

  it("returns 'Miércoles 15 de julio' for an arbitrary future date", () => {
    expect(formatWorldcupDay("2026-07-15", FIXED_NOW)).toBe(
      "Miércoles 15 de julio"
    );
  });

  it("returns the raw input if it can't parse", () => {
    expect(formatWorldcupDay("not-a-date", FIXED_NOW)).toBe("not-a-date");
    expect(formatWorldcupDay("", FIXED_NOW)).toBe("");
  });
});

describe("formatWorldcupDaySub", () => {
  it("returns the short month label", () => {
    expect(formatWorldcupDaySub("2026-07-15")).toBe("15 de julio");
    expect(formatWorldcupDaySub("2026-06-11")).toBe("11 de junio");
  });

  it("returns empty string for invalid input", () => {
    expect(formatWorldcupDaySub("xx")).toBe("");
  });
});