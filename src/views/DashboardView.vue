<script setup>
import { ref, watch } from "vue";
import confetti from "canvas-confetti";
import { useTodos } from "../composables/useTodos";
import { useAuth } from "../composables/useAuth";
import { useMetaTags } from "../composables/useMetaTags.js";
import { useEmojiOverlay } from "../composables/use-emoji-overlay.js";

// Components
import ProgressBar from "../components/ui/ProgressBar.vue";
import AddTodoForm from "../components/ui/AddTodoForm.vue";
import TodoList from "../components/todo/TodoList.vue";
import PriorityFilter from "../components/ui/PriorityFilter.vue";

// Assets
import thunderSound from "../assets/thunder.mp3";
import evilRoarSound from "../assets/evil-roar.mp3";

const { user, isDarkMode, toggleDarkMode } = useAuth();
const {
  todos,
  filteredTodos,
  priorityFilter,
  priorityCounts,
  loading,
  fetchTodos,
  addTodo,
  toggleTodo: originalToggleTodo,
  removeTodo,
  updatePositions,
} = useTodos();

// Composables
const { updateMeta } = useMetaTags(isDarkMode);
const { showSadEmoji, showWarningEmoji, triggerSad, triggerWarning } =
  useEmojiOverlay();

// State
const expandedTodos = ref(new Set());

// Watch dark mode for audio + meta
watch(isDarkMode, (val) => {
  updateMeta();
  if (val) {
    const audio = new Audio(thunderSound);
    audio.volume = 0.6;
    audio.play().catch((e) => console.log("Audio play failed", e));
  }
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

// Watch for all completed - confetti celebration
watch(
  todos,
  (newTodos) => {
    if (newTodos.length > 0 && newTodos.every((t) => t.is_complete)) {
      if (isDarkMode.value) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ["#ef4444", "#7f1d1d", "#000000", "#450a0a"],
          disableForReducedMotion: true,
        });
        const audio = new Audio(evilRoarSound);
        audio.volume = 0.5;
        audio.play().catch((e) => console.log("Roar play failed", e));
      } else {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  },
  { deep: true },
);

// Toggle todo with subtask validation
const handleToggleTodo = async (todo) => {
  if (
    !todo.is_complete &&
    todo.subtasks &&
    todo.subtasks.some((s) => !s.is_complete)
  ) {
    triggerWarning();
    if (!expandedTodos.value.has(todo.id)) {
      expandedTodos.value.add(todo.id);
    }
    return;
  }

  const wasComplete = todo.is_complete;
  await originalToggleTodo(todo);

  if (wasComplete && !todo.is_complete) {
    triggerSad();
  }
};

// Add todo
const handleAddTodo = async ({ title, priority }) => {
  if (!title.trim()) return;
  try {
    await addTodo(title, priority);
  } catch (e) {
    // Error is already toasted in useTodos
  }
};

// Lifecycle
fetchTodos();
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-1000"
    :class="isDarkMode ? 'vecna-theme' : 'bg-gray-100'"
  >
    <!-- Ash/Particles Overlay (Adaptive) -->
    <div
      class="absolute inset-0 pointer-events-none z-0"
      :class="isDarkMode ? 'ash-overlay' : 'ash-overlay-normal'"
    ></div>

    <!-- Sad Emoji Overlay -->
    <div
      v-if="showSadEmoji"
      class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-sad-zoom-fade"
    >
      <div class="text-[150px] filter drop-shadow-2xl">
        {{ isDarkMode ? "👹" : "😢" }}
      </div>
    </div>

    <!-- Warning Emoji Overlay -->
    <div
      v-if="showWarningEmoji"
      class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-sad-zoom-fade"
    >
      <div class="text-[150px] filter drop-shadow-2xl">
        {{ isDarkMode ? "💀" : "🚨" }}
      </div>
    </div>

    <div
      class="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden relative z-10"
    >
      <!-- Header Area -->
      <div class="p-8 pb-4 bg-linear-to-b from-green-50 to-white">
        <div class="flex justify-between items-start mb-6">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-gray-800">
                {{ isDarkMode ? "LISTA MALDITA" : "Todo List" }}
              </h1>
            </div>

            <p class="text-gray-400 text-xs mt-1 italic">
              Tus datos se guardan localmente.
            </p>
          </div>
          <button
            @click="toggleDarkMode"
            class="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            {{ isDarkMode ? "Modo Claro" : "Modo Oscuro" }}
          </button>
        </div>

        <!-- Progress Bar Component -->
        <ProgressBar
          :total="todos.length"
          :completed="todos.filter((t) => t.is_complete).length"
        />

        <!-- Add Todo Form Component -->
        <AddTodoForm
          :loading="loading"
          :isDarkMode="isDarkMode"
          @submit="handleAddTodo"
        />
      </div>

      <!-- Task List Area -->
      <div class="bg-white">
        <!-- Priority Filter -->
        <div
          v-if="todos.length > 0"
          class="px-4 pt-4 pb-2 border-b border-gray-50"
        >
          <PriorityFilter
            v-model="priorityFilter"
            :isDarkMode="isDarkMode"
            :counts="priorityCounts"
          />
        </div>

        <!-- Loading -->
        <div
          v-if="loading && todos.length === 0"
          class="p-8 text-center text-gray-400"
        >
          Cargando...
        </div>

        <!-- Empty -->
        <div
          v-else-if="todos.length === 0"
          class="p-12 text-center flex flex-col items-center justify-center"
        >
          <div class="text-6xl mb-6">
            {{ isDarkMode ? "👹" : "📝" }}
          </div>
          <p class="text-gray-500 text-lg font-medium">
            {{ isDarkMode ? "El Upside Down espera..." : "No hay tareas aún." }}
          </p>
          <p class="text-gray-400 text-sm mt-2">
            Empieza agregando una arriba.
          </p>
        </div>

        <!-- Todo List Component -->
        <TodoList
          v-else
          :todos="filteredTodos"
          :expandedTodos="expandedTodos"
          :isDarkMode="isDarkMode"
          @dragChange="onDragChange"
          @toggleTodo="handleToggleTodo"
          @expandTodo="toggleExpand"
          @removeTodo="removeTodo"
        />
      </div>

      <!-- Footer -->
      <div class="p-6 pt-2 bg-white">
        <div class="border-t border-gray-50 pt-4 text-center">
          <p
            class="text-[10px] text-gray-300 uppercase tracking-widest font-bold"
          >
            Simple ToDo App
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
