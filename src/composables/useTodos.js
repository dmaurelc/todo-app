import { ref, computed } from "vue";
import { toast } from "vue3-toastify";
import { DEFAULT_PRIORITY } from "../constants/priorities.js";
import { DEFAULT_CATEGORY } from "../constants/categories.js";

const STORAGE_KEY = "todos";

const todos = ref([]);
const loading = ref(false);
const error = ref(null);
const categoryFilter = ref("all");
const dateFilter = ref(new Date().toISOString().split('T')[0]); // Default to today
const timeRange = ref("all"); // all, today, tomorrow, week

export function useTodos() {
  // Load from LocalStorage
  const loadLocalTodos = () => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (!local) return [];
    return JSON.parse(local);
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

  const addTodo = async (
    title,
    category = DEFAULT_CATEGORY,
    dueDate = new Date().toISOString().split("T")[0],
    priority = 0 // 0: None, 1: Low, 2: Medium, 3: High
  ) => {
    if (!title.trim()) return;
    loading.value = true;
    try {
      const newTodo = {
        id: crypto.randomUUID(),
        title,
        is_complete: false,
        category,
        due_date: dueDate,
        priority: parseInt(priority) || 0,
        position:
          todos.value.length > 0
            ? Math.max(...todos.value.map((t) => t.position || 0)) + 1000
            : 1000,
        subtasks: [],
        created_at: new Date().toISOString(),
      };

      const newTodos = [...todos.value, newTodo];
      saveLocalTodos(newTodos);
      loading.value = false;
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

  const updateTodo = async (id, updates) => {
    const todo = todos.value.find((t) => t.id === id);
    if (!todo) return;

    Object.assign(todo, updates);
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

      if (allSubtasksComplete && !todo.is_complete) {
        todo.is_complete = true;
      } else if (!allSubtasksComplete && todo.is_complete) {
        todo.is_complete = false;
      }

      await saveSubtasks(todo);
    }
  };

  const removeSubtask = async (todoId, subtaskId) => {
    const todo = todos.value.find((t) => t.id === todoId);
    if (!todo || !todo.subtasks) return;

    todo.subtasks = todo.subtasks.filter((s) => s.id !== subtaskId);

    if (todo.subtasks.length > 0 && todo.subtasks.every((s) => s.is_complete)) {
      if (!todo.is_complete) todo.is_complete = true;
    }

    await saveSubtasks(todo);
  };

  const updateSubtaskTitle = async (todoId, subtaskId, newTitle) => {
    const todo = todos.value.find((t) => t.id === todoId);
    if (!todo || !todo.subtasks) return;

    const subtask = todo.subtasks.find((s) => s.id === subtaskId);
    if (subtask) {
      subtask.title = newTitle;
      await saveSubtasks(todo);
    }
  };

  const saveSubtasks = async (todo) => {
    saveLocalTodos(todos.value);
  };

  const filteredTodos = computed(() => {
    return todos.value
      .filter((t) => {
        // Category filter
        const categoryMatch =
          categoryFilter.value === "all" || t.category === categoryFilter.value;

        // Date filter - uses the selected day from the calendar bar
        const taskDate = t.due_date || t.created_at?.split("T")[0];
        const dateMatch = taskDate === dateFilter.value;

        return categoryMatch && dateMatch;
      })
      .sort((a, b) => {
        // Primero: tareas completadas al final
        if (a.is_complete !== b.is_complete) {
          return a.is_complete ? 1 : -1;
        }
        // Segundo: prioridad (3 a 0)
        const pA = a.priority || 0;
        const pB = b.priority || 0;
        if (pA !== pB) return pB - pA;
        // Tercero: position personalizado
        return (a.position || 0) - (b.position || 0);
      });
  });

  const dayTodos = computed(() => {
    return todos.value.filter((t) => {
      const taskDate = t.due_date || t.created_at?.split("T")[0];
      return taskDate === dateFilter.value;
    });
  });

  const dayProgress = computed(() => {
    const total = dayTodos.value.length;
    const completed = dayTodos.value.filter((t) => t.is_complete).length;
    return {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });

  const categoryCounts = computed(() => {
    const counts = { trabajo: 0, personal: 0, salud: 0, ideas: 0, otros: 0 };
    todos.value.forEach(t => {
      if (t.category && counts[t.category] !== undefined) {
        counts[t.category]++;
      }
    });
    return counts;
  });

  return {
    todos,
    filteredTodos,
    categoryFilter,
    dateFilter,
    timeRange,
    categoryCounts,
    dayProgress,
    loading,
    error,
    fetchTodos,
    addTodo,
    toggleTodo,
    removeTodo,
    updateTodo,
    updatePositions,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    updateSubtaskTitle,
  };
}
