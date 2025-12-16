<script setup>
import { onMounted, ref, watch, h } from "vue";
import { useRouter } from "vue-router";
import confetti from "canvas-confetti";
import draggable from "vuedraggable";
import { supabase } from "../lib/supabase";
import { useTodos } from "../composables/useTodos";
import { useAuth } from "../composables/useAuth";
import { toast } from "vue3-toastify";

const router = useRouter();
const { user, isGuest, getSession, logout } = useAuth();
const {
  todos,
  loading,
  fetchTodos,
  addTodo,
  toggleTodo: originalToggleTodo,
  removeTodo,
  updatePositions,
  addSubtask,
  toggleSubtask,
  removeSubtask,
} = useTodos();

const newTodoTitle = ref("");
const showSadEmoji = ref(false);
const showWarningEmoji = ref(false);
const expandedTodos = ref(new Set()); // Track IDs of expanded tasks for subtasks

const onDragChange = (event) => {
  if (event.moved) {
    updatePositions(todos.value);
  }
};

const toggleExpand = (todoId) => {
  if (expandedTodos.value.has(todoId)) {
    expandedTodos.value.delete(todoId);
  } else {
    expandedTodos.value.add(todoId);
  }
};

const handleAddSubtask = async (todoId, event) => {
  const input = event.target;
  const title = input.value.trim();
  if (!title) return;

  await addSubtask(todoId, title);
  input.value = "";
};

