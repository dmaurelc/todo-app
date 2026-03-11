<script setup>
import { computed } from "vue";
import { PRIORITIES, DEFAULT_PRIORITY } from "../../constants/priorities.js";

const props = defineProps({
  modelValue: {
    type: String,
    default: DEFAULT_PRIORITY,
  },
  isDarkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const options = computed(() => Object.values(PRIORITIES));

const selectPriority = (value) => {
  emit("update:modelValue", value);
};

const getChipClasses = (option) => [
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer",
  "hover:scale-105 active:scale-95",
  option.bgColor,
  option.textColor,
  option.borderColor,
  props.isDarkMode ? option.darkBgColor : "",
  props.isDarkMode ? option.darkTextColor : "",
  props.isDarkMode ? option.darkBorderColor : "",
  props.modelValue === option.value
    ? "ring-2 ring-offset-1 ring-blue-500"
    : "opacity-70 hover:opacity-100",
  props.isDarkMode && props.modelValue === option.value
    ? "dark:ring-blue-400"
    : "",
];
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="option.value"
      @click="selectPriority(option.value)"
      :class="getChipClasses(option)"
      :aria-label="`Select ${option.label} priority`"
      :aria-pressed="modelValue === option.value"
      :style="{ fontVariantEmoji: 'text' }"
    >
      <span class="text-base">{{ option.icon }}</span>
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>
