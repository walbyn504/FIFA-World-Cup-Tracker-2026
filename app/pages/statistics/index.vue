<template>
  <div class="h-screen overflow-hidden px-6 py-6 text-[#F5F0E6]">
    <div class="mx-auto flex h-full max-w-6xl flex-col overflow-y-auto">
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
              <div v-if="topScoringTeam" class="relative flex items-center gap-2">
                <img
                  v-if="topScoringTeam.flag"
                  :src="topScoringTeam.flag"
                  :alt="`Bandera de ${topScoringTeam.name}`"
                  class="h-6 w-9 shrink-0 rounded border border-white/20 object-cover"
                >
                <p class="truncate font-['Bebas_Neue'] text-2xl tracking-wide text-white">{{ topScoringTeam.name }}</p>
              </div>
              <p v-else class="relative font-['Bebas_Neue'] text-2xl tracking-wide text-white">—</p>
              <span
                v-if="topScoringTeam"
                class="relative rounded-full bg-[#D4AF37]/15 px-3 py-1 text-sm font-semibold text-[#D4AF37]"
              >
                {{ topScoringTeam.goals }} goles anotados
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
              <div v-if="leastConcededTeam" class="relative flex items-center gap-2">
                <img
                  v-if="leastConcededTeam.flag"
                  :src="leastConcededTeam.flag"
                  :alt="`Bandera de ${leastConcededTeam.name}`"
                  class="h-6 w-9 shrink-0 rounded border border-white/20 object-cover"
                >
                <p class="truncate font-['Bebas_Neue'] text-2xl tracking-wide text-white">{{ leastConcededTeam.name }}</p>
              </div>
              <p v-else class="relative font-['Bebas_Neue'] text-2xl tracking-wide text-white">—</p>
              <span
                v-if="leastConcededTeam"
                class="relative rounded-full bg-sky-400/15 px-3 py-1 text-sm font-semibold text-sky-300"
              >
                {{ leastConcededTeam.goalsAgainst }} goles recibidos
              </span>
            </UiGlassCard>
          </div>
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
const { getAllMatches } = useMatches()
const { getOverallTeamStats } = useStandings()
const { error } = useNotify()

const isLoading = ref(true)
const hasError = ref(false)

const matchesPlayed = ref(0)
const averageGoals = ref(0)
const winPercentage = ref(0)
const topScoringTeam = ref<{ name: string, flag: string, goals: number } | null>(null)
const leastConcededTeam = ref<{ name: string, flag: string, goalsAgainst: number } | null>(null)

const loadStats = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [matches, teamStats] = await Promise.all([
      getAllMatches(),
      getOverallTeamStats()
    ])

    const finishedMatches = matches.filter((m) => m.status === 'finished')
    matchesPlayed.value = finishedMatches.length

    const totalGoals = finishedMatches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)
    averageGoals.value = finishedMatches.length ? totalGoals / finishedMatches.length : 0

    const decisiveMatches = finishedMatches.filter((m) => m.homeScore !== m.awayScore).length
    winPercentage.value = finishedMatches.length ? (decisiveMatches / finishedMatches.length) * 100 : 0

    const playedTeams = teamStats.filter((t) => t.played > 0)

    const mostGoals = playedTeams.reduce<typeof playedTeams[number] | null>(
      (top, team) => (!top || team.goalsFor > top.goalsFor ? team : top),
      null
    )
    topScoringTeam.value = mostGoals ? { name: mostGoals.teamName, flag: mostGoals.flag, goals: mostGoals.goalsFor } : null

    const leastConceded = playedTeams.reduce<typeof playedTeams[number] | null>(
      (best, team) => (!best || team.goalsAgainst < best.goalsAgainst ? team : best),
      null
    )
    leastConcededTeam.value = leastConceded
      ? { name: leastConceded.teamName, flag: leastConceded.flag, goalsAgainst: leastConceded.goalsAgainst }
      : null
  } catch (err) {
    hasError.value = true
    error('No se pudieron cargar las estadísticas. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStats)
</script>
