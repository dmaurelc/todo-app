<script setup>
import { computed } from "vue";

const props = defineProps({
  fixture: { type: Object, required: true },
});

// API returns kickoff in UTC. Display in user's local timezone.
const kickoff = computed(() => {
  const iso = props.fixture?.fixture?.date;
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const home = computed(() => props.fixture?.teams?.home || {});
const away = computed(() => props.fixture?.teams?.away || {});
const goals = computed(() => props.fixture?.goals || {});
const status = computed(() => props.fixture?.fixture?.status?.short || "NS");
const round = computed(() => props.fixture?.league?.round || "");
// Stadium lives on league in the bundled JSON; api-football keeps it on
// a different field. Normalize.
const stadium = computed(
  () => props.fixture?.league?.stadium || props.fixture?.fixture?.venue?.name || ""
);

const statusLabel = computed(() => {
  switch (status.value) {
    case "1H":
    case "2H":
    case "ET":
    case "P":
      return "EN VIVO";
    case "HT":
      return "MEDIO TIEMPO";
    case "FT":
      return "Final";
    case "NS":
      return kickoff.value;
    default:
      return status.value;
  }
});

const live = computed(() =>
  ["1H", "2H", "HT", "ET", "P"].includes(status.value)
);
</script>

<template>
  <article
    class="rounded-xl border border-border bg-card text-card-foreground p-3 flex flex-col gap-2"
  >
    <div class="flex items-center justify-between text-xs text-muted-foreground">
      <span class="flex items-center gap-2 truncate">
        <span>{{ kickoff }}</span>
        <span
          v-if="round"
          class="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium tracking-wide text-[10px] uppercase truncate"
        >
          {{ round }}
        </span>
      </span>
      <span
        v-if="live"
        class="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-semibold tracking-wide"
      >
        {{ statusLabel }}
      </span>
      <span v-else class="font-medium">{{ statusLabel }}</span>
    </div>

    <p
      v-if="stadium"
      class="text-[11px] text-muted-foreground truncate -mt-1"
    >
      {{ stadium }}
    </p>

    <div class="flex items-center gap-3">
      <div class="flex-1 flex items-center gap-2 min-w-0">
        <img
          v-if="home.logo"
          :src="home.logo"
          :alt="home.name || 'home'"
          class="w-5 h-5 shrink-0"
          loading="lazy"
        />
        <span class="truncate text-sm">{{ home.name || "Local" }}</span>
      </div>
      <span class="text-base font-bold tabular-nums">
        {{ goals.home ?? "-" }} - {{ goals.away ?? "-" }}
      </span>
      <div class="flex-1 flex items-center gap-2 min-w-0 justify-end">
        <span class="truncate text-sm text-right">{{ away.name || "Visita" }}</span>
        <img
          v-if="away.logo"
          :src="away.logo"
          :alt="away.name || 'away'"
          class="w-5 h-5 shrink-0"
          loading="lazy"
        />
      </div>
    </div>
  </article>
</template>
