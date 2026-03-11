<script setup>
import { computed } from "vue";
import { CATEGORIES, DEFAULT_CATEGORY } from "../../constants/categories.js";

const props = defineProps({
  modelValue: {
    type: String,
    default: DEFAULT_CATEGORY,
  },
  isDarkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const options = computed(() => Object.values(CATEGORIES));

const selectCategory = (value) => {
  emit("update:modelValue", value);
};

const getChipClasses = (option) => [
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer shrink-0",
  "hover:scale-105 active:scale-95",
  option.bgColor,
  option.textColor,
  option.borderColor,
  props.isDarkMode ? option.darkBgColor : "",
  props.isDarkMode ? option.darkTextColor : "",
  props.isDarkMode ? option.darkBorderColor : "",
  props.modelValue === option.value
    ? "ring-2 ring-offset-1 ring-purple-500"
    : "opacity-70 hover:opacity-100",
  props.isDarkMode && props.modelValue === option.value
    ? "dark:ring-purple-400"
    : "",
];
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
    <button
      v-for="option in options"
      :key="option.value"
      @click="selectCategory(option.value)"
      :class="getChipClasses(option)"
      :aria-label="`Select ${option.label} category`"
      :aria-pressed="modelValue === option.value"
      :style="{ fontVariantEmoji: 'text' }"
    >
      <span class="text-base">{{ option.icon }}</span>
      <span>{{ option.label }}</span>
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
