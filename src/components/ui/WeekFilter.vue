<script setup>
import { computed, onMounted, nextTick, ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const containerRef = ref(null);
const isInitialized = ref(false);

const weekDays = computed(() => {
  const result = [];
  const start = new Date();
  start.setDate(start.getDate() - 7); // 7 días atrás

  // Generar 30 días para scroll infinito (2 ciclos completos)
  for (let i = 0; i < 30; i++) {
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

// Scroll al día seleccionado
const scrollToSelectedDate = async (targetIso) => {
  await nextTick();
  if (!containerRef.value) return;

  const buttons = containerRef.value?.querySelectorAll('button');

  if (!buttons || buttons.length === 0) return;

  // Buscar el botón con la fecha seleccionada
  const targetButton = Array.from(buttons).find(btn => btn.getAttribute('data-iso') === targetIso);

  if (!targetButton) return;

  const buttonWidth = buttons[0].offsetWidth;
  const gap = window.innerWidth >= 640 ? 12 : 8;

  // Calcular índice del botón encontrado
  const buttonIndex = Array.from(buttons).indexOf(targetButton);
  const scrollPosition = (buttonWidth + gap) * buttonIndex;

  containerRef.value.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  });
};

// Scroll inicial al día de hoy (solo al montar)
onMounted(async () => {
  await nextTick();
  const todayIso = new Date().toISOString().split("T")[0];
  await scrollToSelectedDate(todayIso);
  isInitialized.value = true;
});

// Exponer función para scroll externo
defineExpose({
  scrollToSelectedDate
});
</script>

<template>
  <div ref="containerRef" class="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2 -mx-6 px-6 scroll-smooth">
    <button
      v-for="day in weekDays"
      :key="day.iso"
      :data-iso="day.iso"
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
