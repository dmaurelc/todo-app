<script setup>
import { ref, watch } from "vue";
import { useTauriCommand } from "../../composables/use-tauri-command.js";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "open-categories"]);

const { call } = useTauriCommand();
const appInfo = ref(null);
const storagePath = ref(null);
const loading = ref(false);
const copied = ref(false);

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    loading.value = true;
    copied.value = false;
    const [infoRes, pathRes] = await Promise.all([
      call("app_info"),
      call("get_storage_path"),
    ]);
    appInfo.value = infoRes.data;
    storagePath.value = pathRes.data;
    loading.value = false;
  },
  { immediate: true }
);

const copyPath = async () => {
  if (!storagePath.value) return;
  try {
    await navigator.clipboard.writeText(storagePath.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    // Clipboard may be unavailable in some WebView contexts; silently ignore.
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
        <h2 class="text-lg font-bold text-foreground">
          Ajustes
        </h2>
        <button
          @click="emit('close')"
          class="text-muted-foreground hover:text-foreground -mr-1 -mt-1 p-1"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 overflow-y-auto -mx-1 px-1 space-y-3">
        <!-- Categories shortcut -->
        <button
          @click="emit('open-categories'); emit('close')"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <svg
            class="w-4 h-4 text-muted-foreground shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span class="flex-1">Categorías</span>
          <span class="text-muted-foreground">›</span>
        </button>

        <div class="border-t border-border my-3"></div>

        <!-- About section -->
        <div class="px-1">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Acerca de
          </h3>

          <div v-if="loading" class="text-sm text-muted-foreground">
            Cargando…
          </div>

          <div v-else-if="appInfo" class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">App</span>
              <span class="font-medium text-foreground">
                {{ appInfo.name }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Versión</span>
              <span class="font-mono text-foreground">
                {{ appInfo.version }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">OS</span>
              <span class="font-mono text-foreground">
                {{ appInfo.os }}
              </span>
            </div>

            <div class="pt-2">
              <div class="text-muted-foreground text-xs mb-1">
                Ruta de almacenamiento
              </div>
              <div class="flex items-center gap-2">
                <code
                  class="flex-1 text-xs break-all rounded bg-secondary px-2 py-1.5 text-foreground/80"
                >
                  {{ storagePath || "(no disponible — Tauri no detectado)" }}
                </code>
                <button
                  v-if="storagePath"
                  @click="copyPath"
                  class="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 shrink-0 min-w-14.5"
                >
                  {{ copied ? "¡Listo!" : "Copiar" }}
                </button>
              </div>
            </div>
          </div>

          <div v-else class="text-sm text-muted-foreground">
            Información nativa no disponible (no se está ejecutando dentro de Tauri).
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
