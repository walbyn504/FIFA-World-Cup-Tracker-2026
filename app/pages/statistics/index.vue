<template>
  <div class="h-screen overflow-hidden px-6 py-6 text-[#F5F0E6]">
    <div class="stats-scroll mx-auto flex h-full max-w-6xl flex-col overflow-y-auto">
      <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide text-white">Estadísticas</h1>
          <p class="text-sm text-white/60">Un vistazo general al rendimiento de las selecciones en el torneo.</p>
        </div>
        <UiRefreshButton :loading="isLoading" @click="loadStats" />
      </div>

      <UiGlassCard v-if="isLoading" class="w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Cargando estadísticas...</p>
      </UiGlassCard>

      <UiGlassCard v-else-if="hasError" class="w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-300">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">No se pudieron cargar las estadísticas</p>
          <p class="mt-1 text-sm text-white/60">Ocurrió un problema al conectar con el servidor.</p>
        </div>
        <button
          class="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
          @click="loadStats"
        >
          Reintentar
        </button>
      </UiGlassCard>

      <div v-else class="flex flex-1 flex-col justify-start gap-4">
        <!-- Rubro: Selecciones destacadas -->
        <section>
          <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-white">Selecciones destacadas</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Selección con más goles -->
            <UiGlassCard content-class="relative flex flex-col items-center gap-2 overflow-hidden px-6 py-5 text-center">
              <svg class="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 text-[#D4AF37]/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M3 21V3h18v9" />
                <path d="M3 9h18M3 15h9" />
              </svg>
              <div class="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#F3D77A] to-[#9c7a1a] text-[#04140D] shadow-lg shadow-black/30 ring-2 ring-[#D4AF37]/40">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 21V3h18v9" />
                  <path d="M3 9h18M3 15h9" />
                </svg>
              </div>
              <p class="relative text-xs font-semibold uppercase tracking-wider text-white/50">Selección con más goles</p>
              <ul v-if="topScoringTeams.length" class="relative flex flex-col items-center gap-1.5">
                <li v-for="team in topScoringTeams" :key="team.name" class="flex items-center gap-2">
                  <img
                    v-if="team.flag"
                    :src="team.flag"
                    :alt="`Bandera de ${team.name}`"
                    class="h-6 w-9 shrink-0 rounded border border-white/20 object-cover"
                  >
                  <p class="truncate font-['Bebas_Neue'] text-2xl tracking-wide text-white">{{ team.name }}</p>
                </li>
              </ul>
              <p v-else class="relative font-['Bebas_Neue'] text-2xl tracking-wide text-white">—</p>
              <span
                v-if="topScoringTeams.length"
                class="relative rounded-full bg-[#D4AF37]/15 px-3 py-1 text-sm font-semibold text-[#D4AF37]"
              >
                {{ topScoringTeams[0]?.goals }} goles anotados
              </span>
            </UiGlassCard>

            <!-- Selección menos goleada -->
            <UiGlassCard content-class="relative flex flex-col items-center gap-2 overflow-hidden px-6 py-5 text-center">
              <svg class="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 text-sky-400/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
              </svg>
              <div class="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-700 text-white shadow-lg shadow-black/30 ring-2 ring-sky-300/30">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
                </svg>
              </div>
              <p class="relative text-xs font-semibold uppercase tracking-wider text-white/50">Selección menos goleada</p>
              <ul v-if="leastConcededTeams.length" class="relative flex flex-col items-center gap-1.5">
                <li v-for="team in leastConcededTeams" :key="team.name" class="flex items-center gap-2">
                  <img
                    v-if="team.flag"
                    :src="team.flag"
                    :alt="`Bandera de ${team.name}`"
                    class="h-6 w-9 shrink-0 rounded border border-white/20 object-cover"
                  >
                  <p class="truncate font-['Bebas_Neue'] text-2xl tracking-wide text-white">{{ team.name }}</p>
                </li>
              </ul>
              <p v-else class="relative font-['Bebas_Neue'] text-2xl tracking-wide text-white">—</p>
              <span
                v-if="leastConcededTeams.length"
                class="relative rounded-full bg-sky-400/15 px-3 py-1 text-sm font-semibold text-sky-300"
              >
                {{ leastConcededTeams[0]?.goalsAgainst }} goles recibidos
              </span>
            </UiGlassCard>
          </div>
        </section>

        <!-- Rubro: Goleador del torneo -->
        <section>
          <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-white">Goleador del torneo</h2>
          <UiGlassCard content-class="relative flex items-center gap-4 overflow-hidden px-6 py-5 text-left">
            <svg class="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 text-[#D4AF37]/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7l3 2-1 4h-4l-1-4z" />
              <path d="M12 3v4M3 12h4M17 12h4M6 6l3 2M18 6l-3 2M6 18l3-2M18 18l-3-2" />
            </svg>
            <div class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F3D77A] to-[#9c7a1a] text-[#04140D] shadow-lg shadow-black/30 ring-2 ring-[#D4AF37]/40">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7l3 2-1 4h-4l-1-4z" />
              </svg>
            </div>
            <div class="relative min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-white/50">
                  {{ topScorers.length > 1 ? 'Máximos goleadores' : 'Máximo goleador' }}
                </p>
                <span
                  v-if="topScorers.length"
                  class="shrink-0 rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-semibold text-[#D4AF37]"
                >
                  {{ topScorers[0]?.goals }} {{ topScorers[0]?.goals === 1 ? 'gol' : 'goles' }}
                </span>
              </div>
              <ul v-if="topScorers.length" class="mt-1.5 flex flex-col gap-1.5">
                <li v-for="scorer in topScorers" :key="scorer.playerId" class="flex min-w-0 items-center gap-2">
                  <img
                    v-if="scorer.flag"
                    :src="scorer.flag"
                    :alt="`Bandera de ${scorer.teamName}`"
                    class="h-5 w-7 shrink-0 rounded border border-white/20 object-cover"
                  >
                  <p class="truncate font-['Bebas_Neue'] text-xl tracking-wide text-white">{{ scorer.playerName }}</p>
                  <span class="shrink-0 truncate text-xs text-white/50">{{ scorer.teamName }}</span>
                </li>
              </ul>
              <p v-else class="mt-1 font-['Bebas_Neue'] text-2xl tracking-wide text-white">—</p>
            </div>
          </UiGlassCard>
        </section>

        <!-- Rubro: Panorama del torneo -->
        <section>
          <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-white">Panorama del torneo</h2>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Partidos disputados -->
            <UiGlassCard content-class="relative flex items-center gap-4 overflow-hidden px-5 py-4 text-left">
              <svg class="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-emerald-400/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
              <div class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-white shadow-lg shadow-black/30 ring-2 ring-emerald-300/30">
                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
              </div>
              <div class="relative min-w-0">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-white/50">Partidos disputados</p>
                <p class="truncate font-['Bebas_Neue'] text-3xl tracking-wide text-white">{{ matchesPlayed }}</p>
              </div>
            </UiGlassCard>

            <!-- Promedio de goles -->
            <UiGlassCard content-class="relative flex items-center gap-4 overflow-hidden px-5 py-4 text-left">
              <svg class="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-amber-400/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M4 20V10M12 20V4M20 20v-6" />
              </svg>
              <div class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#04140D] shadow-lg shadow-black/30 ring-2 ring-amber-200/30">
                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 20V10M12 20V4M20 20v-6" />
                </svg>
              </div>
              <div class="relative min-w-0">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-white/50">Promedio de goles</p>
                <p class="truncate font-['Bebas_Neue'] text-3xl tracking-wide text-white">{{ averageGoals.toFixed(2) }}</p>
              </div>
            </UiGlassCard>
          </div>
        </section>

        <!-- Rubro: Resultados -->
        <section>
          <h2 class="mb-2 text-xs font-semibold uppercase tracking-wider text-white">Resultados</h2>
          <UiGlassCard class="w-full" content-class="flex flex-col gap-3 px-6 py-4 text-left">
            <div class="flex items-center gap-2">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-700 text-white shadow shadow-black/30 ring-2 ring-violet-300/30">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="7" cy="7" r="2.5" />
                  <circle cx="17" cy="17" r="2.5" />
                  <path d="M17 7 7 17" />
                </svg>
              </div>
              <h3 class="font-['Bebas_Neue'] text-2xl tracking-wide text-white">Porcentaje de victorias</h3>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex items-baseline justify-between">
                <span class="text-xs uppercase tracking-wider text-white/50">Partidos con ganador (sin empates)</span>
                <span class="font-['Bebas_Neue'] text-3xl tracking-wide text-white">{{ winPercentage.toFixed(1) }}%</span>
              </div>
              <div class="h-4 w-full overflow-hidden rounded-full bg-violet-400/10">
                <div
                  class="h-4 rounded-full bg-gradient-to-r from-violet-400 to-violet-700"
                  :style="{ width: `${winPercentage}%` }"
                />
              </div>
            </div>
          </UiGlassCard>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { getAllMatches } = useMatches()
const { getOverallTeamStats, getTopScorers } = useStandings()
const { error } = useNotify()

const isLoading = ref(true)
const hasError = ref(false)

const matchesPlayed = ref(0)
const averageGoals = ref(0)
const winPercentage = ref(0)
const topScoringTeams = ref<{ name: string, flag: string, goals: number }[]>([])
const leastConcededTeams = ref<{ name: string, flag: string, goalsAgainst: number }[]>([])
const topScorers = ref<Awaited<ReturnType<typeof getTopScorers>>>([])

// Carga las estadísticas generales del torneo
const loadStats = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [matches, teamStats, scorers] = await Promise.all([
      getAllMatches(),
      getOverallTeamStats(),
      getTopScorers()
    ])
    topScorers.value = scorers

    // Estadísticas de partidos jugados, promedio de goles y porcentaje de victorias
    const finishedMatches = matches.filter((m) => m.status === 'finished')
    matchesPlayed.value = finishedMatches.length

    // Calcula el promedio de goles por partido y el porcentaje de victorias
    const totalGoals = finishedMatches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)
    averageGoals.value = finishedMatches.length ? totalGoals / finishedMatches.length : 0

    // Calcula el porcentaje de victorias (partidos con un ganador)
    const decisiveMatches = finishedMatches.filter((m) => m.homeScore !== m.awayScore).length
    winPercentage.value = finishedMatches.length ? (decisiveMatches / finishedMatches.length) * 100 : 0

    // Selecciones con más goles y menos goles recibidos
    const playedTeams = teamStats.filter((t) => t.played > 0)

    // Selecciones con más goles
    if (playedTeams.length) {
      const maxGoalsFor = Math.max(...playedTeams.map((t) => t.goalsFor))
      topScoringTeams.value = playedTeams
        .filter((t) => t.goalsFor === maxGoalsFor)
        .map((t) => ({ name: t.teamName, flag: t.flag, goals: t.goalsFor }))

        // Selecciones con menos goles recibidos
      const minGoalsAgainst = Math.min(...playedTeams.map((t) => t.goalsAgainst))
      leastConcededTeams.value = playedTeams
        .filter((t) => t.goalsAgainst === minGoalsAgainst)
        .map((t) => ({ name: t.teamName, flag: t.flag, goalsAgainst: t.goalsAgainst }))
    } else {
      topScoringTeams.value = []
      leastConcededTeams.value = []
    }
  } catch (err) {
    hasError.value = true
    error('No se pudieron cargar las estadísticas. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStats)
</script>

<style scoped>
.stats-scroll {
  scrollbar-width: none;
}

.stats-scroll::-webkit-scrollbar {
  display: none;
}
</style>
