<script setup>
import { computed } from "vue";
import { useCategories } from "../../composables/use-categories.js";

const props = defineProps({
  category: {
    type: String,
    default: "otros",
  },
  size: {
    type: String,
    default: "sm",
    validator: (value) => ["sm", "md"].includes(value),
  },
});

const { categoriesMap } = useCategories();

// Fall back to a generic placeholder if the category was deleted
// after the badge was rendered (defensive — should be rare).
const config = computed(() => {
  const cat = categoriesMap.value[props.category];
  if (cat) return cat;
  return {
    id: props.category,
    label: props.category,
    icon: "",
  };
});

const badgeClasses = computed(() => [
  "inline-flex items-center gap-1.5 rounded-md border border-transparent bg-gray-100 dark:bg-white/10 transition-colors",
  props.size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1",
  props.size === "sm" ? "text-xs font-medium" : "text-sm font-medium",
]);

const iconSize = computed(() =>
  props.size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
);
</script>

<template>
  <span :class="badgeClasses" :aria-label="`${config.label} category`">
    <span
      v-if="config.icon"
      :class="['flex items-center justify-center text-black dark:text-white', iconSize]"
      v-html="config.icon"
    ></span>
    <span v-if="size === 'md'">{{ config.label }}</span>
  </span>
</template>
