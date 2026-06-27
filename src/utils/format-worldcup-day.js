// Format a YYYY-MM-DD day key as a friendly Spanish header for the
// World Cup calendar:
//
//   "2026-06-27" → "Hoy"
//   "2026-06-28" → "Mañana"
//   "2026-07-15" → "Miércoles 15 de julio"
//
// Pure: no Vue reactivity. `now` is injectable for deterministic tests.
//
// `dateKey` is expected to be the leading 10 chars of an ISO timestamp
// (matches fixture.fixture.date.slice(0, 10)). Anything else falls back
// to the raw input.

const WEEKDAYS_ES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const toKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function formatWorldcupDay(dateKey, now = new Date()) {
  if (typeof dateKey !== "string" || dateKey.length < 10) return dateKey || "";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayKey = toKey(today);
  const tomorrowKey = toKey(tomorrow);
  const yesterdayKey = toKey(yesterday);

  if (dateKey === todayKey) return "Hoy";
  if (dateKey === tomorrowKey) return "Mañana";
  if (dateKey === yesterdayKey) return "Ayer";

  const [y, m, d] = dateKey.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return dateKey;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return dateKey;
  return `${WEEKDAYS_ES[dt.getDay()]} ${d} de ${MONTHS_ES[m - 1]}`;
}

// Shorter sublabel for under the day heading ("15 de julio").
export function formatWorldcupDaySub(dateKey) {
  if (typeof dateKey !== "string" || dateKey.length < 10) return "";
  const [y, m, d] = dateKey.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${d} de ${MONTHS_ES[m - 1]}`;
}