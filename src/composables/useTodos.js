import { ref } from "vue";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { toast } from "vue3-toastify";

export function useTodos() {
  const todos = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const { isGuest } = useAuth();

  // Load from LocalStorage (Guest Mode)
  const loadLocalTodos = () => {
    const local = localStorage.getItem("guest_todos");
    return local ? JSON.parse(local) : [];
  };

  const saveLocalTodos = (newTodos) => {
    todos.value = newTodos;
    localStorage.setItem("guest_todos", JSON.stringify(newTodos));
  };

  const fetchTodos = async () => {
    loading.value = true;
    error.value = null;
    try {
      if (isGuest.value) {
        todos.value = loadLocalTodos();
      } else {
        const { data, error: err } = await supabase
          .from("todos")
          .select("*")
          .order("position", { ascending: true });

        if (err) throw err;
        todos.value = data;
      }
    } catch (err) {
      error.value = "Error al cargar tareas: " + err.message;
      toast.error("Error al cargar tareas");
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const addTodo = async (title, userId) => {
    if (!title.trim()) return;
    try {
      const currentMin =
        todos.value.length > 0
          ? Math.min(...todos.value.map((t) => t.position || 0))
          : 0;
      const newPosition = currentMin - 1000;

      const newTodo = {
        title,
        user_id: userId,
        position: newPosition,
        is_complete: false,
        subtasks: [], // Subtasks array
        created_at: new Date().toISOString(),
      };

      if (isGuest.value) {
        // Guest: Add locally
        // Generate pseudo-ID
        newTodo.id = crypto.randomUUID();
        const newTodos = [newTodo, ...todos.value];
        saveLocalTodos(newTodos);
      } else {
        // Supabase
        const { data, error: err } = await supabase
          .from("todos")
          .insert([newTodo])
          .select()
          .single();

        if (err) throw err;
        todos.value.unshift(data);
      }
    } catch (err) {
      console.error("Error adding todo:", err);
      toast.error("Error al agregar tarea");
      throw err;
    }
  };

  const toggleTodo = async (todo) => {
    todo.is_complete = !todo.is_complete;
    try {
      if (isGuest.value) {
        saveLocalTodos(todos.value);
      } else {
        const { error: err } = await supabase
          .from("todos")
          .update({ is_complete: todo.is_complete })
          .eq("id", todo.id);

        if (err) {
          todo.is_complete = !todo.is_complete;
          throw err;
        }
      }
    } catch (err) {
      console.error("Error updating todo:", err);
      toast.error("Error al actualizar tarea");
    }
  };

  const removeTodo = async (id) => {
    const previousTodos = [...todos.value];
    todos.value = todos.value.filter((t) => t.id !== id);

    try {
      if (isGuest.value) {
        saveLocalTodos(todos.value);
      } else {
        const { error: err } = await supabase
          .from("todos")
          .delete()
          .eq("id", id);

        if (err) {
          todos.value = previousTodos;
          throw err;
        }
      }
    } catch (err) {
      console.error("Error deleting todo:", err);
      toast.error("Error al eliminar tarea");
    }
  };

  const updatePositions = async (newTodos) => {
    todos.value = newTodos;

    if (isGuest.value) {
      saveLocalTodos(newTodos);
      return;
    }

    // Prepare payload for RPC
    const updates = newTodos.map((todo, index) => ({
      id: todo.id,
      position: index * 1000,
    }));

    try {
      const { error: err } = await supabase.rpc("update_todo_positions", {
        payload: updates,
      });

      if (err) throw err;

      // Update local positions
      todos.value = todos.value.map((t, i) => ({
        ...t,
        position: i * 1000,
      }));
    } catch (err) {
      console.error("Error reordering:", err);
      toast.error("Error al guardar el nuevo orden");
    }
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
    try {
      if (isGuest.value) {
        saveLocalTodos(todos.value);
      } else {
        // Update both subtasks and is_complete status
        const { error: err } = await supabase
          .from("todos")
          .update({
            subtasks: todo.subtasks,
            is_complete: todo.is_complete,
          })
          .eq("id", todo.id);

        if (err) {
          // Basic rollback could go here, but omitted for brevity in MVP
          throw err;
        }
      }
    } catch (err) {
      console.error("Error saving subtasks:", err);
      toast.error("Error al guardar subtarea");
    }
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
