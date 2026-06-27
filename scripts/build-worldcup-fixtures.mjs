#!/usr/bin/env node
// Build-time scraper: extracts FIFA World Cup 2026 fixture data from
// Wikipedia's MediaWiki API and writes src/data/worldcup-2026-fixtures.json
// in the api-football.com response shape consumed by the app.
//
// Why Wikipedia: the api-football.com free plan does not cover the 2026
// season ("try from 2022 to 2024"). Wikipedia's match articles use a
// structured {{#invoke:football box|main ...}} template with date, time,
// UTC offset, team FIFA codes, stadium, and (for played matches) scores.
//
// Why build-time, not runtime: Wikipedia returns no Access-Control-Allow-
// Origin for browser fetches. Running the scrape at build/dev-time avoids
// CORS and rate-limit issues, produces a deterministic JSON, and keeps the
// runtime payload small.
//
// Re-run whenever the schedule changes (rescheduled matches, late team
// updates, etc.). Output is checked in so the app works without running
// this script first.

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUTPUT = resolve(ROOT, "src/data/worldcup-2026-fixtures.json");

const WIKI = "https://en.wikipedia.org/w/api.php";
const UA = "todoapp-wc-scraper/1.0 (https://github.com/example)";

// Source articles. Group-stage matches live in section 3 ("Matches") of
// each group article — all 6 fixtures are siblings under one section,
// separated by `<section begin=AN />` markers. Knockout R16/QF/SF/3rd
// each get one match per sub-section (L3). The Final lives in its own
// article under section 5.
const GROUP_ARTICLES = "ABCDEFGHIJKL".split("").map(
  (l) => `2026 FIFA World Cup Group ${l}`,
);
const R32_ARTICLE = "2026 FIFA World Cup round of 32";
const R32_SECTIONS = Array.from({ length: 16 }, (_, i) => i + 2); // 2..17
const KNOCKOUT_ARTICLE = "2026 FIFA World Cup knockout stage";
const R16_SECTIONS = Array.from({ length: 8 }, (_, i) => i + 7); // 7..14
const QF_SECTIONS = Array.from({ length: 4 }, (_, i) => i + 16); // 16..19
const SF_SECTIONS = [21, 22];
const THIRD_PLACE_SECTION = 23;
const FINAL_ARTICLE = "2026 FIFA World Cup final";
const FINAL_SECTION = 5;

// api-football.com team name → FIFA 3-letter code. Wikipedia stores team
// codes inside {{#invoke:flag|fb-rt|CODE}}. We map back to api-football's
// human-readable name so downstream consumers see a stable display name.
const FIFA_CODE_TO_NAME = {
  MEX: "Mexico", USA: "United States", CAN: "Canada",
  ENG: "England", FRA: "France", GER: "Germany", ESP: "Spain", POR: "Portugal",
  NED: "Netherlands", BEL: "Belgium", ITA: "Italy", CRO: "Croatia", SUI: "Switzerland",
  DEN: "Denmark", AUT: "Austria", SCO: "Scotland", POL: "Poland", UKR: "Ukraine",
  CZE: "Czech Republic", TUR: "Türkiye", NOR: "Norway", SWE: "Sweden", SRB: "Serbia",
  BRA: "Brazil", ARG: "Argentina", URU: "Uruguay", COL: "Colombia", CHI: "Chile",
  ECU: "Ecuador", PAR: "Paraguay",
  PAN: "Panama", CRC: "Costa Rica", JAM: "Jamaica", HON: "Honduras", SLV: "El Salvador",
  JPN: "Japan", IRN: "Iran", KOR: "South Korea", AUS: "Australia", KSA: "Saudi Arabia",
  QAT: "Qatar", IRQ: "Iraq", UZB: "Uzbekistan", JOR: "Jordan", UAE: "United Arab Emirates",
  CHN: "China PR", PRK: "North Korea",
  MAR: "Morocco", SEN: "Senegal", NGA: "Nigeria", EGY: "Egypt", CMR: "Cameroon",
  ALG: "Algeria", GHA: "Ghana", CIV: "Ivory Coast", TUN: "Tunisia", RSA: "South Africa",
  CPV: "Cape Verde", COD: "DR Congo", MLI: "Mali", BFA: "Burkina Faso", GUI: "Guinea",
  NZL: "New Zealand",
  // Late UEFA playoff / CONCACAF / Caribbean qualifiers
  BIH: "Bosnia and Herzegovina", CUW: "Curaçao", HAI: "Haiti",
};

