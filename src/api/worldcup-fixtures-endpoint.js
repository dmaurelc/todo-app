// League id 1 = FIFA World Cup. Season "2026" covers the tournament that
// runs Jun-Jul 2026 (spans calendar year end-of-2025 qualifiers not relevant here).
export const WORLD_CUP_LEAGUE_ID = 1;
export const WORLD_CUP_SEASON = 2026;

export const fetchWorldCupFixtures = (client, { from, to } = {}) =>
  client("/fixtures", {
    league: WORLD_CUP_LEAGUE_ID,
    season: WORLD_CUP_SEASON,
    from, // YYYY-MM-DD
    to, // YYYY-MM-DD
  });
