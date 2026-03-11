<script setup>
import { computed } from "vue";
import { PRIORITIES } from "../../constants/priorities.js";

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

const priorities = computed(() => Object.values(PRIORITIES));

const totalCount = computed(() => {
  return Object.values(props.counts).reduce((sum, count) => sum + count, 0);
});
</script>

<template>
  <div class="flex gap-2 overflow-x-auto no-scrollbar">
    <button
      @click="$emit('update:modelValue', 'all')"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all cursor-pointer capitalize whitespace-nowrap"
      :class="[
        modelValue === 'all'
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
      ]"
    >
      Todas
      <span class="ml-0.5 opacity-50">{{ totalCount }}</span>
    </button>

    <button
      v-for="prio in priorities"
      :key="prio.value"
      @click="$emit('update:modelValue', prio.value)"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all cursor-pointer capitalize whitespace-nowrap shrink-0"
      :class="[
        modelValue === prio.value
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
      ]"
    >
      {{ prio.label }}
      <span class="ml-0.5 opacity-50">{{ counts[prio.value] || 0 }}</span>
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
