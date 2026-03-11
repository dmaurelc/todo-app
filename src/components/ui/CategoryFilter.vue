<script setup>
import { computed } from "vue";
import { CATEGORIES, getCategoryConfig } from "../../constants/categories.js";

const props = defineProps({
  modelValue: {
    type: String,
    default: "all",
  },
  isDarkMode: {
    type: Boolean,
    default: false,
  },
  counts: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const filterOptions = computed(() => [
  { value: "all", label: "Todas", icon: "📋" },
  ...Object.values(CATEGORIES),
]);

const totalCount = computed(() => {
  return Object.values(props.counts).reduce((sum, count) => sum + count, 0);
});

const getCount = (value) => {
  if (value === "all") return totalCount.value;
  return props.counts[value] || 0;
};

const selectFilter = (value) => {
  emit("update:modelValue", value);
};

const getChipClasses = (option) => {
  const config = option.value !== "all" ? getCategoryConfig(option.value) : null;
  const isActive = props.modelValue === option.value;

  return [
    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer whitespace-nowrap shrink-0",
    "hover:scale-105 active:scale-95",
    isActive
      ? config
        ? [config.bgColor, config.textColor, config.borderColor, "ring-2 ring-offset-1 ring-purple-500"]
        : "bg-gray-100 text-gray-700 border-gray-200 ring-2 ring-offset-1 ring-purple-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:ring-purple-400"
      : config
        ? [config.bgColor, config.textColor, config.borderColor, "opacity-60 hover:opacity-100"]
        : "bg-gray-50 text-gray-500 border-gray-200 opacity-60 hover:opacity-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700",
  ];
};
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
    <button
      v-for="option in filterOptions"
      :key="option.value"
      @click="selectFilter(option.value)"
      :class="getChipClasses(option)"
      :aria-label="`Filter by ${option.label}`"
      :aria-pressed="modelValue === option.value"
      :style="{ fontVariantEmoji: 'text' }"
    >
      <span class="text-base">{{ option.icon }}</span>
      <span>{{ option.label }}</span>
      <span class="ml-1 px-1.5 py-0.5 rounded-full bg-black/10 text-xs dark:bg-white/20">
        {{ getCount(option.value) }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgb(209 213 219) transparent;
}

.dark .scrollbar-thin {
  scrollbar-color: rgb(55 65 81) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgb(209 213 219);
  border-radius: 4px;
}

.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgb(55 65 81);
}
</style>
