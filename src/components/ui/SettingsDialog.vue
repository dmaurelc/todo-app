<script setup>
import { ref, watch } from "vue";
import { useTauriCommand } from "../../composables/use-tauri-command.js";
import { storage } from "../../composables/use-storage-adapter.js";
import {
  createApiFootballClient,
  formatApiError,
} from "../../api/api-football-client.js";
import { fetchWorldCupFixtures } from "../../api/worldcup-fixtures-endpoint.js";

const props = defineProps({
  open: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "open-categories"]);

const { call } = useTauriCommand();
const appInfo = ref(null);
const storagePath = ref(null);
const loading = ref(false);
const copied = ref(false);

// World Cup 2026 — RapidAPI key (stored in tauri-plugin-store / localStorage).
// Never commit a real key. .env provides a dev fallback loaded below.
const RAPIDAPI_KEY_STORE = "worldcup.apiKey";
const rapidApiKey = ref("");
const testingApi = ref(false);
const testResult = ref(null);

const loadRapidApiKey = async () => {
  const stored = await storage.get(RAPIDAPI_KEY_STORE);
  if (stored) rapidApiKey.value = stored;
  // Dev fallback: read from import.meta.env if no stored key.
  // import.meta.env.VITE_RAPIDAPI_KEY is inlined at build time only when set.
  if (!rapidApiKey.value) {
    const envKey = import.meta?.env?.VITE_API_FOOTBALL_KEY;
    if (envKey && envKey !== "__REPLACE_ME__") rapidApiKey.value = envKey;
  }
};

const saveRapidApiKey = async () => {
  await storage.set(RAPIDAPI_KEY_STORE, rapidApiKey.value.trim());
  testResult.value = null;
};

const testRapidApi = async () => {
  testingApi.value = true;
  testResult.value = null;
  try {
    if (!rapidApiKey.value.trim()) {
      testResult.value = { ok: false, message: "Ingresa una key primero" };
      return;
    }
    const client = createApiFootballClient({ apiKey: rapidApiKey.value.trim() });
    const body = await fetchWorldCupFixtures(client);
    const count = Array.isArray(body?.response) ? body.response.length : 0;
    testResult.value = {
      ok: true,
      message: `Conexión OK — ${count} fixture(s) encontrados`,
    };
  } catch (err) {
    testResult.value = { ok: false, message: formatApiError(err) };
  } finally {
    testingApi.value = false;
  }
};

watch(
  () => props.open,
  async (isOpen) => {
    if (!isOpen) return;
    loadRapidApiKey();
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

        <div class="border-t border-border my-3"></div>

        <!-- World Cup 2026 — API-Football key (api-football.com direct,
             not via RapidAPI). Stored in tauri-plugin-store (desktop)
             or localStorage (web). Never committed. .env provides a
             dev fallback via VITE_RAPIDAPI_KEY for legacy setups. -->
        <div class="px-1">
          <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Mundial 2026
          </h3>
          <div class="space-y-2 text-sm">
            <label class="block">
              <span class="text-muted-foreground">API-Football key</span>
              <a
                href="https://dashboard.api-football.com/"
                target="_blank"
                rel="noopener"
                class="text-[10px] text-muted-foreground hover:text-foreground ml-1 underline"
              >
                Obtener gratis
              </a>
              <input
                v-model="rapidApiKey"
                type="password"
                autocomplete="off"
                placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                class="mt-1 w-full px-2 py-1.5 text-xs rounded bg-secondary text-foreground font-mono"
              />
            </label>
            <div class="flex gap-2">
              <button
                @click="saveRapidApiKey"
                class="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground"
              >
                Guardar
              </button>
              <button
                @click="testRapidApi"
                :disabled="testingApi"
                class="text-xs px-3 py-1.5 rounded bg-secondary text-foreground disabled:opacity-50"
              >
                {{ testingApi ? "Probando…" : "Probar conexión" }}
              </button>
            </div>
            <p
              v-if="testResult"
              class="text-xs"
              :class="testResult.ok ? 'text-emerald-500' : 'text-destructive'"
            >
              {{ testResult.message }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
