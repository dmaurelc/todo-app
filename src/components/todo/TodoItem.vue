<script setup>
import { ref, computed } from "vue";
import { useTodos } from "../../composables/useTodos";
import PriorityBadge from "../ui/PriorityBadge.vue";
import CategoryBadge from "../ui/CategoryBadge.vue";

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

const emit = defineEmits(["toggle", "expand", "delete", "addSubtask", "toggleSubtask", "removeSubtask"]);

const { addSubtask: addSubtaskAction, toggleSubtask, removeSubtask } = useTodos();

const newSubtaskTitle = ref("");

// Computed for subtask progress
const subtaskProgress = computed(() => {
  if (!props.todo.subtasks || props.todo.subtasks.length === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }
  const completed = props.todo.subtasks.filter(s => s.is_complete).length;
  const total = props.todo.subtasks.length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : (completed / total) * 100
  };
});

const handleToggle = () => {
  emit("toggle", props.todo);
};

const handleAddSubtask = async (event) => {
  const input = event.target;
  const title = input.value.trim();
  if (!title) return;

  await addSubtaskAction(props.todo.id, title);
  input.value = "";
  emit("addSubtask", props.todo.id);
};

const handleToggleSubtask = async (subtask) => {
  await toggleSubtask(props.todo.id, subtask.id);
  emit("toggleSubtask", props.todo.id);
};

const handleRemoveSubtask = async (subtask) => {
  await removeSubtask(props.todo.id, subtask.id);
  emit("removeSubtask", props.todo.id);
};
</script>

<template>
  <li class="group hover:bg-gray-50/80 transition-colors duration-200">
    <div class="flex items-center p-4">
      <!-- Drag Handle -->
      <div
        class="drag-handle mr-3 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <!-- Checkbox -->
      <button
        @click="handleToggle"
        class="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-200"
        :class="[
          todo.is_complete
            ? 'bg-green-100 border-green-400 text-green-500'
            : 'border-gray-200 hover:border-indigo-300 text-transparent'
        ]"
      >
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
        </svg>
      </button>

      <!-- Priority Badge -->
      <PriorityBadge :level="todo.priority || 'medium'" :isDarkMode="isDarkMode" class="shrink-0 mr-1" />

      <!-- Category Badge -->
      <CategoryBadge :category="todo.category || 'otros'" :isDarkMode="isDarkMode" size="sm" class="shrink-0 mr-2" />

      <!-- Text -->
      <div class="flex-1 min-w-0 mr-2">
        <span
          class="block text-gray-700 font-medium transition-all duration-200 truncate"
          :class="{ 'text-gray-400 line-through': todo.is_complete }"
        >
          {{ todo.title }}
        </span>

        <!-- Subtasks Progress (collapsed) -->
        <div
          v-if="subtaskProgress.total > 0 && !isExpanded"
          class="flex items-center gap-2 mt-1"
        >
          <div class="h-1 flex-1 bg-gray-100 rounded-full max-w-15 overflow-hidden">
            <div
              class="h-full bg-indigo-300"
              :style="{ width: `${subtaskProgress.percent}%` }"
            ></div>
          </div>
          <span class="text-[10px] text-gray-400">
            {{ subtaskProgress.completed }}/{{ subtaskProgress.total }}
          </span>
        </div>
      </div>

      <!-- Expand/Collapse Button -->
      <button
        @click="$emit('expand', todo.id)"
        class="ml-2 p-1 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded transition"
      >
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Delete Action -->
      <button
        @click="$emit('delete', todo.id)"
        class="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 -mr-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>

    <!-- Subtasks Area (Expanded) -->
    <div
      v-if="isExpanded"
      class="bg-gray-50/50 pb-3 pl-14 pr-4 border-t border-gray-100"
    >
      <ul class="space-y-1 mt-2">
        <li
          v-for="subtask in todo.subtasks"
          :key="subtask.id"
          class="flex items-center group/sub"
        >
          <button
            @click="handleToggleSubtask(subtask)"
            class="w-4 h-4 rounded border flex items-center justify-center mr-2 transition-colors"
            :class="[
              subtask.is_complete
                ? 'bg-indigo-100 border-indigo-400 text-indigo-500'
                : 'border-gray-300 bg-white hover:border-indigo-300'
            ]"
          >
            <svg v-if="subtask.is_complete" class="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
              <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
            </svg>
          </button>
          <span
            class="text-sm text-gray-600 flex-1 break-all"
            :class="{ 'line-through text-gray-400': subtask.is_complete }"
          >
            {{ subtask.title }}
          </span>
          <button
            @click="handleRemoveSubtask(subtask)"
            class="text-gray-300 hover:text-red-400 opacity-0 group-hover/sub:opacity-100 p-1"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </li>
      </ul>
      <input
        type="text"
        placeholder="Agregar subtarea..."
        class="mt-2 w-full bg-transparent text-sm border-b border-gray-200 py-1 focus:outline-none focus:border-indigo-400 placeholder-gray-400"
        @keydown.enter="handleAddSubtask"
      />
    </div>
  </li>
</template>
