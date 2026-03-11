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
    class="divide-y divide-border"
    handle=".drag-handle"
    @change="onDragChange"
    :animation="200"
  >
    <template #item="{ element: todo }">
      <TodoItem
        :todo="todo"
        :isExpanded="isExpanded(todo.id)"
        :isDarkMode="isDarkMode"
        @toggle="emit('toggleTodo', $event)"
        @expand="emit('expandTodo', $event)"
        @remove="emit('removeTodo', $event)"
      />
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
