<script setup>
import { computed } from "vue";
import { CATEGORIES } from "../../constants/categories.js";

const props = defineProps({
  modelValue: {
    type: String,
    default: "all",
  },
  counts: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:modelValue"]);

const categories = computed(() => Object.values(CATEGORIES));

const totalCount = computed(() => {
  return Object.values(props.counts).reduce((sum, count) => sum + count, 0);
});

// Prevenir propagación de touch events para no interferir con swipe de días
const handleTouchStart = (e) => {
  e.stopPropagation();
};

const handleTouchMove = (e) => {
  e.stopPropagation();
};
</script>

<template>
  <div
    class="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 scroll-smooth"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
  >
    <button
      @click="$emit('update:modelValue', 'all')"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all cursor-pointer capitalize whitespace-nowrap"
      :class="[
        modelValue === 'all'
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
      ]"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
        <path d="M4 6h16M4 12h16M4 18h7" stroke-linecap="round" />
      </svg>
      Todas
      <span class="ml-0.5 opacity-50">{{ totalCount }}</span>
    </button>

    <button
      v-for="cat in categories"
      :key="cat.value"
      @click="$emit('update:modelValue', cat.value)"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all cursor-pointer capitalize whitespace-nowrap shrink-0"
      :class="[
        modelValue === cat.value
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
      ]"
    >
      <span class="flex items-center justify-center w-3.5 h-3.5" v-html="cat.icon"></span>
      {{ cat.label }}
      <span class="ml-0.5 opacity-50">{{ counts[cat.value] || 0 }}</span>
    </button>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