async function fetchSection(article, section) {
  const url = `${WIKI}?action=parse&page=${encodeURIComponent(article)}&format=json&prop=wikitext&section=${section}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${article} §${section}`);
  const json = await res.json();
  if (json.error) throw new Error(`API error: ${json.error.info}`);
  return json.parse?.wikitext?.["*"] ?? "";
}

async function fetchArticle(article) {
  const url = `${WIKI}?action=parse&page=${encodeURIComponent(article)}&format=json&prop=wikitext`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${article}`);
  const json = await res.json();
  if (json.error) throw new Error(`API error: ${json.error.info}`);
  return json.parse?.wikitext?.["*"] ?? "";
}

// Brace-counted extraction of every {{#invoke:football box|main ...}} body
// in a wikitext blob. Non-greedy regexes fail because values themselves
// contain `{{...}}` (Start date, score link, multiref). Walking the brace
// stack is the only reliable way to find the matching `}}`.
function extractFootballBoxes(wikitext) {
  const boxes = [];
  const marker = /\{\{#invoke:[Ff]ootball box\|main/g;
  let m;
  while ((m = marker.exec(wikitext)) !== null) {
    const start = m.index;
    let depth = 0;
    let i = start;
    while (i < wikitext.length) {
      if (wikitext[i] === "{" && wikitext[i + 1] === "{") {
        depth++;
        i += 2;
      } else if (wikitext[i] === "}" && wikitext[i + 1] === "}") {
        depth--;
        if (depth === 0) {
          boxes.push(wikitext.slice(start, i + 2));
          break;
        }
        i += 2;
      } else {
        i++;
      }
    }
  }
  return boxes;
}

// Pull a named parameter out of a `{{#invoke:football box|main\n|...}}`
// template body. Tolerant of whitespace and multiline values. Stops at
// the next `|name=` at column 0 OR a literal `\n}}` closing the template.
function readParam(body, name) {
  const re = new RegExp(`\\n\\s*\\|\\s*${name}\\s*=\\s*([\\s\\S]*?)(?=\\n\\s*\\||\\n\\s*\\}\\$)`, "i");
  const m = body.match(re);
  return m ? m[1].trim() : null;
}

function readStartDate(body) {
  const v = readParam(body, "date");
  if (!v) return null;
  const m = v.match(/\{\{Start date\s*\|\s*(\d{4})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})\s*\}\}/i);
  if (!m) return null;
  return { year: +m[1], month: +m[2], day: +m[3] };
}

// Parse "1:00&nbsp;p.m. [[UTC−06:00|UTC−6]]" → {hours, minutes, offsetMinutes}.
// Unicode minus (U+2212 `−`) and en-dash are both seen in the wild.
function readKickoff(body) {
  const raw = readParam(body, "time");
  if (!raw) return null;
  const deentity = raw.replace(/&nbsp;/g, " ").replace(/&#160;/g, " ");
  const hm = deentity.match(/(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)/i);
  if (!hm) return null;
  let hours = +hm[1];
  const minutes = +hm[2];
  const isPm = /p\.m\./i.test(hm[3]);
  if (isPm && hours !== 12) hours += 12;
  if (!isPm && hours === 12) hours = 0;
  const offsetMatch = deentity.match(/UTC\s*([+\-−–])(\d{1,2})(?::(\d{2}))?/);
  let offsetMinutes = 0;
  if (offsetMatch) {
    const sign = offsetMatch[1] === "-" || offsetMatch[1] === "−" || offsetMatch[1] === "–" ? -1 : 1;
    const h = +offsetMatch[2];
    const min = +(offsetMatch[3] ?? 0);
    offsetMinutes = sign * (h * 60 + min);
  }
  return { hours, minutes, offsetMinutes };
}

// Convert local kickoff + UTC offset into a UTC ISO timestamp.
function buildIso({ year, month, day }, { hours, minutes, offsetMinutes }) {
  const localMs = Date.UTC(year, month - 1, day, hours, minutes);
  const utcMs = localMs - offsetMinutes * 60_000;
  return new Date(utcMs).toISOString();
}

// Resolve a team field. Two shapes appear:
//   1. {{#invoke:flag|fb-rt|MEX}}              → use FIFA code
//   2. <!--{{#invoke:flag|fb|}}-->Winner M73   → HTML comment + placeholder
function readTeam(rawField) {
  if (!rawField) return { name: null, code: null };
  const cleaned = rawField.replace(/<!--[\s\S]*?-->/g, "").trim();
  const codeMatch = cleaned.match(/\|\s*([A-Z]{3})\s*\}\}/);
  if (codeMatch) {
    const code = codeMatch[1];
    return { name: FIFA_CODE_TO_NAME[code] ?? code, code };
  }
  return { name: cleaned || null, code: null };
}

