import { formatWorldcupFixtureTitle } from "../utils/format-worldcup-fixture-title.js";

// Category id used for todos that mirror a FIFA World Cup fixture.
export const MUNDIAL_CATEGORY = "mundial";

// Idempotently insert every fixture in `fixtures` into the todo store as a
// "mundial"-category task. Returns counts so the caller can decide whether
// to toast.
//
// Idempotency: each fixture carries `fixture.fixture.id` (number). We tag
// the inserted todo with `external_id = String(id)` and skip any fixture
// whose id already exists on a stored todo. Re-running this function with
// the same fixtures is a no-op (`{ inserted: 0, skipped: N }`).
//
// Pure with respect to module state: reads `getTodos()` lazily, writes via
// the supplied `addTodo`. This makes it trivially testable — pass mock
// functions, assert on returned counts.
//
// Errors never abort the loop: each fixture is processed independently,
// failures increment `errors` and move on.
export const syncFixturesToCalendar = async ({
  fixtures,
  getTodos,
  addTodo,
}) => {
  if (!Array.isArray(fixtures) || fixtures.length === 0) {
    return { inserted: 0, skipped: 0, errors: 0 };
  }

  // Build the dedup set once. Re-runs against the same fixtures skip cleanly.
  const existing = new Set(
    (getTodos?.() ?? [])
      .map((t) => t?.external_id)
      .filter((id) => typeof id === "string" && id.length > 0)
  );

  // Sort by kickoff so insertion order = chronological order. This lets
  // addTodo's existing "+1000" position rule produce monotonically
  // increasing positions without any extra arithmetic.
  const sorted = fixtures
    .slice()
    .sort((a, b) =>
      String(a?.fixture?.date || "").localeCompare(String(b?.fixture?.date || ""))
    );

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const fx of sorted) {
    const id = fx?.fixture?.id;
    if (id == null) {
      errors++;
      continue;
    }
    const externalId = String(id);
    if (existing.has(externalId)) {
      skipped++;
      continue;
    }

    const dateIso = String(fx?.fixture?.date || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
      errors++;
      continue;
    }

    const title = formatWorldcupFixtureTitle(fx);
    if (!title.trim()) {
      errors++;
      continue;
    }

    try {
      await addTodo(title, MUNDIAL_CATEGORY, dateIso, 0, externalId);
      inserted++;
      // Defensive: protect against intra-batch duplicate ids.
      existing.add(externalId);
    } catch (err) {
      console.error("[worldcup-sync] failed to insert fixture", id, err);
      errors++;
    }
  }

  return { inserted, skipped, errors };
};