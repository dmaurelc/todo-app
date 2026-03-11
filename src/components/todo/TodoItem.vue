<script setup>
import { ref, computed } from "vue";
import { useTodos } from "../../composables/useTodos";

const props = defineProps({
  todo: {
    type: Object,
    required: true,
  },
  isExpanded: {
    type: Boolean,
    default: false,
  },
  isDarkMode: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits([
  "toggle",
  "expand",
  "delete",
  "addSubtask",
  "toggleSubtask",
  "removeSubtask",
  "edit",
]);

const {
  addSubtask: addSubtaskAction,
  toggleSubtask,
  removeSubtask,
  updateSubtaskTitle,
} = useTodos();

const newSubtaskTitle = ref("");

// Press & hold for edit
const pressTimer = ref(null);
const isPressing = ref(false);

const handlePressStart = () => {
  isPressing.value = true;
  pressTimer.value = setTimeout(() => {
    emit("edit", props.todo);
    isPressing.value = false;
  }, 500);
};

const handlePressEnd = () => {
  isPressing.value = false;
  if (pressTimer.value) {
    clearTimeout(pressTimer.value);
    pressTimer.value = null;
  }
};

// Computed for subtask progress
const subtaskProgress = computed(() => {
  if (!props.todo.subtasks || props.todo.subtasks.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }
  const completed = props.todo.subtasks.filter((s) => s.is_complete).length;
  const total = props.todo.subtasks.length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
});

const handleToggle = () => {
  emit("toggle", props.todo);
};

const handleAddSubtask = async () => {
  const title = newSubtaskTitle.value.trim();
  if (!title) return;

  await addSubtaskAction(props.todo.id, title);
  newSubtaskTitle.value = "";
  emit("addSubtask", props.todo.id);
};

const handleUpdateSubtask = async (subtaskId, newTitle) => {
  if (updateSubtaskTitle) {
    await updateSubtaskTitle(props.todo.id, subtaskId, newTitle);
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const taskDate = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = taskDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays === -1) return "Ayer";

  return taskDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};
</script>

<template>
  <li
    class="group/item relative transition-all duration-300 hover:bg-accent/30 border-b border-border/30 last:border-0 overflow-hidden"
  >
    <!-- Main Content Row -->
    <div
      class="flex items-center py-4 md:px-4 sm:py-5 gap-3 sm:gap-4 cursor-pointer select-none active:bg-accent/50 transition-colors"
      :class="{ 'opacity-70': isPressing }"
      @click="$emit('expand', todo.id)"
      @touchstart="handlePressStart"
      @touchend="handlePressEnd"
      @mousedown="handlePressStart"
      @mouseup="handlePressEnd"
      @mouseleave="handlePressEnd"
    >
      <!-- Custom Checkbox -->
      <div class="shrink-0" @click.stop>
        <button
          @click.stop="handleToggle"
          class="w-6 h-6 sm:w-7 sm:h-7 rounded-xl sm:rounded-2xl border-2 border-border/50 flex items-center justify-center transition-all duration-500 active:scale-90 group/check"
          :class="[
            todo.is_complete
              ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'hover:border-primary/40 bg-secondary/50 dark:bg-white/5',
          ]"
        >
          <svg
            v-if="todo.is_complete"
            class="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-none stroke-current"
            viewBox="0 0 24 24"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <div
            v-else
            class="w-1.5 h-1.5 rounded-full bg-primary/20 opacity-0 group-hover/check:opacity-100 transition-opacity"
          ></div>
        </button>
      </div>

      <!-- Drag Handle (hidden on mobile, visible on sm+) -->
      <button
        class="drag-handle hidden sm:block shrink-0 p-1 text-muted-foreground/20 hover:text-muted-50 transition-colors cursor-grab active:cursor-grabbing opacity-0 group-hover/item:opacity-100"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </button>

      <!-- Task Details -->
      <div class="flex-1 min-w-0 flex flex-col justify-center">
        <div class="flex flex-col">
          <span
            class="block text-[14px] sm:text-[17px] font-medium leading-tight sm:leading-snug transition-all duration-300 text-foreground"
            :class="{ 'opacity-30 line-through grayscale': todo.is_complete }"
          >
            {{ todo.title }}
          </span>

          <div class="flex items-center gap-2 mt-1 sm:mt-1.5">
            <div class="flex items-center gap-1.5">
              <svg
                class="w-3 h-3 text-muted-foreground/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2.5"
              >
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  stroke-linecap="round"
                />
              </svg>
              <span
                class="text-[11px] sm:text-[12px] font-medium text-muted-foreground/80 tracking-tight"
              >
                {{ formatDate(todo.due_date) }}
              </span>
            </div>

            <!-- Categories & Priorities (Separated) -->
            <div
              v-if="todo.category"
              class="flex items-center px-2 py-0.5 rounded-md bg-secondary text-primary text-[9px] sm:text-[10px] font-medium uppercase tracking-wider opacity-60"
            >
              {{ todo.category }}
            </div>

            <div
              v-if="todo.priority > 0"
              class="flex items-center -space-x-1.5 ml-1 bg-secondary px-1 py-0.5 rounded-md"
            >
              <svg
                v-for="i in todo.priority"
                :key="i"
                class="w-3.5 h-3.5 text-yellow-500 fill-current"
                viewBox="0 0 24 24"
              >
                <path
                  d="m9.154 20.885l1-6.885h-4.25l7.48-10.788h.462L12.866 11h5l-8.25 9.885z"
                />
              </svg>
            </div>

            <div
              v-if="todo.subtasks?.length > 0"
              class="flex items-center gap-1"
            >
              <div
                class="text-[9px] sm:text-[10px] font-medium text-primary/40"
              >
                {{ subtaskProgress.completed }}/{{ subtaskProgress.total }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions (hidden on mobile, visible on sm+) -->
      <div class="hidden sm:flex items-center gap-1">
        <button
          @click.stop="$emit('edit', todo)"
          class="p-2 text-muted-foreground/30 hover:text-primary hover:bg-primary/10 rounded-xl transition-all opacity-0 group-hover/item:opacity-100 active:scale-95"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>

        <button
          @click.stop="$emit('remove', todo.id)"
          class="p-2 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all opacity-0 group-hover/item:opacity-100 active:scale-95"
        >
          <svg
            class="w-3.5 h-3.5"
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
        </button>

        <div
          class="p-1 transform transition-transform duration-500"
          :class="{ 'rotate-180': isExpanded }"
        >
          <svg
            class="w-3.5 h-3.5 text-muted-foreground/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Subtasks Area -->
    <transition name="expand">
      <div
        v-if="isExpanded"
        class="bg-accent/5 p-6 sm:p-8 border-t border-border/20 overflow-hidden"
      >
        <ul class="grid gap-1">
          <li
            v-for="subtask in todo.subtasks"
            :key="subtask.id"
            class="flex items-center group/sub py-1 sm:py-2.5 px-2 sm:px-3 rounded-2xl hover:bg-card transition-colors"
          >
            <button
              @click.stop="toggleSubtask(todo.id, subtask.id)"
              class="shrink-0 w-6 h-6 rounded-xl border-2 border-border/50 flex items-center justify-center transition-all duration-300"
              :class="[
                subtask.is_complete
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-secondary/50 dark:bg-white/10',
              ]"
            >
              <svg
                v-if="subtask.is_complete"
                class="w-3 h-3 fill-none stroke-current"
                viewBox="0 0 24 24"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>

            <input
              v-model="subtask.title"
              class="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-medium px-4 transition-all outline-none text-foreground placeholder:text-muted-foreground/30"
              :class="{ 'opacity-30 line-through': subtask.is_complete }"
              @blur="handleUpdateSubtask(subtask.id, subtask.title)"
              @keyup.enter="$event.target.blur()"
            />

            <button
              @click.stop="removeSubtask(todo.id, subtask.id)"
              class="p-2 text-muted-foreground/20 hover:text-destructive transition-colors opacity-0 group-hover/sub:opacity-100"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        </ul>

        <!-- Add Subtask Input -->
        <div class="mt-4 px-3">
          <input
            v-model="newSubtaskTitle"
            type="text"
            placeholder="+ Añadir subtarea..."
            class="w-full bg-secondary/30 dark:bg-white/5 border border-border/30 px-3 sm:px-5 py-2 sm:py-3 rounded-2xl text-[14px] font-medium focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30 outline-none"
            @keyup.enter="handleAddSubtask"
          />
        </div>
      </div>
    </transition>
  </li>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 500px;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
</style>
