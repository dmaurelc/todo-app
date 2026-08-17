<script setup>
import { ref, watch, onMounted, computed, onUnmounted, nextTick } from "vue";
import confetti from "canvas-confetti";
import { useTodos } from "../composables/useTodos";
import { useAuth } from "../composables/useAuth";
import { useMetaTags } from "../composables/useMetaTags.js";
import { useEmojiOverlay } from "../composables/use-emoji-overlay.js";
import { useNotifications } from "../composables/use-notifications.js";
import { useHaptics } from "../composables/use-haptics.js";
import { useDeepLink } from "../composables/use-deep-link.js";

// Components
import ProgressBar from "../components/ui/ProgressBar.vue";
import AddTodoForm from "../components/ui/AddTodoForm.vue";
import TodoList from "../components/todo/TodoList.vue";
import CategoryFilter from "../components/ui/CategoryFilter.vue";
import WeekFilter from "../components/ui/WeekFilter.vue";
import SettingsDialog from "../components/ui/SettingsDialog.vue";
import CategoryManagerDialog from "../components/ui/CategoryManagerDialog.vue";

// Assets
const { user, isDarkMode, toggleDarkMode } = useAuth();
const {
  todos,
  filteredTodos,
  categoryFilter,
  dateFilter,
  timeRange,
  categoryCounts,
  dayProgress,
  loading,
  fetchTodos,
  addTodo,
  toggleTodo: originalToggleTodo,
  removeTodo,
  updateTodo,
  updatePositions,
} = useTodos();

// Composables
const { updateMeta } = useMetaTags(isDarkMode);
const { showSadEmoji, showWarningEmoji, triggerSad, triggerWarning } =
  useEmojiOverlay();
const { notify } = useNotifications();
const haptics = useHaptics();

// Deep-link: focus a todo by id when launched via `todoapp://task/<uuid>`.
useDeepLink(({ id }) => {
  expandedTodos.value.add(id);
  expandedTodos.value = new Set(expandedTodos.value);
});

// State
const expandedTodos = ref(new Set());
const showAddSheet = ref(false);
const showSettingsDialog = ref(false);
const showCategoriesDialog = ref(false);
const editingTodo = ref(null);
const mainContentRef = ref(null);
const weekFilterRef = ref(null);

// Swipe gesture handling for mobile date navigation
let touchStartX = 0;
let touchStartY = 0;
const SWIPE_THRESHOLD = 50;

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  // Solo procesar swipes horizontales (evitar conflictos con scroll vertical)
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
    // Swipe izquierdo = día siguiente
    if (deltaX < 0) {
      navigateDate(1);
    }
    // Swipe derecho = día anterior
    else {
      navigateDate(-1);
    }
  }
};

const navigateDate = (direction) => {
  const currentDate = new Date(dateFilter.value + "T00:00:00");
  currentDate.setDate(currentDate.getDate() + direction);
  const newDate = currentDate.toISOString().split("T")[0];
  dateFilter.value = newDate;
  timeRange.value = "custom";

  // Scroll a la nueva fecha en el WeekFilter
  nextTick(() => {
    weekFilterRef.value?.scrollToSelectedDate(newDate);
  });
};

onMounted(() => {
  const mainEl = mainContentRef.value;
  if (mainEl) {
    mainEl.addEventListener("touchstart", handleTouchStart, { passive: true });
    mainEl.addEventListener("touchend", handleTouchEnd, { passive: true });
  }
});

onUnmounted(() => {
  const mainEl = mainContentRef.value;
  if (mainEl) {
    mainEl.removeEventListener("touchstart", handleTouchStart);
    mainEl.removeEventListener("touchend", handleTouchEnd);
  }
});

// Watch dark mode for meta updates
watch(isDarkMode, (val) => {
  updateMeta();
});

// Expansion management
const toggleExpand = (todoId) => {
  if (expandedTodos.value.has(todoId)) {
    expandedTodos.value.delete(todoId);
  } else {
    expandedTodos.value.add(todoId);
  }
};

// Draggable handling
const onDragChange = (newTodos) => {
  updatePositions(newTodos);
};

