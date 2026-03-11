// Category system constants with emoji icons, colors, and labels
// Used across CategoryBadge, CategoryPicker, and CategoryFilter components

export const CATEGORIES = {
  TRABAJO: {
    value: 'trabajo',
    label: 'Trabajo',
    icon: '💼',
    color: 'blue',
    bgColor: 'bg-blue-100',
    darkBgColor: 'dark:bg-blue-900/30',
    textColor: 'text-blue-700',
    darkTextColor: 'dark:text-blue-400',
    borderColor: 'border-blue-200',
    darkBorderColor: 'dark:border-blue-700'
  },
  PERSONAL: {
    value: 'personal',
    label: 'Personal',
    icon: '🏠',
    color: 'purple',
    bgColor: 'bg-purple-100',
    darkBgColor: 'dark:bg-purple-900/30',
    textColor: 'text-purple-700',
    darkTextColor: 'dark:text-purple-400',
    borderColor: 'border-purple-200',
    darkBorderColor: 'dark:border-purple-700'
  },
  SALUD: {
    value: 'salud',
    label: 'Salud',
    icon: '💪',
    color: 'green',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-900/30',
    textColor: 'text-green-700',
    darkTextColor: 'dark:text-green-400',
    borderColor: 'border-green-200',
    darkBorderColor: 'dark:border-green-700'
  },
  IDEAS: {
    value: 'ideas',
    label: 'Ideas',
    icon: '💡',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    darkBgColor: 'dark:bg-yellow-900/30',
    textColor: 'text-yellow-700',
    darkTextColor: 'dark:text-yellow-400',
    borderColor: 'border-yellow-200',
    darkBorderColor: 'dark:border-yellow-700'
  },
  OTROS: {
    value: 'otros',
    label: 'Otros',
    icon: '📌',
    color: 'gray',
    bgColor: 'bg-gray-100',
    darkBgColor: 'dark:bg-gray-800',
    textColor: 'text-gray-700',
    darkTextColor: 'dark:text-gray-300',
    borderColor: 'border-gray-200',
    darkBorderColor: 'dark:border-gray-700'
  }
};

export const DEFAULT_CATEGORY = 'otros';

// Helper to get category config by value
export const getCategoryConfig = (value) => {
  return Object.values(CATEGORIES).find(c => c.value === value) || CATEGORIES.OTROS;
};
