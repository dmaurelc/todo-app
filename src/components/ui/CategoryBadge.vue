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
  "inline-flex items-center gap-1 rounded-full border transition-colors",
  props.size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1",
  props.size === "sm" ? "text-sm" : "text-base",
  config.value.bgColor,
  config.value.textColor,
  config.value.borderColor,
  props.isDarkMode ? config.value.darkBgColor : "",
  props.isDarkMode ? config.value.darkTextColor : "",
  props.isDarkMode ? config.value.darkBorderColor : "",
]);

const iconSize = computed(() => props.size === "sm" ? "text-base" : "text-lg");
</script>

<template>
  <span
    :class="badgeClasses"
    :style="{ fontVariantEmoji: 'text' }"
    :aria-label="`${config.label} category`"
  >
    <span :class="iconSize">{{ config.icon }}</span>
    <span v-if="size === 'md'">{{ config.label }}</span>
  </span>
</template>