// Toggle todo with subtask validation
const handleToggleTodo = async (todo) => {
  const wasComplete = todo.is_complete;
  await originalToggleTodo(todo);
  haptics.lightTap();

  if (wasComplete && !todo.is_complete) {
    triggerSad();
  }

  // Notify when last incomplete task of the day gets done.
  if (!wasComplete && todo.is_complete) {
    const remaining = todos.value.filter(
      (t) =>
        !t.is_complete &&
        (t.due_date || t.created_at?.split("T")[0]) === dateFilter.value
    ).length;
    if (remaining === 0) {
      haptics.success();
      notify("🎉 Día limpio", "Todas las tareas del día completadas.");
    }
  }
};

// Add todo
const handleAddTodo = async ({ title, category, dueDate, priority }) => {
  if (!title.trim()) return;
  try {
    await addTodo(title, category, dueDate, priority);
    showAddSheet.value = false;
  } catch (e) {
    // Error is already toasted in useTodos
  }
};

// Edit todo
const handleEditTodo = (todo) => {
  editingTodo.value = todo;
  showAddSheet.value = true;
};

// Update todo
const handleUpdateTodo = async ({ title, category, dueDate, priority }) => {
  if (!title.trim() || !editingTodo.value) return;
  try {
    await updateTodo(editingTodo.value.id, {
      title,
      category,
      due_date: dueDate,
      priority,
    });
    editingTodo.value = null;
    showAddSheet.value = false;
  } catch (e) {
    // Error is already toasted in useTodos
  }
};

// Unified submit handler
const handleSubmit = (data) => {
  if (editingTodo.value) {
    handleUpdateTodo(data);
  } else {
    handleAddTodo(data);
  }
};

// Close handler that clears editing state
const handleClose = () => {
  editingTodo.value = null;
  showAddSheet.value = false;
};

// Delete todo from edit modal
const handleDeleteTodo = () => {
  if (editingTodo.value) {
    removeTodo(editingTodo.value.id);
    editingTodo.value = null;
    showAddSheet.value = false;
  }
};

// Handle time range changes
const onTimeRangeChange = (val) => {
  if (val !== "custom") {
    // Optionally reset dateFilter or keep it
  }
};

const onDateChange = (val) => {
  timeRange.value = "custom";
};

// Computed for header texts
const headerTitle = computed(() => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  if (dateFilter.value === today) return "Hoy";
  if (dateFilter.value === tomorrow) return "Mañana";

  // Return day name for other dates
  return new Date(dateFilter.value + "T00:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
  });
});

const headerSubDate = computed(() => {
  return new Date(dateFilter.value + "T00:00:00").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
  });
});

// Lifecycle
fetchTodos();
</script>

