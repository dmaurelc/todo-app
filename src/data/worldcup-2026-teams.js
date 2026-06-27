// Static lookup of FIFA World Cup 2026 qualified teams → flag emoji + ISO code.
//
// api-football /fixtures returns `teams.home.name` and `teams.away.name` as
// strings (e.g. "South Korea", "Türkiye", "Ivory Coast"). It does NOT return
// a country code, so we derive flag + ISO 3166-1 alpha-2 from a static map
// keyed by the exact api-football team name.
//
// Why static:
//   - The WC 2026 field is fixed (48 teams) and known months before kickoff.
//   - Static lookup avoids an extra /teams API call (rate-limit budget).
//   - Easier to unit-test: pin against the exact api-football names.
//
// Names below MUST match api-football strings verbatim. If api-football ever
// renames a team, the formatter falls back to "🏳️" + the raw name.

export const WORLD_CUP_2026_TEAM_MAP = {
  // Host nations (CONCACAF)
  "United States":      { code: "us", flag: "🇺🇸" },
  "Mexico":             { code: "mx", flag: "🇲🇽" },
  "Canada":             { code: "ca", flag: "🇨🇦" },

  // UEFA (16)
  "England":            { code: "gb-eng", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "France":             { code: "fr", flag: "🇫🇷" },
  "Germany":            { code: "de", flag: "🇩🇪" },
  "Spain":              { code: "es", flag: "🇪🇸" },
  "Portugal":           { code: "pt", flag: "🇵🇹" },
  "Netherlands":        { code: "nl", flag: "🇳🇱" },
  "Belgium":            { code: "be", flag: "🇧🇪" },
  "Italy":              { code: "it", flag: "🇮🇹" },
  "Croatia":            { code: "hr", flag: "🇭🇷" },
  "Switzerland":        { code: "ch", flag: "🇨🇭" },
  "Denmark":            { code: "dk", flag: "🇩🇰" },
  "Austria":            { code: "at", flag: "🇦🇹" },
  "Scotland":           { code: "gb-sct", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  "Poland":             { code: "pl", flag: "🇵🇱" },
  "Ukraine":            { code: "ua", flag: "🇺🇦" },
  "Czech Republic":     { code: "cz", flag: "🇨🇿" },
  "Türkiye":            { code: "tr", flag: "🇹🇷" },

  // CONMEBOL (6 + 1 intercontinental playoff)
  "Brazil":             { code: "br", flag: "🇧🇷" },
  "Argentina":          { code: "ar", flag: "🇦🇷" },
  "Uruguay":            { code: "uy", flag: "🇺🇾" },
  "Colombia":           { code: "co", flag: "🇨🇴" },
  "Chile":              { code: "cl", flag: "🇨🇱" },
  "Ecuador":            { code: "ec", flag: "🇪🇨" },
  "Paraguay":           { code: "py", flag: "🇵🇾" },

  // CONCACAF (3 non-host)
  "Panama":             { code: "pa", flag: "🇵🇦" },
  "Costa Rica":         { code: "cr", flag: "🇨🇷" },
  "Jamaica":            { code: "jm", flag: "🇯🇲" },

  // AFC (8)
  "Japan":              { code: "jp", flag: "🇯🇵" },
  "Iran":               { code: "ir", flag: "🇮🇷" },
  "South Korea":        { code: "kr", flag: "🇰🇷" },
  "Australia":          { code: "au", flag: "🇦🇺" },
  "Saudi Arabia":       { code: "sa", flag: "🇸🇦" },
  "Qatar":              { code: "qa", flag: "🇶🇦" },
  "Iraq":               { code: "iq", flag: "🇮🇶" },
  "Uzbekistan":         { code: "uz", flag: "🇺🇿" },
  "Jordan":             { code: "jo", flag: "🇯🇴" },

  // CAF (9)
  "Morocco":            { code: "ma", flag: "🇲🇦" },
  "Senegal":            { code: "sn", flag: "🇸🇳" },
  "Nigeria":            { code: "ng", flag: "🇳🇬" },
  "Egypt":              { code: "eg", flag: "🇪🇬" },
  "Cameroon":           { code: "cm", flag: "🇨🇲" },
  "Algeria":            { code: "dz", flag: "🇩🇿" },
  "Ghana":              { code: "gh", flag: "🇬🇭" },
  "Ivory Coast":        { code: "ci", flag: "🇨🇮" },
  "Tunisia":            { code: "tn", flag: "🇹🇳" },
  "South Africa":       { code: "za", flag: "🇿🇦" },
  "Cape Verde":         { code: "cv", flag: "🇨🇻" },

  // OFC (1)
  "New Zealand":        { code: "nz", flag: "🇳🇿" },
};

const FALLBACK_BADGE = { code: "", flag: "🏳️" };

// Resolve a team name to its {code, flag} badge. Falls back to a white flag
// for unknown names so the formatter always produces a non-empty title
// (addTodo rejects empty titles — see useTodos.js).
export const getTeamBadge = (apiFootballName) =>
  WORLD_CUP_2026_TEAM_MAP[apiFootballName] || FALLBACK_BADGE;