// Strip [[wiki links]] to plain text, preserving the displayed text.
function stripWikiLinks(s) {
  return s.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1");
}

function readStadium(body) {
  const raw = readParam(body, "stadium");
  return raw ? stripWikiLinks(raw).replace(/\s+/g, " ").trim() : null;
}

// Real score is "X–Y" (en-dash). Placeholders read "Match 73" / "TBD".
function readScore(body) {
  const raw = readParam(body, "score");
  if (!raw) return { home: null, away: null };
  const m = raw.match(/(\d+)\s*[–-]\s*(\d+)/);
  if (!m) return { home: null, away: null };
  return { home: +m[1], away: +m[2] };
}

// api-football.com fixture.id is a stable integer. Our scraped fixtures
// don't have one, so we synthesize a stable id from (round + iso + counter).
// The counter disambiguates matches on the same day in the same round.
let syntheticIdCounter = 0;
function syntheticId(round, isoDate) {
  syntheticIdCounter += 1;
  let h = 0;
  const s = `${round}|${isoDate}`;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  // Slugify round: collapse non-ASCII (·, accents) to ASCII so the id is
  // safe to use as a Map key / external_id. Hash already disambiguates.
  const slug = round
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `wc2026-${slug}-${Math.abs(h)}-${syntheticIdCounter}`;
}

