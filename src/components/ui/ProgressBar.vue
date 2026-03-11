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

const message = computed(() => {
  if (props.total === 0) return "Haciendo progreso...";
  if (props.total === props.completed) return "¡Buen trabajo!";
  return "Haciendo progreso...";
});
</script>

<template>
  <div class="mb-6">
    <div class="flex justify-between items-end mb-2">
      <h2 class="text-lg font-semibold text-gray-800">
        {{ message }}
      </h2>
      <span class="text-xs text-gray-400 font-medium">
        {{ completed }} / {{ total }}
      </span>
    </div>
    <div class="h-2 bg-gray-100 rounded-full overflow-hidden flex">
      <div
        class="h-full bg-green-400 transition-all duration-500 ease-out"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>
  </div>
</template>
