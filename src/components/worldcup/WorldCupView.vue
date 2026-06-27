<script setup>
import { onMounted } from "vue";
import { toast } from "vue3-toastify";
import { useWorldCupFixtures } from "../../composables/use-worldcup-fixtures.js";
import { syncFixturesToCalendar } from "../../composables/useWorldcupSync.js";
import { useTodos } from "../../composables/useTodos";
import { formatWorldcupDay, formatWorldcupDaySub } from "../../utils/format-worldcup-day.js";
import FixtureCard from "./FixtureCard.vue";

const emit = defineEmits(["view-change"]);

const {
  fixtures,
  groupedByDay,
  loading,
  error,
  lastFetchedAt,
  refresh,
  loadFromCache,
} = useWorldCupFixtures();

const { todos, addTodo } = useTodos();

// Idempotently insert any missing fixtures into the todo store. Fires a
// toast only when at least one new match was added — repeated visits are
// silent. No-op when fixtures is empty (no API key / first run / API error).
const runSync = async () => {
  if (!fixtures.value || fixtures.value.length === 0) return;
  const { inserted } = await syncFixturesToCalendar({
    fixtures: fixtures.value,
    getTodos: () => todos.value,
    addTodo,
  });
  if (inserted > 0) {
    toast.success(`${inserted} partidos agregados al calendario`);
  }
};

const onManualRefresh = async () => {
  await refresh(true);
  await runSync();
};

// Instant render from persistent cache, then refresh in background if stale,
// then sync new fixtures to the calendar. Sync runs ONCE per mount — even
// if refresh resolves early via the TTL cache hit, fixtures.value is
// already populated from loadFromCache so the dedup Set will short-circuit.
onMounted(async () => {
  await loadFromCache();
  await refresh(false);
  await runSync();
});

const lastFetchedLabel = () => {
  if (!lastFetchedAt.value) return "—";
  const diffMin = Math.round((Date.now() - lastFetchedAt.value) / 60000);
  if (diffMin < 1) return "hace instantes";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  return `hace ${diffH} h`;
};
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col">
    <header class="px-4 pt-6 pb-3 border-b border-border">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">Mundial 2026</h1>
          <p class="text-xs text-muted-foreground">
            Calendario oficial · API-Football
          </p>
        </div>
        <button
          @click="onManualRefresh"
          :disabled="loading"
          class="text-xs px-3 py-1.5 rounded bg-secondary text-foreground disabled:opacity-50"
          :aria-label="loading ? 'Actualizando' : 'Actualizar fixtures'"
        >
          {{ loading ? "Cargando…" : "Actualizar" }}
        </button>
      </div>
      <p v-if="lastFetchedAt" class="text-[10px] text-muted-foreground mt-1">
        Última actualización: {{ lastFetchedLabel() }}
      </p>
    </header>

    <main class="flex-1 overflow-y-auto px-3 py-3 space-y-5">
      <!-- Error / empty / not-configured states -->
      <div
        v-if="error"
        class="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive p-3 text-sm"
      >
        {{ error }}
      </div>

      <div
        v-else-if="!loading && groupedByDay.length === 0"
        class="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground"
      >
        Calendario no disponible aún. La API-Football suele publicar los
        fixtures del mundial unos meses antes del torneo. Vuelve a
        intentarlo más tarde.
      </div>

      <div
        v-else-if="loading && groupedByDay.length === 0"
        class="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground"
      >
        Cargando fixture(s)…
      </div>

      <section
        v-for="day in groupedByDay"
        :key="day.date"
        class="space-y-2"
      >
        <header class="flex items-baseline justify-between px-1">
          <h2 class="text-sm font-semibold text-foreground capitalize tracking-tight">
            {{ formatWorldcupDay(day.date) }}
          </h2>
          <span class="text-[11px] font-medium text-muted-foreground capitalize">
            {{ formatWorldcupDaySub(day.date) }}
          </span>
        </header>
        <div class="space-y-2">
          <FixtureCard
            v-for="fx in day.list"
            :key="fx.fixture?.id"
            :fixture="fx"
          />
        </div>
      </section>
    </main>

    <footer class="border-t border-border px-4 py-3 text-center">
      <button
        @click="emit('view-change', 'todos')"
        class="text-xs text-muted-foreground hover:text-foreground"
      >
        ← Volver a TODOs
      </button>
    </footer>
  </div>
</template>
