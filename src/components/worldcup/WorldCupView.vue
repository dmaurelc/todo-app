<script setup>
import { onMounted } from "vue";
import { useWorldCupFixtures } from "../../composables/use-worldcup-fixtures.js";
import FixtureCard from "./FixtureCard.vue";

const emit = defineEmits(["view-change"]);

const {
  groupedByMatchday,
  loading,
  error,
  lastFetchedAt,
  refresh,
  loadFromCache,
} = useWorldCupFixtures();

// Instant render from persistent cache, then refresh in background if stale.
onMounted(async () => {
  await loadFromCache();
  await refresh(false);
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
          @click="refresh(true)"
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
        v-else-if="!loading && groupedByMatchday.length === 0"
        class="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground"
      >
        Calendario no disponible aún. La API-Football suele publicar los
        fixtures del mundial unos meses antes del torneo. Vuelve a
        intentarlo más tarde.
      </div>

      <div
        v-else-if="loading && groupedByMatchday.length === 0"
        class="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground"
      >
        Cargando fixture(s)…
      </div>

      <section
        v-for="group in groupedByMatchday"
        :key="group.round"
        class="space-y-2"
      >
        <h2 class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {{ group.round }}
        </h2>
        <div class="space-y-2">
          <FixtureCard
            v-for="fx in group.list"
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
