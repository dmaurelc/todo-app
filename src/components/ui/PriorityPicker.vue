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
  "flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium border transition-all cursor-pointer",
  "hover:-translate-y-0.5 active:translate-y-0 duration-200",
  props.modelValue === option.value
    ? [option.bgColor, option.textColor, option.darkBgColor, option.darkTextColor, "border-gray-400 shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:border-gray-600 dark:shadow-[0_2px_4px_rgba(0,0,0,0.2)]"]
    : [option.bgColor, option.textColor, option.darkBgColor, option.darkTextColor, "border-transparent opacity-70 hover:opacity-100"]
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
    >
      <span class="flex items-center justify-center w-4 h-4" v-html="option.icon"></span>
      <span>{{ option.label }}</span>
    </button>
  </div>
</template>
