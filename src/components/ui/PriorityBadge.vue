<script setup>
import { computed } from "vue";
import { getPriorityConfig } from "../../constants/priorities.js";

const props = defineProps({
  level: {
    type: String,
    default: "medium",
    validator: (value) => ["low", "medium", "high", "urgent"].includes(value),
  },
  isDarkMode: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const config = computed(() => getPriorityConfig(props.level));

const badgeClasses = computed(() => [
  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border transition-colors",
  config.value.bgColor,
  config.value.textColor,
  config.value.borderColor,
  props.isDarkMode ? config.value.darkBgColor : "",
  props.isDarkMode ? config.value.darkTextColor : "",
  props.isDarkMode ? config.value.darkBorderColor : "",
]);
</script>

<template>
  <span
    :class="badgeClasses"
    :aria-label="`${config.label} priority`"
  >
    <span class="flex items-center justify-center w-3.5 h-3.5" v-html="config.icon"></span>
    <span v-if="!compact">{{ config.label }}</span>
  </span>
</template>
