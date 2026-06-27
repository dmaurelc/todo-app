import { describe, it, expect, beforeAll } from "vitest";

// Pin timezone so toLocaleTimeString produces deterministic output across
// machines. We control the date string, but the formatter converts via the
// runtime TZ; without this, CI on UTC vs. a developer on America/Santiago
// would disagree on whether 03:00Z renders as "03:00" or "00:00".
beforeAll(() => {
  process.env.TZ = "UTC";
});

const { formatWorldcupFixtureTitle } = await import(
  "../../utils/format-worldcup-fixture-title.js"
);

const fixture = (overrides = {}) => ({
  fixture: {
    id: 1,
    date: "2026-06-15T21:00:00Z",
    ...overrides.fixture,
  },
  teams: {
    home: { id: 1, name: "Mexico", logo: "" },
    away: { id: 2, name: "Colombia", logo: "" },
    ...overrides.teams,
  },
  ...overrides,
});

describe("formatWorldcupFixtureTitle", () => {
  it("formats a standard fixture with flag, names and local kickoff", () => {
    const title = formatWorldcupFixtureTitle(fixture());
    // 21:00 UTC is 21:00 in UTC (TZ pinned above).
    // api-football spells the country "Mexico" without the accent; the
    // formatter passes the api-football name through verbatim.
    expect(title).toBe("🇲🇽 Mexico vs 🇨🇴 Colombia · 21:00");
  });

  it("uses the white-flag fallback for unknown team names", () => {
    const title = formatWorldcupFixtureTitle(
      fixture({ teams: { home: { name: "Atlantis" }, away: { name: "El Dorado" } } })
    );
    expect(title).toContain("🏳️");
    expect(title).toContain("Atlantis");
    expect(title).toContain("El Dorado");
  });

  it("renders an em-dash placeholder when the date is missing", () => {
    const title = formatWorldcupFixtureTitle(fixture({ fixture: { id: 1 } }));
    expect(title).toContain("· —");
    expect(title).toContain("Mexico");
    expect(title).toContain("Colombia");
  });

  it("renders TBD when the away team name is missing", () => {
    const title = formatWorldcupFixtureTitle(
      fixture({ teams: { home: { name: "Mexico" }, away: {} } })
    );
    expect(title).toBe("🇲🇽 Mexico vs 🏳️ TBD · 21:00");
  });

  it("handles special-character team names verbatim", () => {
    const title = formatWorldcupFixtureTitle(
      fixture({
        teams: {
          home: { name: "Türkiye" },
          away: { name: "Ivory Coast" },
        },
      })
    );
    expect(title).toBe("🇹🇷 Türkiye vs 🇨🇮 Ivory Coast · 21:00");
  });

  it("formats time in 24-hour clock (HH:MM)", () => {
    const cases = [
      { date: "2026-06-15T00:30:00Z", expected: "00:30" },
      { date: "2026-06-15T13:05:00Z", expected: "13:05" },
      { date: "2026-06-15T23:59:00Z", expected: "23:59" },
    ];
    for (const { date, expected } of cases) {
      const title = formatWorldcupFixtureTitle(fixture({ fixture: { id: 1, date } }));
      expect(title).toMatch(new RegExp(`· ${expected}$`));
    }
  });
});