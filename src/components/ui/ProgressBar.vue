<script setup>
import { computed } from "vue";

const props = defineProps({
  total: {
    type: Number,
    required: true,
  },
  completed: {
    type: Number,
    required: true,
  },
});

const progressPercent = computed(() => {
  if (props.total === 0) return 0;
  return (props.completed / props.total) * 100;
});
</script>

<template>
  <div class="mb-8 px-2">
    <div class="flex justify-between items-end mb-2">
      <span class="text-[14px] font-medium text-foreground capitalize">Progreso Diario</span>
      <span class="text-[13px] font-medium text-muted-foreground tabular-nums">
        {{ completed }} / {{ total }}
      </span>
    </div>
    <div class="h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        class="h-full bg-primary transition-all duration-700 ease-out"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>
  </div>
</template>
