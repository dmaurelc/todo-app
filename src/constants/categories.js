// Category system constants with high-fidelity minimalist styling (Black & White)
// Used across CategoryBadge, CategoryPicker, and CategoryFilter components

export const CATEGORIES = {
  TRABAJO: {
    value: 'trabajo',
    label: 'Trabajo',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    color: 'black',
    bgColor: 'bg-gray-100',
    darkBgColor: 'dark:bg-white/10',
    textColor: 'text-black',
    darkTextColor: 'dark:text-white',
    borderColor: 'border-transparent',
    darkBorderColor: 'dark:border-transparent'
  },
  PERSONAL: {
    value: 'personal',
    label: 'Personal',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    color: 'black',
    bgColor: 'bg-gray-100',
    darkBgColor: 'dark:bg-white/10',
    textColor: 'text-black',
    darkTextColor: 'dark:text-white',
    borderColor: 'border-transparent',
    darkBorderColor: 'dark:border-transparent'
  },
  SALUD: {
    value: 'salud',
    label: 'Salud',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    color: 'black',
    bgColor: 'bg-gray-100',
    darkBgColor: 'dark:bg-white/10',
    textColor: 'text-black',
    darkTextColor: 'dark:text-white',
    borderColor: 'border-transparent',
    darkBorderColor: 'dark:border-transparent'
  },
  IDEAS: {
    value: 'ideas',
    label: 'Ideas',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    color: 'black',
    bgColor: 'bg-gray-100',
    darkBgColor: 'dark:bg-white/10',
    textColor: 'text-black',
    darkTextColor: 'dark:text-white',
    borderColor: 'border-transparent',
    darkBorderColor: 'dark:border-transparent'
  },
  OTROS: {
    value: 'otros',
    label: 'Otros',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
    color: 'black',
    bgColor: 'bg-gray-100',
    darkBgColor: 'dark:bg-white/10',
    textColor: 'text-black',
    darkTextColor: 'dark:text-white',
    borderColor: 'border-transparent',
    darkBorderColor: 'dark:border-transparent'
  }
};

export const DEFAULT_CATEGORY = "trabajo";

export const getCategoryConfig = (value) => {
  return Object.values(CATEGORIES).find(c => c.value === value) || CATEGORIES.OTROS;
};
