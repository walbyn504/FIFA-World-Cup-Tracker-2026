<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="font-['Bebas_Neue'] text-4xl tracking-wide text-white">Mis Predicciones</h1>
          <p class="text-sm text-white/60">Todo lo que predijiste a lo largo del torneo, con tu desempeño en cada una</p>
        </div>
        <div class="flex items-center gap-3">
          <UiRefreshButton :loading="isLoading" @click="loadHistory" />
          <UiGlassCard content-class="flex flex-col items-center gap-0 px-4 py-2">
            <p class="text-[10px] uppercase tracking-wide text-white/50">Puntos totales</p>
            <p class="text-xl font-bold text-yellow-300">{{ authStore.user?.points ?? 0 }}</p>
          </UiGlassCard>
        </div>
      </div>

      <UiGlassCard v-if="isLoading" class="w-full py-12">
        <div class="flex flex-col items-center justify-center gap-3">
          <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
            <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
          <p class="text-white/60">Cargando tus predicciones...</p>
        </div>
      </UiGlassCard>

      <UiGlassCard v-else-if="hasError" class="w-full py-8">
        <div class="flex flex-col items-center gap-3 text-center">
          <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-300">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <div>
            <p class="font-medium text-white">No se pudieron cargar tus predicciones</p>
            <p class="mt-1 text-sm text-white/60">Ocurrió un error al obtener la información desde el servidor.</p>
          </div>
          <button
            class="mt-2 rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
            @click="loadHistory"
          >
            Reintentar
          </button>
        </div>
      </UiGlassCard>

      <UiGlassCard v-else-if="history.length === 0" class="w-full py-12">
        <div class="flex flex-col items-center justify-center text-center">
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          </div>
          <p class="font-medium text-white">Todavía no hiciste ninguna predicción</p>
          <p class="mt-1 text-sm text-white/60">Andá a Predicciones y elegí el resultado de un partido programado.</p>
        </div>
      </UiGlassCard>

      <ul v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="item in paginatedHistory" :key="item.prediction.id">
          <UiGlassCard class="w-full" content-class="flex flex-col gap-2 px-5 py-4 text-left">
            <div class="flex items-center justify-between text-xs text-white/60">
              <span>{{ item.match.stage }}<span v-if="item.match.group"> · Grupo {{ item.match.group }}</span></span>
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusBadgeClass(item.match.status)"
              >
                {{ matchStatusLabels[item.match.status] }}
              </span>
            </div>

            <div class="flex items-center gap-2 text-lg text-white">
              <img
                v-if="teamFlag(item.match.homeTeam)"
                :src="teamFlag(item.match.homeTeam)"
                :alt="`Bandera de ${item.match.homeTeam}`"
                class="h-5 w-7 shrink-0 rounded object-cover border border-white/20"
              >
              <strong class="truncate">{{ item.match.homeTeam }}</strong>
              <span class="shrink-0 text-sm text-white/40">vs</span>
              <strong class="truncate">{{ item.match.awayTeam }}</strong>
              <img
                v-if="teamFlag(item.match.awayTeam)"
                :src="teamFlag(item.match.awayTeam)"
                :alt="`Bandera de ${item.match.awayTeam}`"
                class="h-5 w-7 shrink-0 rounded object-cover border border-white/20"
              >
            </div>

            <div class="flex items-center justify-between">
              <div class="text-sm text-white/70">
                <p>Tu predicción: <span class="font-semibold text-[#D4AF37]">{{ item.prediction.homePrediction }} - {{ item.prediction.awayPrediction }}</span></p>
                <p v-if="item.match.status === 'finished'">
                  Resultado real: <span class="font-semibold text-white">{{ item.match.homeScore }} - {{ item.match.awayScore }}</span>
                </p>
              </div>
              <span
                v-if="item.match.status === 'finished'"
                class="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold"
                :class="item.prediction.pointsEarned > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/15 text-red-300'"
              >
                +{{ item.prediction.pointsEarned }} pts
              </span>
            </div>
          </UiGlassCard>
        </li>
      </ul>

      <UiPagination
        v-if="!isLoading && !hasError"
        v-model="currentPage"
        :total-items="history.length"
        :items-per-page="itemsPerPage"
        class="mt-6"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Match, MatchStatus } from '~~/shared/types/match'
import type { Team } from '~~/shared/types/team'
import type { Prediction } from '~~/shared/types/prediction'
import { matchStatusLabels } from '~/utils/matchOptions'

definePageMeta({
  middleware: 'auth'
})

const { getAllMatches } = useMatches()
const { getAllTeams } = useTeams()
const { getPredictionsByUser, calculatePoints, updatePrediction } = usePredictions()
const authStore = useAuthStore()
const { error } = useNotify()

const isLoading = ref(true)
const hasError = ref(false)
const teams = ref<(Team & { id: string })[]>([])

interface HistoryItem {
  prediction: Prediction & { id: string }
  match: Match & { id: string }
}

const history = ref<HistoryItem[]>([])

const itemsPerPage = 6
const currentPage = ref(1)

// Vuelve a la primera página cada vez que cambia el historial
watch(history, () => {
  currentPage.value = 1
})

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return history.value.slice(start, start + itemsPerPage)
})

const teamFlag = (teamName: string) => teams.value.find((t) => t.name === teamName)?.flag ?? ''

const statusBadgeClass = (status: MatchStatus) => ({
  scheduled: 'bg-white/10 text-white/70',
  live: 'bg-red-500/20 text-red-300',
  finished: 'bg-emerald-500/20 text-emerald-300'
}[status])

// En vivo primero, luego programados (más próximo primero), luego finalizados (más reciente primero)
const statusOrder: Record<MatchStatus, number> = { live: 0, scheduled: 1, finished: 2 }

const loadHistory = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [allMatches, allTeams, ownPredictions] = await Promise.all([
      getAllMatches(),
      getAllTeams(),
      authStore.user ? getPredictionsByUser(authStore.user.uid) : Promise.resolve([])
    ])
    teams.value = allTeams

    const items: HistoryItem[] = []
    for (const prediction of ownPredictions) {
      const match = allMatches.find((m) => m.id === prediction.matchId)
      if (!match) continue

      // Aprovecha para dejar el puntaje al día si el partido ya terminó
      if (match.status === 'finished') {
        const points = calculatePoints(prediction, match)
        if (points !== prediction.pointsEarned) {
          await updatePrediction(prediction.id, { pointsEarned: points })
          prediction.pointsEarned = points
        }
      }

      items.push({ prediction, match })
    }

    items.sort((a, b) => {
      const statusDiff = statusOrder[a.match.status] - statusOrder[b.match.status]
      if (statusDiff !== 0) return statusDiff

      const timeDiff = a.match.kickoff.toMillis() - b.match.kickoff.toMillis()
      return a.match.status === 'finished' ? -timeDiff : timeDiff
    })

    history.value = items
  } catch (err) {
    hasError.value = true
    error('No se pudieron cargar tus predicciones. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadHistory)
</script>
