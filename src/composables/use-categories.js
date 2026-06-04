import { ref, computed } from "vue";
import { storage } from "./use-storage-adapter.js";
import {
  BUILTIN_CATEGORIES,
  DEFAULT_CATEGORY,
  STORAGE_KEY,
} from "../constants/categories.js";

// Generate a slug from a label: "Mi Trabajo" -> "mi-trabajo".
// Returns null if the result collides with an existing id (caller should
// regenerate with a suffix).
const slugify = (label) => {
  const slug = String(label || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  return slug || null;
};

const seedFromBuiltins = () => {
  return Object.fromEntries(
    Object.values(BUILTIN_CATEGORIES).map((c) => [c.id, { ...c, builtin: true }])
  );
};

// When the user deletes the last category, we auto-seed a fresh "Otros"
// so the UI always has at least one selectable category.
const seedFallbackIfEmpty = (items) => {
  if (Object.keys(items).length > 0) return items;
  return {
    ...items,
    [BUILTIN_CATEGORIES.OTROS.id]: {
      ...BUILTIN_CATEGORIES.OTROS,
      builtin: true,
      isFallbackSeed: true,
    },
  };
};

// Migrate from old shape (flat map of categories) to new shape
// ({ items, order }). Old data is read-only here — once migrated the new
// shape is what gets persisted.
const migrateShape = (raw) => {
  const seeded = seedFromBuiltins();
  if (raw && typeof raw === "object" && raw.items && raw.order) {
    // New shape — merge with current seed to absorb new built-ins.
    const merged = { ...seeded };
    for (const [id, cat] of Object.entries(raw.items)) {
      const { locked: _staleLocked, ...catNoLocked } = cat;
      const keepLocked = seeded[id]?.locked === true;
      merged[id] = {
        ...seeded[id],
        ...catNoLocked,
        ...(keepLocked ? { locked: true } : { locked: false }),
        id,
      };
    }
    // Filter order to existing ids; preserve user-specified order first,
    // then any new built-ins not in the saved order, in seed order.
    const knownIds = Object.keys(merged);
    const order = Array.isArray(raw.order) ? raw.order.filter((id) => knownIds.includes(id)) : [];
    const ordered = new Set(order);
    for (const id of knownIds) {
      if (!ordered.has(id)) order.push(id);
    }
    return { items: seedFallbackIfEmpty(merged), order };
  }
  // Old flat-map shape — build order from current keys.
  const merged = { ...seeded };
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [id, cat] of Object.entries(raw)) {
      const { locked: _staleLocked, ...catNoLocked } = cat;
      const keepLocked = seeded[id]?.locked === true;
      merged[id] = {
        ...seeded[id],
        ...catNoLocked,
        ...(keepLocked ? { locked: true } : { locked: false }),
        id,
      };
    }
  }
  const knownIds = Object.keys(merged);
  // Default visible order: alphabetical by label.
  const order = knownIds
    .slice()
    .sort((a, b) => (merged[a].label || "").localeCompare(merged[b].label || "", "es"));
  return { items: seedFallbackIfEmpty(merged), order };
};

const items = ref({});
const order = ref([]);
let initialized = false;
let initPromise = null;

const persist = async () => {
  try {
    await storage.set(STORAGE_KEY, { items: items.value, order: order.value });
  } catch (err) {
    console.error("[categories] persist failed:", err);
    throw err;
  }
};

const init = async () => {
  if (initialized) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const stored = await storage.get(STORAGE_KEY);
      const shape = migrateShape(stored);
      items.value = shape.items;
      order.value = shape.order;
    } catch (err) {
      console.warn("[categories] init failed, using builtins:", err);
      const seeded = seedFromBuiltins();
      items.value = seeded;
      order.value = Object.keys(seeded).sort((a, b) =>
        seeded[a].label.localeCompare(seeded[b].label, "es")
      );
    }
    initialized = true;
  })();
  return initPromise;
};

