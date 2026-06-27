import { describe, it, expect, vi, beforeAll } from "vitest";

// Pin TZ so the formatter's local-time formatting is deterministic across
// machines. We only assert on the dueDate argument (YYYY-MM-DD), not the
// formatted title's time component, but TZ affects the formatter and we
// want zero surprises in test output.
beforeAll(() => {
  process.env.TZ = "UTC";
});

const { syncFixturesToCalendar, MUNDIAL_CATEGORY } = await import(
  "../useWorldcupSync.js"
);

// Build N synthetic fixtures, ids 1..N, dates spread across N consecutive days.
const buildFixtures = (n, { reverse = false } = {}) => {
  const list = Array.from({ length: n }, (_, i) => {
    const day = String((i % 28) + 1).padStart(2, "0");
    const month = String(Math.floor(i / 28) + 6).padStart(2, "0");
    return {
      fixture: {
        id: i + 1,
        date: `2026-${month}-${day}T20:00:00Z`,
        status: { short: "NS" },
      },
      league: { round: "Group Stage" },
      teams: {
        home: { id: i * 2 + 1, name: "Mexico", logo: "" },
        away: { id: i * 2 + 2, name: "Colombia", logo: "" },
      },
      goals: { home: null, away: null },
    };
  });
  return reverse ? list.reverse() : list;
};

// Mock getTodos / addTodo per test. The composable is pure so we don't need
// to mock storage or the useTodos composable itself.
const makeMocks = ({ todos = [] } = {}) => {
  const addTodo = vi.fn(async () => {});
  const getTodos = vi.fn(() => todos);
  return { addTodo, getTodos };
};

describe("syncFixturesToCalendar", () => {
  it("returns zero counts for an empty fixtures array", async () => {
    const { addTodo, getTodos } = makeMocks();
    const result = await syncFixturesToCalendar({ fixtures: [], getTodos, addTodo });
    expect(result).toEqual({ inserted: 0, skipped: 0, errors: 0 });
    expect(addTodo).not.toHaveBeenCalled();
  });

  it("returns zero counts and does not throw on non-array fixtures", async () => {
    const { addTodo, getTodos } = makeMocks();
    for (const bad of [null, undefined, "string", 42, { response: [] }]) {
      const result = await syncFixturesToCalendar({
        fixtures: bad,
        getTodos,
        addTodo,
      });
      expect(result).toEqual({ inserted: 0, skipped: 0, errors: 0 });
    }
    expect(addTodo).not.toHaveBeenCalled();
  });

  it("inserts all 104 fixtures when the store is empty", async () => {
    const fixtures = buildFixtures(104);
    const { addTodo, getTodos } = makeMocks();
    const result = await syncFixturesToCalendar({ fixtures, getTodos, addTodo });
    expect(result.inserted).toBe(104);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
    expect(addTodo).toHaveBeenCalledTimes(104);
    // First call's externalId is "1", last call's is "104".
    expect(addTodo.mock.calls[0][4]).toBe("1");
    expect(addTodo.mock.calls[103][4]).toBe("104");
  });

  it("is idempotent — second run with same fixtures is a no-op", async () => {
    const fixtures = buildFixtures(104);
    const calls = [];
    const addTodo = vi.fn(async (...args) => {
      calls.push(args[4]); // externalId
    });
    // Simulate the store accumulating external_ids after the first run.
    let stored = [];
    const getTodos = vi.fn(() => stored);

    const first = await syncFixturesToCalendar({ fixtures, getTodos, addTodo });
    expect(first.inserted).toBe(104);

    // Mirror what the real store would do: each inserted todo gets an external_id.
    stored = calls.map((external_id) => ({ external_id }));

    const second = await syncFixturesToCalendar({ fixtures, getTodos, addTodo });
    expect(second.inserted).toBe(0);
    expect(second.skipped).toBe(104);
    expect(addTodo).toHaveBeenCalledTimes(104); // unchanged
  });

  it("inserts only the missing ones when some are pre-seeded", async () => {
    const fixtures = buildFixtures(10);
    // Pre-seed external_ids "1" through "5".
    const stored = Array.from({ length: 5 }, (_, i) => ({
      external_id: String(i + 1),
    }));
    const { addTodo, getTodos } = makeMocks({ todos: stored });

    const result = await syncFixturesToCalendar({ fixtures, getTodos, addTodo });
    expect(result.inserted).toBe(5);
    expect(result.skipped).toBe(5);
    expect(result.errors).toBe(0);
  });

  it("inserts fixtures in chronological order regardless of input order", async () => {
    const fixtures = buildFixtures(10, { reverse: true });
    const { addTodo, getTodos } = makeMocks();
    await syncFixturesToCalendar({ fixtures, getTodos, addTodo });

    const dueDates = addTodo.mock.calls.map((call) => call[2]); // dueDate arg
    const sorted = [...dueDates].sort();
    expect(dueDates).toEqual(sorted);
    expect(dueDates[0]).toBe("2026-06-01");
    expect(dueDates[dueDates.length - 1]).toBe("2026-06-10");
  });

  it("counts fixtures missing `fixture.id` as errors and continues", async () => {
    const fixtures = [
      ...buildFixtures(3),
      { fixture: { date: "2026-06-20T20:00:00Z" }, teams: { home: { name: "X" }, away: { name: "Y" } } }, // no id
      ...buildFixtures(2).map((f, i) => ({ ...f, fixture: { ...f.fixture, id: 100 + i } })),
    ];
    const { addTodo, getTodos } = makeMocks();
    const result = await syncFixturesToCalendar({ fixtures, getTodos, addTodo });
    expect(result.inserted).toBe(5);
    expect(result.errors).toBe(1);
  });

  it("counts fixtures with malformed dates as errors", async () => {
    const fixtures = [
      ...buildFixtures(3),
      { fixture: { id: 999, date: "garbage" }, teams: { home: { name: "A" }, away: { name: "B" } } },
    ];
    const { addTodo, getTodos } = makeMocks();
    const result = await syncFixturesToCalendar({ fixtures, getTodos, addTodo });
    expect(result.inserted).toBe(3);
    expect(result.errors).toBe(1);
    // Confirm addTodo was never called with externalId "999".
    const ids = addTodo.mock.calls.map((c) => c[4]);
    expect(ids).not.toContain("999");
  });

  it("continues when addTodo throws and counts the failure as an error", async () => {
    const fixtures = buildFixtures(4);
    const addTodo = vi.fn().mockImplementation(async (title) => {
      if (title.includes("Colombia")) throw new Error("disk full");
    });
    const getTodos = vi.fn(() => []);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await syncFixturesToCalendar({ fixtures, getTodos, addTodo });
    expect(result.inserted + result.skipped + result.errors).toBe(4);
    expect(result.errors).toBeGreaterThanOrEqual(1);
    expect(addTodo).toHaveBeenCalledTimes(4);
    errSpy.mockRestore();
  });

  it("always uses the 'mundial' category", async () => {
    const fixtures = buildFixtures(5);
    const { addTodo, getTodos } = makeMocks();
    await syncFixturesToCalendar({ fixtures, getTodos, addTodo });
    for (const call of addTodo.mock.calls) {
      expect(call[1]).toBe("mundial");
      expect(call[1]).toBe(MUNDIAL_CATEGORY);
    }
  });
});