<script setup>
import { computed } from "vue";
import { getCategoryConfig } from "../../constants/categories.js";

const props = defineProps({
  category: {
    type: String,
    default: "otros",
    validator: (value) => ["trabajo", "personal", "salud", "ideas", "otros"].includes(value),
  },
  isDarkMode: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: "sm",
    validator: (value) => ["sm", "md"].includes(value),
  },
});

const config = computed(() => getCategoryConfig(props.category));

const badgeClasses = computed(() => [
  "inline-flex items-center gap-1.5 rounded border transition-colors",
  props.size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1",
  props.size === "sm" ? "text-xs font-medium" : "text-sm font-medium",
  config.value.bgColor,
  config.value.textColor,
  config.value.borderColor,
  props.isDarkMode ? config.value.darkBgColor : "",
  props.isDarkMode ? config.value.darkTextColor : "",
  props.isDarkMode ? config.value.darkBorderColor : "",
]);

const iconSize = computed(() => props.size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4");
</script>

<template>
  <span
    :class="badgeClasses"
    :aria-label="`${config.label} category`"
  >
    <span :class="['flex items-center justify-center', iconSize]" v-html="config.icon"></span>
    <span v-if="size === 'md'">{{ config.label }}</span>
  </span>
</template>