// Apply mutation to `items`, ensure id is in `order`, then persist.
const mutateAndPersist = async (nextItems, nextOrder) => {
  const itemsWithFallback = seedFallbackIfEmpty(nextItems);
  items.value = itemsWithFallback;
  if (nextOrder) {
    const known = new Set(Object.keys(itemsWithFallback));
    const filtered = nextOrder.filter((id) => known.has(id));
    const have = new Set(filtered);
    const appended = Object.keys(itemsWithFallback).filter((id) => !have.has(id));
    order.value = [...filtered, ...appended];
  } else {
    order.value = Object.keys(itemsWithFallback);
  }
  await persist();
};

export function useCategories() {
  // Sync fallback: if init() hasn't completed yet, return seed data immediately.
  // Prevents blank renders while the async load finishes. Once init() finishes,
  // items.value will have the real data and the computed list will update.
  if (!initialized) {
    const seeded = seedFromBuiltins();
    if (Object.keys(items.value).length === 0) {
      items.value = seeded;
      order.value = Object.keys(seeded).sort((a, b) =>
        seeded[a].label.localeCompare(seeded[b].label, "es")
      );
    }
    init();
  }

  // Sync list derived from reactive items + order — re-renders when either changes.
  // Read-only: use reorder(newOrder) to persist; `vuedraggable` only mutates
  // a writable model, so the dialog uses a separate writable proxy (see
  // CategoryManagerDialog) that calls `reorder` on drop.
  const list = computed(() =>
    order.value
      .map((id) => items.value[id])
      .filter(Boolean)
  );

  const isLocked = (id) => items.value[id]?.locked === true;
  const isFallbackSeed = (id) => items.value[id]?.isFallbackSeed === true;

  const generateUniqueId = (label) => {
    const base = slugify(label) || "categoria";
    let id = base;
    let n = 2;
    while (items.value[id]) {
      id = `${base}-${n++}`;
    }
    return id;
  };

  const add = async (label, iconSvg) => {
    const trimmed = String(label || "").trim();
    if (!trimmed) return null;
    const id = generateUniqueId(trimmed);
    const finalIcon = iconSvg || BUILTIN_CATEGORIES.TRABAJO.icon;
    const nextItems = {
      ...items.value,
      [id]: { id, label: trimmed, icon: finalIcon, builtin: false },
    };
    const nextOrder = order.value.includes(id) ? order.value : [...order.value, id];
    await mutateAndPersist(nextItems, nextOrder);
    return id;
  };

  const rename = async (id, newLabel) => {
    const trimmed = String(newLabel || "").trim();
    if (!trimmed) return false;
    if (isLocked(id)) return false;
    if (!items.value[id]) return false;
    await mutateAndPersist(
      { ...items.value, [id]: { ...items.value[id], label: trimmed } }
    );
    return true;
  };

  const updateIcon = async (id, iconSvg) => {
    if (!iconSvg) return false;
    if (isLocked(id)) return false;
    if (!items.value[id]) return false;
    await mutateAndPersist(
      { ...items.value, [id]: { ...items.value[id], icon: iconSvg } }
    );
    return true;
  };

  const remove = async (id) => {
    if (isLocked(id)) return { ok: false, reason: "locked" };
    if (!items.value[id]) return { ok: false, reason: "missing" };
    const nextItems = { ...items.value };
    delete nextItems[id];
    await mutateAndPersist(nextItems);
    return { ok: true };
  };

  // Reorder the user-facing list. `newOrder` is an array of category ids
  // in the desired order. Unknown ids are skipped; missing ids are appended.
  const reorder = async (newOrder) => {
    if (!Array.isArray(newOrder)) return false;
    const known = new Set(Object.keys(items.value));
    const filtered = newOrder.filter((id) => known.has(id));
    const have = new Set(filtered);
    for (const id of Object.keys(items.value)) {
      if (!have.has(id)) filtered.push(id);
    }
    await mutateAndPersist({ ...items.value }, filtered);
    return true;
  };

  const ensureLoaded = () => init();

  return {
    categories: list,
    categoriesMap: computed(() => items.value),
    add,
    rename,
    updateIcon,
    remove,
    reorder,
    isLocked,
    isFallbackSeed,
    ensureLoaded,
    DEFAULT_CATEGORY,
  };
}
