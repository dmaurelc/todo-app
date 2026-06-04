<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useCategories } from "../../composables/use-categories.js";
import { useTodos } from "../../composables/useTodos.js";
import { toast } from "vue3-toastify";
import { FALLBACK_CATEGORY } from "../../constants/categories.js";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);

const { categories, add, rename, updateIcon, remove, reorder, isLocked } = useCategories();
const { categoryCounts, reassignCategory } = useTodos();

// Curated icon set. Lucide-style 14×14 SVGs, picked for visual distinction
// at small sizes. Adding more is a one-line append — future expansion stays
// cheap as long as the visual language stays consistent.
const ICON_OPTIONS = [
  // built-in
  { id: "trabajo",   svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
  { id: "personal",  svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { id: "salud",     svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
  { id: "ideas",     svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>' },
  { id: "otros",     svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>' },
  // lifestyle
  { id: "futbol",    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512"><path fill="currentColor" d="M255.03 33.813a229 229 0 0 0-5.5.03c-6.73.14-13.462.605-20.155 1.344c.333.166.544.32.47.438L204.78 75.063l73.907 49.437l-.125.188l70.625.28L371 79.282L342.844 52a225.6 225.6 0 0 0-49.47-14.78c-12.65-2.24-25.497-3.36-38.343-3.407zM190.907 88.25l-73.656 36.78l-13.813 98.407l51.344 33.657l94.345-43.438l14.875-76.5l-73.094-48.906zm196.344.344l-21.25 44.5l36.75 72.72l62.063 38.905l11.312-21.282c.225.143.45.403.656.75c-.77-4.954-1.71-9.893-2.81-14.782c-6.446-28.59-18.59-55.962-35.5-79.97c-9.07-12.872-19.526-24.778-31.095-35.5l-20.125-5.342zm-302.656 23c-6.906 8.045-13.257 16.56-18.938 25.5c-15.676 24.664-26.44 52.494-31.437 81.312A223 223 0 0 0 31 261l20.25 5.094l33.03-40.5L98.75 122.53l-14.156-10.936zm312.719 112.844l-55.813 44.75l-3.47 101.093l39.626 21.126l77.188-49.594l4.406-78.75l-.094.157l-61.844-38.783zm-140.844 6.406l-94.033 43.312l-1.218 76.625l89.155 57.376l68.938-36.437l3.437-101.75l-66.28-39.126zm-224.22 49.75c.91 8.436 2.29 16.816 4.156 25.094c6.445 28.59 18.62 55.96 35.532 79.968c3.873 5.5 8.02 10.805 12.374 15.938l-9.374-48.156l.124-.032l-27.03-68.844zm117.188 84.844l-51.532 8.156l10.125 52.094a225 225 0 0 0 27.314 20.437a226.3 226.3 0 0 0 46.687 22.594l62.626-13.69l-4.344-31.124l-90.875-58.47zm302.437.5l-64.22 41.25l-42 47.375l4.408 6.156c12.027-5.545 23.57-12.144 34.406-19.72c23.97-16.76 44.604-38.304 60.28-62.97c2.51-3.947 4.87-7.99 7.125-12.092zm-122.78 97.656l-79.94 9.625l-25.968 5.655c26.993 4 54.717 3.044 81.313-2.813c9.412-2.072 18.684-4.79 27.75-8.062l-3.156-4.406z"/></svg>' },
  { id: "tenis",     svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21 21 6"/><path d="m21 6-2.5-2.5"/><path d="m3 18 2.5 2.5"/></svg>' },
  { id: "basquet",   svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 12 12"/><path d="M19.07 4.93 12 12"/><path d="M12 2v20"/><path d="M4.93 19.07 12 12"/><path d="M19.07 19.07 12 12"/><path d="M2 12h20"/></svg>' },
  { id: "bicicleta", svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>' },
  { id: "correr",    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="m4 17 3-3 3 1 4-1 2 4"/><path d="m9 12 2-6 3 1 3 3 2 1"/><path d="M6 22a2 2 0 0 1-2-2v-3c0-.6.4-1 1-1h2l1 3"/></svg>' },
  // food
  { id: "pizza",     svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 11h.01"/><path d="M11 15h.01"/><path d="M16 16h.01"/><path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"/><path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"/></svg>' },
  { id: "hamburguesa", svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/><path d="M5 6c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v0"/><path d="M5 18c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2v0"/><path d="M6 12c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v0"/></svg>' },
  { id: "cafe",      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>' },
  { id: "postre",    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M4 12c0-3 4-6 8-6s8 3 8 6"/><path d="M4 12v3c0 2 4 4 8 4s8-2 8-4v-3"/><path d="M12 3v3"/><path d="M9 6l1 3"/><path d="M15 6l-1 3"/></svg>' },
  { id: "bebida",    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8l-1 4-2 2v8a4 4 0 0 1-4 4 4 4 0 0 1-4-4V8L3 6l1-4h4z"/><path d="M7 14h6"/></svg>' },
  { id: "hogar",     svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { id: "estudio",   svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' },
  { id: "finanzas",  svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
  // leisure
  { id: "musica",    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' },
  { id: "viajes",    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>' },
  { id: "lectura",   svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' },
  { id: "tecnologia",svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
  { id: "compras",   svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>' },
  { id: "familia",   svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { id: "mascotas",  svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>' },
  { id: "arte",      svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>' },
];

const newLabel = ref("");
const newIcon = ref(ICON_OPTIONS[0].svg);
const editingId = ref(null);
const editingLabel = ref("");
const editingIcon = ref(null);
const iconScrollerRef = ref(null);
const iconScrollLeft = ref(false);
const iconScrollRight = ref(true);

// Shared form: v-model needs a single member expression, so we proxy
// the input through a computed that reads/writes the right ref based
// on whether the user is creating or editing.
const formLabel = computed({
  get: () => (editingId.value ? editingLabel.value : newLabel.value),
  set: (v) => {
    if (editingId.value) editingLabel.value = v;
    else newLabel.value = v;
  },
});

const formIcon = computed({
  get: () => (editingId.value ? editingIcon.value : newIcon.value),
  set: (v) => {
    if (editingId.value) editingIcon.value = v;
    else newIcon.value = v;
  },
});

const isFormValid = computed(() =>
  editingId.value ? !!editingLabel.value.trim() : !!newLabel.value.trim()
);

const submitForm = () => {
  if (editingId.value) saveEdit(editingId.value);
  else handleAdd();
};

// Local working list — vuedraggable@4 has a known reactivity bug with Vue 3
// refs (does not mutate the array on drop), so we use native HTML5 drag.
// categoryItems drives the rendered list; reorder writes back to composable.
const categoryItems = ref([...categories.value]);

// Re-sync from composable when the dialog opens or the source list changes.
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) categoryItems.value = [...categories.value];
  }
);
watch(
  categories,
  (next) => {
    if (props.open) categoryItems.value = [...next];
  }
);

// Pointer-based drag (works in browser AND native WebViews).
// Tauri WebViews (WKWebView/WebView2/WebKitGTK) do not fire HTML5 drag events
// on DOM elements — they capture pointer events for native scroll/gestures.
// We use pointerdown/pointermove/pointerup with a small activation threshold
// so taps/clicks still work as before.
const dragSrcIndex = ref(null);
const dragOverIndex = ref(null);
let pointerStartY = 0;
let pointerStartX = 0;
let dragActivated = false;
let activePointerId = null;
const DRAG_THRESHOLD_PX = 5;

const onItemPointerDown = (e, index) => {
  // Only primary button (left mouse / first touch).
  if (e.button !== undefined && e.button !== 0) return;
  dragSrcIndex.value = index;
  pointerStartY = e.clientY;
  pointerStartX = e.clientX;
  dragActivated = false;
  activePointerId = e.pointerId;
};

const onItemPointerEnter = (index) => {
  // Only highlight a target if we're actively dragging.
  if (dragSrcIndex.value === null) return;
  if (index === dragSrcIndex.value) {
    dragOverIndex.value = null;
    return;
  }
  dragOverIndex.value = index;
};

const onItemPointerMove = (e) => {
  if (dragSrcIndex.value === null || activePointerId !== e.pointerId) return;
  const dx = Math.abs(e.clientX - pointerStartX);
  const dy = Math.abs(e.clientY - pointerStartY);
  if (!dragActivated && dx + dy >= DRAG_THRESHOLD_PX) {
    dragActivated = true;
  }
};

const onItemPointerUp = async (e) => {
  if (activePointerId !== e.pointerId) return;
  const src = dragSrcIndex.value;
  const drop = dragOverIndex.value;
  const wasDragging = dragActivated;
  dragSrcIndex.value = null;
  dragOverIndex.value = null;
  activePointerId = null;
  dragActivated = false;
  if (!wasDragging || src === null || drop === null || src === drop) return;
  const next = [...categoryItems.value];
  const [moved] = next.splice(src, 1);
  next.splice(drop, 0, moved);
  categoryItems.value = next;
  await reorder(next.map((c) => c.id));
  toast.success("Orden actualizado");
};

const onItemPointerCancel = () => {
  dragSrcIndex.value = null;
  dragOverIndex.value = null;
  activePointerId = null;
  dragActivated = false;
};

// Stop the browser's native image-drag fallback when a drag doesn't activate.
const suppressNativeDrag = (e) => {
  e.preventDefault();
};

const onIconScroll = () => {
  const el = iconScrollerRef.value;
  if (!el) return;
  iconScrollLeft.value = el.scrollLeft > 4;
  iconScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) {
      newLabel.value = "";
      newIcon.value = ICON_OPTIONS[0].svg;
      editingId.value = null;
      editingLabel.value = "";
      editingIcon.value = null;
    } else {
      await nextTick();
      onIconScroll();
    }
  }
);

const handleAdd = async () => {
  const label = newLabel.value.trim();
  if (!label) return;
  const id = await add(label, newIcon.value);
  if (id) {
    newLabel.value = "";
    newIcon.value = ICON_OPTIONS[0].svg;
    toast.success(`Categoría "${label}" creada`);
  } else {
    toast.error("No se pudo crear la categoría");
  }
};

const startEdit = (cat) => {
  if (isLocked(cat.id)) return;
  editingId.value = cat.id;
  editingLabel.value = cat.label;
  editingIcon.value = cat.icon;
};

const cancelEdit = () => {
  editingId.value = null;
  editingLabel.value = "";
  editingIcon.value = null;
};

const saveEdit = async (id) => {
  const label = editingLabel.value.trim();
  if (!label) return;
  const original = categories.value.find((c) => c.id === id);
  if (!original) return;
  // Persist label + icon only if either changed — avoids unnecessary writes.
  const labelChanged = label !== original.label;
  const iconChanged = editingIcon.value && editingIcon.value !== original.icon;
  if (!labelChanged && !iconChanged) {
    cancelEdit();
    return;
  }
  let ok = true;
  if (labelChanged) ok = await rename(id, label);
  if (ok && iconChanged) ok = await updateIcon(id, editingIcon.value);
  if (ok) {
    toast.success("Categoría actualizada");
    cancelEdit();
  } else {
    toast.error("No se pudo actualizar");
  }
};

const handleRemove = async (cat) => {
  if (isLocked(cat.id)) {
    toast.error(`"${cat.label}" no se puede eliminar`);
    return;
  }
  const count = categoryCounts.value[cat.id] || 0;
  if (count > 0) {
    const ok = window.confirm(
      `"${cat.label}" tiene ${count} tarea${count === 1 ? "" : "s"}. ` +
        `Se reasignarán a "Otros". ¿Continuar?`
    );
    if (!ok) return;
    await reassignCategory(cat.id, FALLBACK_CATEGORY);
  }
  const result = await remove(cat.id);
  if (result.ok) {
    toast.success(`Categoría "${cat.label}" eliminada`);
  } else if (result.reason === "locked") {
    toast.error(`"${cat.label}" no se puede eliminar`);
  }
};
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-70 flex items-end sm:items-center justify-center p-0 sm:p-4"
  >
    <div
      class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      @click="emit('close')"
    ></div>
    <div
      class="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-card text-card-foreground p-6 shadow-2xl border border-border ring-1 ring-black/5 max-h-[85vh] flex flex-col"
    >
      <div class="flex items-start justify-between mb-4 shrink-0">
        <div>
          <h2 class="text-lg font-bold text-foreground">
            Categorías
          </h2>
          <p class="text-xs text-muted-foreground mt-0.5">
            Crea, renombra o elimina categorías.
          </p>
        </div>
        <button
          @click="emit('close')"
          class="text-muted-foreground hover:text-foreground -mr-1 -mt-1 p-1"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <!-- Add new / Edit current (shared form, label + icon picker) -->
      <div class="mb-4 shrink-0">
        <div class="flex gap-2 mb-2">
          <input
            v-model="formLabel"
            @keydown.enter="submitForm"
            type="text"
            :placeholder="editingId ? 'Nombre…' : 'Nueva categoría…'"
            maxlength="32"
            class="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary text-foreground border border-transparent focus:border-foreground focus:outline-none placeholder:text-muted-foreground/50"
          />
          <button
            @click="submitForm"
            :disabled="!isFormValid"
            class="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          >
            {{ editingId ? "Guardar" : "Agregar" }}
          </button>
          <button
            v-if="editingId"
            @click="cancelEdit"
            class="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] text-muted-foreground mr-1 shrink-0">
            Ícono:
          </span>
          <div class="relative flex-1 min-w-0">
            <div
              ref="iconScrollerRef"
              @scroll="onIconScroll"
              class="icon-scroller flex items-center gap-1 overflow-x-auto no-scrollbar"
              :class="{
                'mask-fade-left': iconScrollLeft,
                'mask-fade-right': iconScrollRight,
                'mask-fade-both': iconScrollLeft && iconScrollRight,
                'mask-fade-none': !iconScrollLeft && !iconScrollRight,
              }"
            >
              <button
                v-for="opt in ICON_OPTIONS"
                :key="opt.id"
                @click="formIcon = opt.svg"
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-md border transition-colors shrink-0"
                :class="
                  formIcon === opt.svg
                    ? 'border-foreground bg-foreground/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/40'
                "
                :aria-label="`Ícono ${opt.id}`"
              >
                <span class="w-3.5 h-3.5" v-html="opt.svg"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- List (pointer-based drag — works in browser AND Tauri WebViews) -->
      <div
        class="flex-1 overflow-y-auto -mx-1 px-1 space-y-1"
        @pointermove="onItemPointerMove"
        @pointerup="onItemPointerUp"
        @pointercancel="onItemPointerCancel"
      >
        <div
          v-for="(cat, index) in categoryItems"
          :key="cat.id"
          @pointerdown="onItemPointerDown($event, index)"
          @pointerenter="onItemPointerEnter(index)"
          @dragstart="suppressNativeDrag"
          class="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-secondary group cursor-grab active:cursor-grabbing select-none transition-colors"
          :class="{
            'bg-secondary': editingId === cat.id,
            'opacity-40': dragSrcIndex === index,
            'ring-1 ring-primary/40': dragOverIndex === index && dragSrcIndex !== index,
          }"
        >
          <span
            class="drag-handle flex items-center justify-center w-5 h-7 text-muted-foreground shrink-0"
            aria-hidden="true"
          >
            <svg
              class="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="9" cy="6" r="1.5" />
              <circle cx="15" cy="6" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="18" r="1.5" />
              <circle cx="15" cy="18" r="1.5" />
            </svg>
          </span>
          <span
            class="flex items-center justify-center w-7 h-7 text-foreground/80"
            v-html="cat.icon"
          ></span>
          <button
            @click="startEdit(cat)"
            :disabled="isLocked(cat.id)"
            class="flex-1 text-left text-sm font-medium text-foreground truncate"
            :class="{ 'cursor-default': isLocked(cat.id) }"
          >
            {{ cat.label }}
          </button>
          <span class="text-[11px] text-muted-foreground tabular-nums">
            {{ categoryCounts[cat.id] || 0 }}
          </span>
          <button
            v-if="!isLocked(cat.id)"
            @click="handleRemove(cat)"
            class="p-1 text-muted-foreground/60 hover:text-destructive sm:opacity-100 transition-colors"
            :aria-label="`Eliminar ${cat.label}`"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide native scrollbar — keep swipe/scroll functional. */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Lateral fade masks — visually signal there's more content in that
   direction. Each class activates one or both edges via mask-image. */
.icon-scroller {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 24px,
    #000 calc(100% - 24px),
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0,
    #000 24px,
    #000 calc(100% - 24px),
    transparent 100%
  );
}
.icon-scroller.mask-fade-left {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 24px, #000 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 24px, #000 100%);
}
.icon-scroller.mask-fade-right {
  -webkit-mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 24px), transparent 100%);
  mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 24px), transparent 100%);
}
.icon-scroller.mask-fade-none {
  -webkit-mask-image: none;
  mask-image: none;
}
</style>
