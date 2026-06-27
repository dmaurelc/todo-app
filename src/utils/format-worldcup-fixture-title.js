import { getTeamBadge } from "../data/worldcup-2026-teams.js";

// Format a FIFA World Cup fixture as a todo title:
//
//   "🇲🇽 México vs 🇨🇴 Colombia · 21:00"
//
// - Flag emoji + full team name on each side (api-football names).
// - Middle dot `·` separator.
// - Local kickoff time, 24-hour clock.
//
// Pure: no Vue reactivity, no module state. Cheap enough for 104 calls.
//
// Defensive:
// - Missing team name → "TBD" (so the title is never empty; addTodo rejects
//   empty titles — see useTodos.js).
// - Unknown team → 🏳️ fallback from getTeamBadge.
// - Missing/invalid date → "· —" (no throw).

export const formatWorldcupFixtureTitle = (fixture) => {
  const homeName = fixture?.teams?.home?.name || "TBD";
  const awayName = fixture?.teams?.away?.name || "TBD";
  const homeFlag = getTeamBadge(homeName).flag;
  const awayFlag = getTeamBadge(awayName).flag;

  let timeLabel = "—";
  const dateStr = fixture?.fixture?.date;
  if (typeof dateStr === "string" && dateStr.length > 0) {
    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
      timeLabel = parsed.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }

  return `${homeFlag} ${homeName} vs ${awayFlag} ${awayName} · ${timeLabel}`;
};