function hashCode(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function parseBox(boxBody, round) {
  const date = readStartDate(boxBody);
  const kickoff = readKickoff(boxBody);
  if (!date || !kickoff) return null;
  const iso = buildIso(date, kickoff);
  const home = readTeam(readParam(boxBody, "team1"));
  const away = readTeam(readParam(boxBody, "team2"));
  const stadium = readStadium(boxBody);
  const score = readScore(boxBody);
  return {
    fixture: {
      id: syntheticId(round, iso),
      date: iso,
      timestamp: Math.floor(new Date(iso).getTime() / 1000),
      timezone: "UTC",
      status: { short: score.home != null ? "FT" : "NS" },
    },
    league: { round, stadium },
    teams: {
      home: { id: home.code ? hashCode(home.code) : null, name: home.name, logo: "" },
      away: { id: away.code ? hashCode(away.code) : null, name: away.name, logo: "" },
    },
    goals: score,
    score,
  };
}

// Resolve {{#lst:Article|Section}} transclusions. Some group articles
// (Group F at time of writing) defer one match's football box to a
// dedicated sub-article. We fetch each transcluded article once and
// treat any football boxes found inside it as belonging to the parent
// group — those sub-articles hold exactly one match's data.
async function scrapeGroupStage() {
  const fixtures = [];
  for (const article of GROUP_ARTICLES) {
    const wikitext = await fetchArticle(article);
    const boxes = extractFootballBoxes(wikitext);
    const groupLetter = article.split(" ").pop();
    const round = `Group Stage · ${groupLetter}`;
    for (const box of boxes) {
      const fx = parseBox(box, round);
      if (fx) fixtures.push(fx);
    }
    // Follow transclusions. The dedup Set prevents double-fetch if two
    // groups happen to reference the same sub-article (none today).
    const transcluded = new Set();
    for (const m of wikitext.matchAll(/\{\{#lst:\s*([^|}]+)\|/g)) {
      transcluded.add(m[1].trim());
    }
    for (const sub of transcluded) {
      const subWt = await fetchArticle(sub);
      const subBoxes = extractFootballBoxes(subWt);
      for (const box of subBoxes) {
        const fx = parseBox(box, round);
        if (fx) fixtures.push(fx);
      }
      console.log(`    + ${sub}: ${subBoxes.length} matches`);
    }
    const groupTotal = fixtures.filter((f) => f.league.round === round).length;
    console.log(`  ${groupLetter}: ${groupTotal} matches`);
  }
  return fixtures;
}

async function scrapeR32() {
  const fixtures = [];
  for (const sec of R32_SECTIONS) {
    const wt = await fetchSection(R32_ARTICLE, sec);
    const boxes = extractFootballBoxes(wt);
    for (const box of boxes) {
      const fx = parseBox(box, "Round of 32");
      if (fx) fixtures.push(fx);
    }
  }
  console.log(`  R32: ${fixtures.length} matches`);
  return fixtures;
}

async function scrapeKnockoutSection(article, section, label) {
  const wt = await fetchSection(article, section);
  const boxes = extractFootballBoxes(wt);
  const out = boxes.map((b) => parseBox(b, label)).filter(Boolean);
  console.log(`  ${label} §${section}: ${out.length} match`);
  return out;
}

async function scrapeFinal() {
  const wt = await fetchSection(FINAL_ARTICLE, FINAL_SECTION);
  const boxes = extractFootballBoxes(wt);
  const out = boxes.map((b) => parseBox(b, "Final")).filter(Boolean);
  console.log(`  Final: ${out.length} match`);
  return out;
}

async function main() {
  console.log("Scraping Wikipedia for FIFA World Cup 2026 fixtures...");
  console.log("- Group stage (72 matches across 12 groups)");
  const groupFixtures = await scrapeGroupStage();

  console.log("- Round of 32 (16 matches)");
  const r32Fixtures = await scrapeR32();

  console.log("- Round of 16 (8 matches)");
  const r16 = [];
  for (const sec of R16_SECTIONS) {
    r16.push(...(await scrapeKnockoutSection(KNOCKOUT_ARTICLE, sec, "Round of 16")));
  }

  console.log("- Quarter-finals (4 matches)");
  const qf = [];
  for (const sec of QF_SECTIONS) {
    qf.push(...(await scrapeKnockoutSection(KNOCKOUT_ARTICLE, sec, "Quarter-finals")));
  }

  console.log("- Semi-finals (2 matches)");
  const sf = [];
  for (const sec of SF_SECTIONS) {
    sf.push(...(await scrapeKnockoutSection(KNOCKOUT_ARTICLE, sec, "Semi-finals")));
  }

  console.log("- Third-place playoff");
  const third = await scrapeKnockoutSection(KNOCKOUT_ARTICLE, THIRD_PLACE_SECTION, "Third-place playoff");

  console.log("- Final");
  const finalFixtures = await scrapeFinal();

  const all = [
    ...groupFixtures,
    ...r32Fixtures,
    ...r16,
    ...qf,
    ...sf,
    ...third,
    ...finalFixtures,
  ];

  // Sort chronologically so insertion order matches the calendar.
  all.sort((a, b) => a.fixture.date.localeCompare(b.fixture.date));

  const expected = 104; // 72 + 16 + 8 + 4 + 2 + 1 + 1
  console.log(`\nTotal fixtures scraped: ${all.length}`);
  if (all.length !== expected) {
    console.warn(`⚠ Expected ${expected} fixtures, got ${all.length}. Investigate before shipping.`);
  }

  // Show round breakdown for quick visual verification.
  const byRound = all.reduce((acc, f) => {
    acc[f.league.round] = (acc[f.league.round] ?? 0) + 1;
    return acc;
  }, {});
  console.log("\nBreakdown:");
  for (const [round, count] of Object.entries(byRound)) {
    console.log(`  ${round}: ${count}`);
  }

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(all, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});