<template>
  <div
    class="min-h-dvh flex flex-col items-center bg-background transition-colors duration-500"
  >
    <!-- Header -->
    <header
      class="sticky top-0 w-full z-40 bg-background/80 backdrop-blur-xl saturate-150 border-b border-border/50"
    >
      <div class="max-w-xl mx-auto px-6 pt-6 pb-2 border-x border-border/50">
        <div class="flex justify-between items-start mb-6">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h1
                class="text-[34px] font-medium tracking-tight text-foreground leading-none capitalize"
              >
                {{ headerTitle }}
              </h1>
              <div
                class="bg-primary/5 text-primary text-[13px] font-medium px-2 py-0.5 rounded-md mt-1"
              >
                {{ filteredTodos.length }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="text-[14px] font-medium text-muted-foreground capitalize"
                >{{ headerSubDate }}</span
              >
            </div>
          </div>
          <!-- Header action icons: bare buttons, no wrapper cards.
               Tap target kept at 40px via padding; only the icon paints. -->
          <div class="flex items-center gap-1">
            <button
              @click="toggleDarkMode"
              class="p-2.5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-[0.92]"
              :aria-label="isDarkMode ? 'Modo claro' : 'Modo oscuro'"
            >
              <svg
                v-if="isDarkMode"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <button
              @click="showSettingsDialog = true"
              class="p-2.5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-[0.92]"
              aria-label="Ajustes"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Week Calendar Filter -->
        <WeekFilter ref="weekFilterRef" v-model="dateFilter" @change="onDateChange" class="mt-2" />
      </div>
    </header>

    <!-- Main Content -->
    <main
      ref="mainContentRef"
      class="w-full h-full max-w-xl mx-auto px-6 mt-0 py-6 border-x border-border/50 flex-1 min-h-0"
    >
      <!-- Dashboard Stats Area -->
      <div v-if="dayProgress.total > 0" class="w-full">
        <ProgressBar
          :total="dayProgress.total"
          :completed="dayProgress.completed"
        />
      </div>

      <!-- Categories Filter Row -->
      <div v-if="todos.length > 0" class="mb-8">
        <div class="flex items-center justify-between mb-4 px-1">
          <h2 class="text-sm font-medium text-muted-foreground">Categorías</h2>
          <span class="text-[11px] font-medium text-muted-foreground"
            >{{ filteredTodos.length }} resultados</span
          >
        </div>
        <CategoryFilter
          v-model="categoryFilter"
          :isDarkMode="isDarkMode"
          :counts="categoryCounts"
        />
      </div>

      <!-- Content Card -->
      <div class="text-card-foreground rounded-lg overflow-hidden">
        <!-- Task List Area -->
        <div class="relative min-h-115">
          <TodoList
            v-if="filteredTodos.length > 0"
            :todos="filteredTodos"
            :expandedTodos="expandedTodos"
            :isDarkMode="isDarkMode"
            @dragChange="onDragChange"
            @toggleTodo="handleToggleTodo"
            @expandTodo="toggleExpand"
            @removeTodo="removeTodo"
            @editTodo="handleEditTodo"
          />

          <!-- Empty State -->
          <div
            v-else
            class="absolute inset-0 flex flex-col items-center justify-center text-center p-12 transition-all duration-500 animate-in fade-in"
          >
            <div
              class="w-24 h-24 mb-8 rounded-2xl flex items-center justify-center text-primary/40"
            >
              <svg
                class="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h3
              class="text-[20px] font-medium tracking-tight text-foreground mb-2"
            >
              {{ loading ? "Cargando..." : "To-do al día" }}
            </h3>
            <p class="text-muted-foreground text-[14px] font-medium max-w-55">
              {{
                loading
                  ? "Preparando tus tareas..."
                  : "No hay tareas pendientes en esta selección."
              }}
            </p>
          </div>

          <!-- Loading Spinner overlay if needed -->
          <div
            v-if="loading && todos.length === 0"
            class="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div
              class="w-10 h-10 border-[3px] border-muted border-t-primary rounded-full animate-spin"
            ></div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Action Bar -->
    <div
      class="fixed bottom-0 left-0 right-0 p-4 z-50 flex flex-col items-center"
    >
      <div class="w-full max-w-xl md:px-6 px-0">
        <!-- Floating Create Sheet WITH BACKDROP -->
        <transition name="fade">
          <div
            v-if="showAddSheet"
            class="fixed inset-0 z-60 flex items-end justify-center"
          >
            <div
              class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              @click="handleClose"
            ></div>
            <div class="w-full max-w-xl relative">
              <AddTodoForm
                :loading="loading"
                :isDarkMode="isDarkMode"
                :initialDate="dateFilter"
                :editingTodo="editingTodo"
                @submit="handleSubmit"
                @close="handleClose"
                @delete="handleDeleteTodo"
              />
            </div>
          </div>
        </transition>

        <!-- Main Action Button -->
        <button
          v-if="!showAddSheet"
          @click="showAddSheet = true"
          class="w-full flex justify-between items-center bg-primary text-primary-foreground py-4 px-6 rounded-2xl shadow-xl transition-all duration-300 active:scale-[0.98] group"
        >
          <div class="flex items-center gap-4 font-medium text-[17px]">
            <div
              class="w-7 h-7 rounded-full bg-primary-foreground text-primary flex items-center justify-center transition-transform group-hover:scale-110"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="3.5"
              >
                <path d="M12 6v12m-6-6h12" stroke-linecap="round" />
              </svg>
            </div>
            Nueva tarea
          </div>

          <div class="flex items-center gap-4 text-primary-foreground/60">
            <span class="text-[13px] font-medium tracking-tight capitalize"
              >{{ filteredTodos.length }} tareas</span
            >
          </div>
        </button>
      </div>
    </div>

    <SettingsDialog
      :open="showSettingsDialog"
      @close="showSettingsDialog = false"
      @open-categories="showCategoriesDialog = true"
    />
    <CategoryManagerDialog
      :open="showCategoriesDialog"
      @close="showCategoriesDialog = false"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
