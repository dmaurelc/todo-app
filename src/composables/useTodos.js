import { ref } from "vue";
import { toast } from "vue3-toastify";

const STORAGE_KEY = "todos";

export function useTodos() {
  const todos = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Load from LocalStorage
  const loadLocalTodos = () => {
    const local = localStorage.getItem(STORAGE_KEY);
    return local ? JSON.parse(local) : [];
  };

  const saveLocalTodos = (newTodos) => {
    todos.value = newTodos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
  };

  const fetchTodos = async () => {
    loading.value = true;
    try {
      todos.value = loadLocalTodos();
    } catch (err) {
      error.value = "Error al cargar tareas: " + err.message;
      toast.error("Error al cargar tareas");
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addTodo = async (title) => {
    if (!title.trim()) return;
    try {
      const currentMax =
        todos.value.length > 0
          ? Math.max(...todos.value.map((t) => t.position || 0))
          : 0;
      const newPosition = currentMax + 1000;

      const newTodo = {
        id: crypto.randomUUID(),
        title,
        position: newPosition,
        is_complete: false,
        subtasks: [],
        created_at: new Date().toISOString(),
      };

      const newTodos = [...todos.value, newTodo];
      saveLocalTodos(newTodos);
    } catch (err) {
      console.error("Error adding todo:", err);
      toast.error("Error al agregar tarea");
      throw err;
    }
  };

  const toggleTodo = async (todo) => {
    todo.is_complete = !todo.is_complete;
    saveLocalTodos(todos.value);
  };

  const removeTodo = async (id) => {
    todos.value = todos.value.filter((t) => t.id !== id);
    saveLocalTodos(todos.value);
  };

  const updatePositions = async (newTodos) => {
    todos.value = newTodos.map((t, i) => ({ ...t, position: i * 1000 }));
    saveLocalTodos(todos.value);
  };

  // Subtasks Logic
  const addSubtask = async (todoId, title) => {
    const todo = todos.value.find((t) => t.id === todoId);
    if (!todo) return;

    if (!todo.subtasks) todo.subtasks = [];
    const newSubtask = {
      id: crypto.randomUUID(),
      title,
      is_complete: false,
    };
    todo.subtasks.push(newSubtask);

    await saveSubtasks(todo);
  };

  const toggleSubtask = async (todoId, subtaskId) => {
    const todo = todos.value.find((t) => t.id === todoId);
    if (!todo || !todo.subtasks) return;

    const subtask = todo.subtasks.find((s) => s.id === subtaskId);
    if (subtask) {
      subtask.is_complete = !subtask.is_complete;

      // Check if all subtasks are complete
      const allSubtasksComplete = todo.subtasks.every((s) => s.is_complete);

      // Update local state immediately for reactivity
      // Only auto-complete, do not auto-uncomplete (user preference usually)
      // Or consistent behavior: if all complete, mark parent complete.
      if (allSubtasksComplete && !todo.is_complete) {
        todo.is_complete = true;
      }
      // Optional: if user unchecks a subtask, should parent uncheck?
      // Usually yes for strict dependency. Let's add that for consistency.
      else if (!allSubtasksComplete && todo.is_complete) {
        todo.is_complete = false;
      }

      await saveSubtasks(todo);
    }
  };

  const removeSubtask = async (todoId, subtaskId) => {
    const todo = todos.value.find((t) => t.id === todoId);
    if (!todo || !todo.subtasks) return;

    todo.subtasks = todo.subtasks.filter((s) => s.id !== subtaskId);

    // Check if remaining subtasks (if any) are all complete
    if (todo.subtasks.length > 0 && todo.subtasks.every((s) => s.is_complete)) {
      if (!todo.is_complete) todo.is_complete = true;
    }

    await saveSubtasks(todo);
  };

  const saveSubtasks = async (todo) => {
    saveLocalTodos(todos.value);
  };

  return {
    todos,
    loading,
    error,
    fetchTodos,
    addTodo,
    toggleTodo,
    removeTodo,
    updatePositions,
    addSubtask,
    toggleSubtask,
    removeSubtask,
  };
}