// Watch for all completed
watch(
  todos,
  (newTodos) => {
    if (newTodos.length > 0 && newTodos.every((t) => t.is_complete)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  },
  { deep: true }
);

const handleToggleTodo = async (todo) => {
  // Check for pending subtasks before completing
  if (
    !todo.is_complete &&
    todo.subtasks &&
    todo.subtasks.some((s) => !s.is_complete)
  ) {
    // Show Alert Animation
    triggerWarningEmoji();

    // User requested to remove toast as the animation is enough feedback.
    // toast.warning("Completa las subtareas pendientes", {
    //   transition: toast.TRANSITIONS.ZOOM,
    // });

    // Expand to show the user which ones are missing
    if (!expandedTodos.value.has(todo.id)) {
      expandedTodos.value.add(todo.id);
    }
    return;
  }

  const wasComplete = todo.is_complete;
  await originalToggleTodo(todo);

  if (wasComplete && !todo.is_complete) {
    triggerSadEmoji();
  }
};

const triggerSadEmoji = () => {
  showSadEmoji.value = true;
  setTimeout(() => {
    showSadEmoji.value = false;
  }, 2000);
};

const triggerWarningEmoji = () => {
  showWarningEmoji.value = true;
  setTimeout(() => {
    showWarningEmoji.value = false;
  }, 2000);
};

onMounted(async () => {
  await getSession();
  if (!user.value) {
    router.push("/auth");
    return;
  }
  fetchTodos();
});

const handleLogout = () => {
  const isGuestSession = isGuest.value;
  const message = isGuestSession
    ? "¿Salir? Perderás tus datos si limpias caché."
    : "¿Cerrar sesión?";

  const confirmToastId = toast(
    ({ closeToast }) =>
      h("div", { class: "flex flex-col gap-2" }, [
        h("p", { class: "font-bold text-gray-800" }, message),
        h("div", { class: "flex gap-2 justify-end mt-1" }, [
          h(
            "button",
            {
              class:
                "px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-sm font-semibold transition",
              onClick: () => {
                closeToast();
              },
            },
            "Cancelar"
          ),
          h(
            "button",
            {
              class:
                "px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-sm font-semibold transition",
              onClick: async () => {
                closeToast();
                await performLogout();
              },
            },
            "Sí, salir"
          ),
        ]),
      ]),
    {
      autoClose: false,
      closeOnClick: false,
      position: toast.POSITION.BOTTOM_CENTER,
      type: "default",
      hideProgressBar: true,
      icon: false,
      theme: "light",
      style: {
        width: "auto",
        minWidth: "300px",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    }
  );
};

const performLogout = async () => {
  await logout();
  router.push("/auth");
};

const handleAddTodo = async () => {
  if (!newTodoTitle.value.trim()) return;
  try {
    await addTodo(newTodoTitle.value, user.value.id);
    newTodoTitle.value = "";
  } catch (e) {
    // Error is already toasted in useTodos
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden"
  >
    <!-- Sad Emoji Overlay -->
    <div
      v-if="showSadEmoji"
      class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-sad-zoom-fade"
    >
      <div class="text-[150px] filter drop-shadow-2xl">😢</div>
    </div>

    <!-- Warning Emoji Overlay -->
    <div
      v-if="showWarningEmoji"
      class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-sad-zoom-fade"
    >
      <div class="text-[150px] filter drop-shadow-2xl">🚨</div>
    </div>

    <div
      class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden relative z-10"
    >
      <!-- Header Area -->
      <div class="p-8 pb-4 bg-linear-to-b from-green-50 to-white">
        <div class="flex justify-between items-start mb-6">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-gray-800">Todo List</h1>
              <span
                v-if="isGuest"
                class="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-orange-200"
                >Invitado</span
              >
            </div>

            <p class="text-gray-500 text-sm mt-1" v-if="user && !isGuest">
              Hola, {{ user.email }}
            </p>
            <p class="text-gray-400 text-xs mt-1 italic" v-else>
              Tus datos se guardan en este dispositivo.
            </p>
          </div>
          <button
            @click="handleLogout"
            class="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
          >
            {{ isGuest ? "Salir" : "Salir" }}
          </button>
        </div>

        <!-- Progress Bar -->
        <div class="mb-6">
          <div class="flex justify-between items-end mb-2">
            <h2 class="text-lg font-semibold text-gray-800">
              {{
                todos.length > 0 && todos.every((t) => t.is_complete)
                  ? "¡Buen trabajo!"
                  : "Haciendo progreso..."
              }}
            </h2>
            <span class="text-xs text-gray-400 font-medium">
              {{ todos.filter((t) => t.is_complete).length }} /
              {{ todos.length }}
            </span>
          </div>
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              class="h-full bg-green-400 transition-all duration-500 ease-out"
              :style="{
                width: `${
                  (todos.filter((t) => t.is_complete).length /
                    (todos.length || 1)) *
                  100
                }%`,
              }"
            ></div>
          </div>
        </div>

        <!-- Add Task Input -->
        <form @submit.prevent="handleAddTodo" class="relative group">
          <input
            v-model="newTodoTitle"
            type="text"
            placeholder="Agregar nueva tarea..."
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

      <!-- Task List Area -->
      <div class="bg-white">
        <!-- Loading -->
        <div
          v-if="loading && todos.length === 0"
          class="p-8 text-center text-gray-400"
        >
          Cargando...
        </div>

        <!-- Empty -->
        <div v-else-if="todos.length === 0" class="p-12 text-center">
          <div
            class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
          >
            📝
          </div>
          <p class="text-gray-500">No hay tareas aún.</p>
          <p class="text-gray-400 text-sm">Empieza agregando una arriba.</p>
        </div>

        <!-- List -->
        <draggable
          v-else
          v-model="todos"
          item-key="id"
          tag="ul"
          class="divide-y divide-gray-50"
          handle=".drag-handle"
          @change="onDragChange"
          :animation="200"
        >
          <template #item="{ element: todo }">
            <li
              class="group hover:bg-gray-50/80 transition-colors duration-200"
            >
              <div class="flex items-center p-4">
                <!-- Drag Handle -->
                <div
                  class="drag-handle mr-3 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 8h16M4 16h16"
                    ></path>
                  </svg>
                </div>

                <!-- Checkbox -->
                <button
                  @click="handleToggleTodo(todo)"
                  class="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-200"
                  :class="
                    todo.is_complete
                      ? 'bg-green-100 border-green-400 text-green-500'
                      : 'border-gray-200 hover:border-indigo-300 text-transparent'
                  "
                >
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                </button>

                <!-- Text -->
                <div class="flex-1 min-w-0">
                  <span
                    class="block text-gray-700 font-medium transition-all duration-200 truncate"
                    :class="{ 'text-gray-400 line-through': todo.is_complete }"
                  >
                    {{ todo.title }}
                  </span>
                  <!-- Subtasks Count/Preview (if collapsed) -->
                  <div
                    v-if="
                      todo.subtasks &&
                      todo.subtasks.length > 0 &&
                      !expandedTodos.has(todo.id)
                    "
                    class="flex items-center gap-2 mt-1"
                  >
                    <div
                      class="h-1 flex-1 bg-gray-100 rounded-full max-w-[60px] overflow-hidden"
                    >
                      <div
                        class="h-full bg-indigo-300"
                        :style="{
                          width: `${
                            (todo.subtasks.filter((s) => s.is_complete).length /
                              todo.subtasks.length) *
                            100
                          }%`,
                        }"
                      ></div>
                    </div>
                    <span class="text-[10px] text-gray-400">
                      {{ todo.subtasks.filter((s) => s.is_complete).length }}/{{
                        todo.subtasks.length
                      }}
                    </span>
                  </div>
                </div>

                <!-- Expand/Collapse Subtasks Button -->
                <button
                  @click="toggleExpand(todo.id)"
                  class="ml-2 p-1 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded transition"
                >
                  <svg
                    class="w-5 h-5 transition-transform duration-200"
                    :class="{ 'rotate-180': expandedTodos.has(todo.id) }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                <!-- Delete Action -->
                <button
                  @click="removeTodo(todo.id)"
                  class="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 -mr-2"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
                </button>
              </div>

              <!-- Subtasks Area (Expanded) -->
              <div
                v-if="expandedTodos.has(todo.id)"
                class="bg-gray-50/50 pb-3 pl-14 pr-4 border-t border-gray-100"
              >
                <ul class="space-y-1 mt-2">
                  <li
                    v-for="subtask in todo.subtasks"
                    :key="subtask.id"
                    class="flex items-center group/sub"
                  >
                    <button
                      @click="toggleSubtask(todo.id, subtask.id)"
                      class="w-4 h-4 rounded border flex items-center justify-center mr-2 transition-colors"
                      :class="
                        subtask.is_complete
                          ? 'bg-indigo-100 border-indigo-400 text-indigo-500'
                          : 'border-gray-300 bg-white hover:border-indigo-300'
                      "
                    >
                      <svg
                        class="w-2.5 h-2.5 fill-current"
                        viewBox="0 0 20 20"
                        v-if="subtask.is_complete"
                      >
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    </button>
                    <span
                      class="text-sm text-gray-600 flex-1 break-all"
                      :class="{
                        'line-through text-gray-400': subtask.is_complete,
                      }"
                    >
                      {{ subtask.title }}
                    </span>
                    <button
                      @click="removeSubtask(todo.id, subtask.id)"
                      class="text-gray-300 hover:text-red-400 opacity-0 group-hover/sub:opacity-100 p-1"
                    >
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </li>
                </ul>
                <input
                  type="text"
                  placeholder="Agregar subtarea..."
                  class="mt-2 w-full bg-transparent text-sm border-b border-gray-200 py-1 focus:outline-none focus:border-indigo-400 placeholder-gray-400"
                  @keydown.enter="handleAddSubtask(todo.id, $event)"
                />
              </div>
            </li>
          </template>
        </draggable>
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
