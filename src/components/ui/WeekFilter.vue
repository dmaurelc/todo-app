<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const weekDays = computed(() => {
  const result = [];
  const start = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dayName =
      d
        .toLocaleDateString("es-ES", { weekday: "short" })
        .replace(".", "")
        .charAt(0)
        .toUpperCase() +
      d
        .toLocaleDateString("es-ES", { weekday: "short" })
        .replace(".", "")
        .slice(1);
    const dayNumber = d.getDate();
    const isoDate = d.toISOString().split("T")[0];

    result.push({
      name: dayName.slice(0, 3),
      number: dayNumber,
      iso: isoDate,
    });
  }
  return result;
});

const selectDate = (iso) => {
  emit("update:modelValue", iso);
  emit("change", iso);
};
</script>

<template>
  <div class="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2 -mx-6 px-6">
    <button
      v-for="day in weekDays"
      :key="day.iso"
      @click="selectDate(day.iso)"
      class="flex flex-col items-center justify-center min-w-[50px] sm:min-w-16 h-[56px] sm:h-18 rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-95"
      :class="[
        modelValue === day.iso
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary',
      ]"
    >
      <span
        class="text-[11px] sm:text-[13px] font-medium opacity-60 mb-0.5 sm:mb-1"
        >{{ day.name }}</span
      >
      <span class="text-[16px] sm:text-[18px] font-medium tracking-tight">{{
        day.number
      }}</span>
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
