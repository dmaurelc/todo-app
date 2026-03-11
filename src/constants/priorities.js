// Priority system constants with colors, icons, and labels
// Used across PriorityBadge, PriorityPicker, and PriorityFilter components

export const PRIORITIES = {
  LOW: {
    value: 'low',
    label: 'Baja',
    icon: '⬇️',
    color: 'green',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-900/30',
    textColor: 'text-green-700',
    darkTextColor: 'dark:text-green-400',
    borderColor: 'border-green-200',
    darkBorderColor: 'dark:border-green-700'
  },
  MEDIUM: {
    value: 'medium',
    label: 'Media',
    icon: '➡️',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    darkBgColor: 'dark:bg-yellow-900/30',
    textColor: 'text-yellow-700',
    darkTextColor: 'dark:text-yellow-400',
    borderColor: 'border-yellow-200',
    darkBorderColor: 'dark:border-yellow-700'
  },
  HIGH: {
    value: 'high',
    label: 'Alta',
    icon: '⬆️',
    color: 'orange',
    bgColor: 'bg-orange-100',
    darkBgColor: 'dark:bg-orange-900/30',
    textColor: 'text-orange-700',
    darkTextColor: 'dark:text-orange-400',
    borderColor: 'border-orange-200',
    darkBorderColor: 'dark:border-orange-700'
  },
  URGENT: {
    value: 'urgent',
    label: 'Urgente',
    icon: '🔥',
    color: 'red',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-900/30',
    textColor: 'text-red-700',
    darkTextColor: 'dark:text-red-400',
    borderColor: 'border-red-200',
    darkBorderColor: 'dark:border-red-700'
  }
};

export const DEFAULT_PRIORITY = 'medium';

// Helper to get priority config by value
export const getPriorityConfig = (value) => {
  return Object.values(PRIORITIES).find(p => p.value === value) || PRIORITIES.MEDIUM;
};
