import { ref, computed } from "vue";
import { toast } from "vue3-toastify";
import { DEFAULT_PRIORITY } from "../constants/priorities.js";
import { DEFAULT_CATEGORY, FALLBACK_CATEGORY } from "../constants/categories.js";
import { storage } from "./use-storage-adapter.js";
import { useCategories } from "./use-categories.js";

const STORAGE_KEY = "todos";

const todos = ref([]);
const loading = ref(false);
const error = ref(null);
const categoryFilter = ref("all");
const dateFilter = ref(new Date().toISOString().split("T")[0]);
const timeRange = ref("all");

export function useTodos() {
  // Async: storage adapter may hit Tauri store (async fs) or localStorage (sync).
  const loadLocalTodos = async () => {
    const data = await storage.get(STORAGE_KEY);
    if (!Array.isArray(data)) return [];
    return data;
  };

  const saveLocalTodos = async (newTodos) => {
    todos.value = newTodos;
    await storage.set(STORAGE_KEY, newTodos);
  };

  const fetchTodos = async () => {
    loading.value = true;
    try {
      const loaded = await loadLocalTodos();
      todos.value = loaded;
    } catch (err) {
      // Log full error so we can diagnose (Tauri IPC failures, schema mismatches).
      console.error("[useTodos] fetchTodos failed:", err);
      error.value = "Error al cargar tareas: " + (err?.message || String(err));
      toast.error("No se pudieron cargar las tareas");
      // Surface empty list so UI stays usable; user can retry by adding a task.
      todos.value = [];
    } finally {
      loading.value = false;
    }
  };

  const addTodo = async (
    title,
    category = DEFAULT_CATEGORY,
    dueDate = new Date().toISOString().split("T")[0],
    priority = 0,
    externalId = null
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
        // External id (e.g. api-football fixture.id) lets sync callers
        // dedupe via Set lookup. Persisted only when truthy so legacy
        // todos keep their original slim shape.
        ...(externalId ? { external_id: String(externalId) } : {}),
      };

      const newTodos = [...todos.value, newTodo];
      await saveLocalTodos(newTodos);
      loading.value = false;
    } catch (err) {
      console.error("Error adding todo:", err);
      toast.error("Error al agregar tarea");
      throw err;
    }
  };

  const toggleTodo = async (todo) => {
    todo.is_complete = !todo.is_complete;
    await saveLocalTodos(todos.value);
  };

  const removeTodo = async (id) => {
    todos.value = todos.value.filter((t) => t.id !== id);
    await saveLocalTodos(todos.value);
  };

  const updateTodo = async (id, updates) => {
    const todo = todos.value.find((t) => t.id === id);
    if (!todo) return;

    Object.assign(todo, updates);
    await saveLocalTodos(todos.value);
  };

  const updatePositions = async (newTodos) => {
    todos.value = newTodos.map((t, i) => ({ ...t, position: i * 1000 }));
    await saveLocalTodos(todos.value);
  };

  // Subtasks
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
    await saveLocalTodos(todos.value);
  };

  const filteredTodos = computed(() => {
    return todos.value
      .filter((t) => {
        const categoryMatch =
          categoryFilter.value === "all" || t.category === categoryFilter.value;
        const taskDate = t.due_date || t.created_at?.split("T")[0];
        const dateMatch = taskDate === dateFilter.value;
        return categoryMatch && dateMatch;
      })
      .sort((a, b) => {
        if (a.is_complete !== b.is_complete) {
          return a.is_complete ? 1 : -1;
        }
        const pA = a.priority || 0;
        const pB = b.priority || 0;
        if (pA !== pB) return pB - pA;
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
    // Iterate all known categories (from useCategories) plus `otros` fallback
    // so consumers can render chips for any user-added category. Todos with
    // a category that was deleted still count under their last value (so
    // they show up in `counts` even though the chip is gone).
    const cats = useCategories();
    const counts = {};
    for (const c of cats.categories.value) {
      counts[c.id] = 0;
    }
    if (counts[FALLBACK_CATEGORY] === undefined) counts[FALLBACK_CATEGORY] = 0;
    todos.value.forEach((t) => {
      const key = t.category || FALLBACK_CATEGORY;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  });

  // Reassign every todo from `oldId` to `newId`, then persist. Returns the
  // number of todos touched. Used by CategoryManagerDialog when deleting a
  // category so existing tasks don't end up orphaned.
  const reassignCategory = async (oldId, newId) => {
    let n = 0;
    const updated = todos.value.map((t) => {
      if (t.category === oldId) {
        n++;
        return { ...t, category: newId };
      }
      return t;
    });
    if (n === 0) return 0;
    todos.value = updated;
    await saveLocalTodos(updated);
    return n;
  };

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
    reassignCategory,
  };
}
