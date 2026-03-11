<script setup>
import { computed } from "vue";
import draggable from "vuedraggable";
import TodoItem from "./TodoItem.vue";

const props = defineProps({
  todos: {
    type: Array,
    required: true,
  },
  expandedTodos: {
    type: Object,
    required: true, // Set of expanded todo IDs
  },
  isDarkMode: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["dragChange", "toggleTodo", "expandTodo", "removeTodo", "addSubtask", "toggleSubtask", "removeSubtask"]);

// CRITICAL: Clone array before passing to draggable for reactivity (Red Team fix)
const clonedTodos = computed(() => {
  return [...props.todos];
});

const isExpanded = (todoId) => {
  return props.expandedTodos.has(todoId);
};

const onDragChange = (event) => {
  if (event.moved) {
    emit("dragChange", clonedTodos.value);
  }
};
</script>

<template>
  <draggable
    v-model="clonedTodos"
    item-key="id"
    tag="ul"
    class="divide-y divide-gray-50"
    handle=".drag-handle"
    @change="onDragChange"
    :animation="200"
  >
    <template #item="{ element: todo, index: index }">
      <li
        :class="['group hover:bg-gray-50/80 transition-colors duration-200', 'animate-fade-in']"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <TodoItem
          :todo="todo"
          :isExpanded="isExpanded(todo.id)"
          :isDarkMode="isDarkMode"
          @toggle="emit('toggleTodo', $event)"
          @expand="emit('expandTodo', $event)"
          @delete="emit('removeTodo', $event)"
          @addSubtask="emit('addSubtask', $event)"
          @toggleSubtask="emit('toggleSubtask', $event)"
          @removeSubtask="emit('removeSubtask', $event)"
        />
      </li>
    </template>
  </draggable>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in-up 0.2s ease-out;
}
</style>
