<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const options = [
  { value: 'all', label: 'Todas' },
  { value: 'today', label: 'Hoy' },
  { value: 'tomorrow', label: 'Mañana' },
  { value: 'week', label: 'Semana' }
];

const select = (val) => {
  emit('update:modelValue', val);
  emit('change', val);
};
</script>

<template>
  <div class="relative flex items-center border-b border-border/50">
    <div class="flex gap-8 px-2 overflow-x-auto no-scrollbar">
      <button
        v-for="opt in options"
        :key="opt.value"
        @click="select(opt.value)"
        class="relative py-3 px-1 text-[15px] font-medium transition-colors whitespace-nowrap"
        :class="modelValue === opt.value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'"
      >
        {{ opt.label }}
        <div
          v-if="modelValue === opt.value"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full"
        ></div>
      </button>
    </div>
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
