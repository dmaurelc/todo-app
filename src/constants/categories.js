// Category system constants. Built-in categories are seeded on first run.
// Users can add/rename/remove categories at runtime; `otros` is permanently
// built-in to guarantee a fallback target when deleting the last category
// or reassigning orphaned todos.

const icon = (svg) => svg;

export const BUILTIN_CATEGORIES = {
  TRABAJO: {
    id: "trabajo",
    label: "Trabajo",
    icon: icon('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'),
    builtin: true,
  },
  PERSONAL: {
    id: "personal",
    label: "Personal",
    icon: icon('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'),
    builtin: true,
  },
  SALUD: {
    id: "salud",
    label: "Salud",
    icon: icon('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'),
    builtin: true,
  },
  IDEAS: {
    id: "ideas",
    label: "Ideas",
    icon: icon('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>'),
    builtin: true,
  },
  OTROS: {
    id: "otros",
    label: "Otros",
    // OTROS is a normal built-in category — deletable like the others.
    // If the user removes the last category, useCategories auto-reseeds
    // a fresh "Otros" so the UI always has a fallback target.
    icon: icon('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>'),
    builtin: true,
  },
  MUNDIAL: {
    id: "mundial",
    label: "⚽ Mundial",
    // Auto-populated by useWorldcupSync when the user opens the World Cup
    // view. Deletable like OTROS — removing the category orphans existing
    // match-todos which useCategories reassigns to FALLBACK_CATEGORY.
    icon: icon('<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'),
    builtin: true,
  },
};

export const DEFAULT_CATEGORY = "trabajo";
export const FALLBACK_CATEGORY = "otros";
export const STORAGE_KEY = "categories";
