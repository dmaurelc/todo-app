<script setup>
import { ref } from "vue";
import PriorityPicker from "./PriorityPicker.vue";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "Agregar nueva tarea...",
  },
  isDarkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["submit"]);

const newTodoTitle = ref("");
const selectedPriority = ref("medium");

const handleSubmit = () => {
  if (!newTodoTitle.value.trim()) return;
  emit("submit", { title: newTodoTitle.value, priority: selectedPriority.value });
  newTodoTitle.value = "";
  selectedPriority.value = "medium";
};
</script>

<template>
  <div class="space-y-3">
    <!-- Priority Picker -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Prioridad:</span>
      <PriorityPicker v-model="selectedPriority" :isDarkMode="isDarkMode" />
    </div>

    <!-- Input Form -->
    <form @submit.prevent="handleSubmit" class="relative group">
      <input
        v-model="newTodoTitle"
        type="text"
        :placeholder="placeholder"
        class="w-full bg-white border border-gray-200 text-gray-700 pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-gray-300"
        :disabled="loading"
      />
      <button
        type="submit"
        class="absolute right-2 top-2 bottom-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-3 flex items-center justify-center transition disabled:opacity-50 disabled:bg-gray-300"
        :disabled="loading || !newTodoTitle.trim()"
      >
        <span class="text-lg font-bold leading-none mb-0.5">+</span>
      </button>
    </form>
  </div>
</template>
