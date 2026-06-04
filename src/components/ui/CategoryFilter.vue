<script setup>
import { computed, ref } from "vue";
import { useCategories } from "../../composables/use-categories.js";
import CategoryManagerDialog from "./CategoryManagerDialog.vue";

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
const { categories } = useCategories();
const showManager = ref(false);

const totalCount = computed(() => {
  return Object.values(props.counts).reduce((sum, count) => sum + count, 0);
});

const handleTouchStart = (e) => {
  e.stopPropagation();
};
const handleTouchMove = (e) => {
  e.stopPropagation();
};
</script>

<template>
  <div
    class="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 scroll-smooth items-center"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
  >
    <button
      @click="$emit('update:modelValue', 'all')"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all cursor-pointer capitalize whitespace-nowrap shrink-0"
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
      :key="cat.id"
      @click="$emit('update:modelValue', cat.id)"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all cursor-pointer capitalize whitespace-nowrap shrink-0"
      :class="[
        modelValue === cat.id
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
      ]"
    >
      <span class="flex items-center justify-center w-3.5 h-3.5" v-html="cat.icon"></span>
      {{ cat.label }}
      <span class="ml-0.5 opacity-50">{{ counts[cat.id] || 0 }}</span>
    </button>

    <button
      @click="showManager = true"
      class="flex items-center justify-center w-8 h-8 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors shrink-0"
      aria-label="Editar categorías"
      title="Editar categorías"
    >
      <svg
        class="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 20h9" />
        <path
          d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        />
      </svg>
    </button>

    <CategoryManagerDialog :open="showManager" @close="showManager = false" />
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
