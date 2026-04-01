<script setup>
import { ref, computed, watch } from "vue";
import { DEFAULT_CATEGORY } from "../../constants/categories.js";
import CategoryPicker from "./CategoryPicker.vue";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  isDarkMode: {
    type: Boolean,
    required: true,
  },
  initialDate: {
    type: String,
    default: "",
  },
  editingTodo: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["submit", "close", "delete"]);

const today = new Date().toISOString().split("T")[0];
const title = ref("");
const selectedCategory = ref(DEFAULT_CATEGORY);
const dueDate = ref(today);
const selectedPriority = ref(0); // 0 (none), 1, 2, 3

// Sync with initial date if provided
watch(
  () => props.initialDate,
  (val) => {
    if (val) dueDate.value = val;
  },
  { immediate: true },
);

// Sync with editingTodo when in edit mode
watch(
  () => props.editingTodo,
  (todo) => {
    if (todo) {
      title.value = todo.title;
      selectedCategory.value = todo.category;
      dueDate.value = todo.due_date;
      selectedPriority.value = todo.priority;
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  if (!title.value.trim()) return;
  emit("submit", {
    title: title.value,
    category: selectedCategory.value,
    dueDate: dueDate.value,
    priority: selectedPriority.value,
  });
  title.value = "";
  selectedPriority.value = 0;
};

const isEditMode = computed(() => !!props.editingTodo);

const formTitle = computed(() =>
  isEditMode.value ? "Editar tarea" : "Nueva tarea",
);

const buttonText = computed(() => (isEditMode.value ? "Guardar" : "Agregar"));
</script>

<template>
  <div
    class="bg-card text-card-foreground rounded-t-3xl p-6 shadow-2xl border border-border animate-slide-up relative overflow-hidden ring-1 ring-black/5"
  >
    <!-- Close Button -->
    <button
      @click="$emit('close')"
      class="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground transition-all active:scale-90"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <div class="space-y-6">
      <div class="pt-2">
        <h2 class="text-sm font-medium text-muted-foreground mb-3">
          {{ formTitle }}
        </h2>
        <input
          v-model="title"
          type="text"
          placeholder="¿Qué necesitas hacer?"
          class="w-full bg-transparent border-none text-[20px] sm:text-[24px] font-medium focus:ring-0 placeholder:text-muted-foreground/20 outline-none pr-8"
          autofocus
          @keyup.enter="handleSubmit"
        />
      </div>

      <!-- Categories Component -->
      <div class="grid gap-2">
        <span class="text-sm font-medium text-muted-foreground">Categoría</span>
        <CategoryPicker v-model="selectedCategory" :isDarkMode="isDarkMode" />
      </div>

      <!-- Date Selection -->
      <div class="grid gap-2">
        <span class="text-sm font-medium text-muted-foreground"
          >Selecciona una fecha</span
        >
        <div class="relative group">
          <input
            v-model="dueDate"
            type="date"
            :min="today"
            class="w-full bg-secondary text-foreground text-[15px] font-medium px-4 py-3 rounded-2xl border border-border/50 outline-none focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
          />
          <div
            class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Priority Selection -->
      <div class="grid gap-2">
        <span class="text-sm font-medium text-muted-foreground">Prioridad</span>
        <div class="flex gap-2">
          <button
            v-for="p in [1, 2, 3]"
            :key="p"
            @click="selectedPriority = selectedPriority === p ? 0 : p"
            class="px-1 py-0.5 rounded border transition-all duration-300 flex items-center justify-center -space-x-1.5"
            :class="[
              selectedPriority === p
                ? 'bg-primary border-primary text-yellow-500 shadow-md'
                : 'bg-secondary/50 border-border/50 text-muted-foreground hover:bg-secondary',
            ]"
          >
            <svg
              v-for="i in p"
              :key="i"
              class="w-5 h-5"
              :class="
                selectedPriority === p
                  ? 'fill-yellow-500'
                  : 'fill-muted-foreground/30'
              "
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="m9.154 20.885l1-6.885h-4.25l7.48-10.788h.462L12.866 11h5l-8.25 9.885z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 pt-4">
        <!-- Delete button (only in edit mode, on left in mobile) -->
        <button
          v-if="isEditMode"
          @click="$emit('delete')"
          class="flex items-center gap-2 text-destructive hover:text-destructive/80 text-sm font-medium transition-all px-4 py-3.5 rounded-2xl hover:bg-destructive/10 order-1"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span class="hidden sm:inline">Eliminar</span>
        </button>

        <button
          @click="handleSubmit"
          :disabled="loading || !title.trim()"
          class="bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl font-medium text-[15px] transition-all active:scale-[0.98] disabled:opacity-30 flex items-center gap-2 shadow-lg shadow-primary/20 flex-1 sm:flex-none justify-center order-2 sm:order-1"
        >
          <svg
            v-if="loading"
            class="animate-spin h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span v-else>{{ buttonText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Hide native browser date picker icon */
input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: auto;
  height: auto;
  color: transparent;
  background: transparent;
  cursor: pointer;
}

/* Safari fix */
input[type="date"] {
  min-height: 48px;
}
</style>
