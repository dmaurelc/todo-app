// Priority system constants with colors, icons, and labels
// Used across PriorityBadge, PriorityPicker, and PriorityFilter components

export const PRIORITIES = {
  LOW: {
    value: "low",
    label: "Media",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    color: "blue",
    bgColor: "bg-blue-50/80",
    darkBgColor: "dark:bg-blue-900/20",
    textColor: "text-blue-700",
    darkTextColor: "dark:text-blue-400",
    borderColor: "border-transparent",
    darkBorderColor: "dark:border-transparent",
  },
  HIGH: {
    value: "high",
    label: "Alta",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
    color: "orange",
    bgColor: "bg-orange-50/80",
    darkBgColor: "dark:bg-orange-900/20",
    textColor: "text-orange-700",
    darkTextColor: "dark:text-orange-400",
    borderColor: "border-transparent",
    darkBorderColor: "dark:border-transparent",
  },
  URGENT: {
    value: "urgent",
    label: "Urgente",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
    color: "red",
    bgColor: "bg-red-50/80",
    darkBgColor: "dark:bg-red-900/20",
    textColor: "text-red-700",
    darkTextColor: "dark:text-red-400",
    borderColor: "border-transparent",
    darkBorderColor: "dark:border-transparent",
  },
};

export const DEFAULT_PRIORITY = "medium";

// Helper to get priority config by value
export const getPriorityConfig = (value) => {
  return (
    Object.values(PRIORITIES).find((p) => p.value === value) ||
    PRIORITIES.MEDIUM
  );
};
