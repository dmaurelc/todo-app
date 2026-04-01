<script setup>
import { computed } from "vue";
import { CATEGORIES, DEFAULT_CATEGORY } from "../../constants/categories.js";

const props = defineProps({
  modelValue: {
    type: String,
    default: DEFAULT_CATEGORY,
  },
});

const emit = defineEmits(["update:modelValue"]);

const categories = computed(() => Object.values(CATEGORIES).map(cat => ({
  id: cat.value,
  label: cat.label,
  icon: cat.icon
})));

const selectCategory = (value) => {
  emit("update:modelValue", value);
};
</script>

<template>
  <div class="flex gap-2 overflow-x-auto no-scrollbar py-1">
    <button
      v-for="cat in categories"
      :key="cat.id"
      @click="selectCategory(cat.id)"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all cursor-pointer shrink-0 capitalize tracking-tight"
      :class="[
        modelValue === cat.id
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
      ]"
      :aria-label="`Select ${cat.label} category`"
      :aria-pressed="modelValue === cat.id"
    >
      <span class="flex items-center justify-center w-4 h-4" v-html="cat.icon"></span>
      <span>{{ cat.label }}</span>
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
