<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">Predicciones</h1>
        <UiRefreshButton :loading="isLoading" @click="loadPredictions" />
      </div>

      <div v-if="!hasError && matches.length > 0" class="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por selección..."
          class="flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
        >
        <select
          v-model="selectedStage"
          class="rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37]"
        >
          <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Todas las fases</option>
          <option
            v-for="stage in matchStages"
            :key="stage"
            :value="stage"
            class="bg-[#0F1F17] text-[#F5F0E6]"
          >
            {{ stage }}
          </option>
        </select>
        <select
          v-model="selectedStatus"
          class="rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37]"
        >
          <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Todos los estados</option>
          <option
            v-for="option in matchStatuses"
            :key="option.value"
            :value="option.value"
            class="bg-[#0F1F17] text-[#F5F0E6]"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <UiGlassCard v-if="isLoading" class="w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Cargando partidos...</p>
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
          <p class="font-medium text-white">No se pudieron cargar los partidos</p>
          <p class="mt-1 text-sm text-white/60">Ocurrió un problema al conectar con el servidor.</p>
        </div>
        <button
          class="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
          @click="loadPredictions"
        >
          Reintentar
        </button>
      </UiGlassCard>

      <UiGlassCard v-else-if="matches.length === 0" class="w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Todavía no hay partidos programados</p>
          <p class="mt-1 text-sm text-white/60">Cuando se agreguen partidos vas a poder predecir sus resultados acá.</p>
        </div>
      </UiGlassCard>

      <UiGlassCard v-else-if="filteredMatches.length === 0" class="w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/60">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Sin resultados</p>
          <p class="mt-1 text-sm text-white/60">Ningún partido coincide con la búsqueda o el filtro aplicado.</p>
        </div>
      </UiGlassCard>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="match in paginatedMatches" :key="match.id">
          <UiGlassCard class="w-full" content-class="flex items-center justify-between gap-4 px-5 py-4 text-left">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 text-xs text-white/60">
                <span>{{ match.stage }}</span>
                <span v-if="match.group">· Grupo {{ match.group }}</span>
                <span>· {{ formatKickoff(match.kickoff) }}</span>
              </div>
              <div class="mt-1 flex items-center gap-2 text-lg text-white">
                <img
                  v-if="teamFlag(match.homeTeam)"
                  :src="teamFlag(match.homeTeam)"
                  :alt="`Bandera de ${match.homeTeam}`"
                  class="h-5 w-7 shrink-0 rounded object-cover border border-white/20"
                >
                <strong class="truncate">{{ match.homeTeam }}</strong>
                <span class="shrink-0 text-sm text-white/40">vs</span>
                <strong class="truncate">{{ match.awayTeam }}</strong>
                <img
                  v-if="teamFlag(match.awayTeam)"
                  :src="teamFlag(match.awayTeam)"
                  :alt="`Bandera de ${match.awayTeam}`"
                  class="h-5 w-7 shrink-0 rounded object-cover border border-white/20"
                >
              </div>
              <div class="mt-1 text-sm text-white/60">
                <template v-if="predictionByMatch[match.id]">
                  Tu predicción:
                  <span class="font-semibold text-[#D4AF37]">
                    {{ predictionByMatch[match.id]!.homePrediction }} - {{ predictionByMatch[match.id]!.awayPrediction }}
                  </span>
                  <span v-if="match.status === 'finished'">
                    (+{{ predictionByMatch[match.id]!.pointsEarned }} pts)
                  </span>
                </template>
                <template v-else>
                  Todavía no hiciste tu predicción.
                </template>
              </div>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-2">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusBadgeClass(match.status)"
              >
                {{ matchStatusLabels[match.status] }}
              </span>
              <NuxtLink
                :to="`/predictions/${match.id}`"
                class="rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#04140D] transition hover:brightness-110"
              >
                {{ predictionButtonLabel(match) }}
              </NuxtLink>
            </div>
          </UiGlassCard>
        </li>
      </ul>

      <UiPagination
        v-if="!isLoading && !hasError"
        v-model="currentPage"
        :total-items="filteredMatches.length"
        :items-per-page="itemsPerPage"
        class="mt-6"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'
import type { Match, MatchStatus } from '~~/shared/types/match'
import type { Team } from '~~/shared/types/team'
import type { Prediction } from '~~/shared/types/prediction'
import { matchStages, matchStatuses, matchStatusLabels } from '~/utils/matchOptions'

definePageMeta({
  middleware: 'auth'
})

const { getAllMatches } = useMatches()
const { getAllTeams } = useTeams()
const { getPredictionsByUser, calculatePoints, updatePrediction } = usePredictions()
const authStore = useAuthStore()
const { updateProfile } = useAuth()
const { error } = useNotify()

const matches = ref<(Match & { id: string })[]>([])
const teams = ref<(Team & { id: string })[]>([])
const predictions = ref<(Prediction & { id: string })[]>([])
const isLoading = ref(true)
const hasError = ref(false)
const searchQuery = ref('')
const selectedStage = ref('')
const selectedStatus = ref<MatchStatus | ''>('')

// Predicción propia de cada partido, indexada por id de partido
const predictionByMatch = computed(() => {
  const map: Record<string, Prediction & { id: string }> = {}
  for (const prediction of predictions.value) map[prediction.matchId] = prediction
  return map
})

// Devuelve el nombre del equipo que ganó según la predicción de goles
const teamFlag = (teamName: string) => teams.value.find((t) => t.name === teamName)?.flag ?? ''

// Formatea la fecha y hora del partido a un string legible
const formatKickoff = (kickoff: Timestamp) =>
  kickoff.toDate().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Estilos de los badges de estado del partido
const statusBadgeClass = (status: MatchStatus) => ({
  scheduled: 'bg-white/10 text-white/70',
  live: 'bg-red-500/20 text-red-300',
  finished: 'bg-emerald-500/20 text-emerald-300'
}[status])

// Solo se puede crear o editar la predicción mientras el partido no arrancó
const predictionButtonLabel = (match: Match & { id: string }): string => {
  if (match.status !== 'scheduled') return 'Ver'
  return predictionByMatch.value[match.id] ? 'Editar' : 'Predecir'
}

// Estados de partido ordenados para el filtrado y el ordenamiento
const statusOrder: Record<MatchStatus, number> = { scheduled: 0, live: 1, finished: 2 }

// Filtra y ordena los partidos según los filtros aplicados y la búsqueda
const filteredMatches = computed(() => {
  let result = matches.value

  if (selectedStage.value) {
    result = result.filter((match) => match.stage === selectedStage.value)
  }

  if (selectedStatus.value) {
    result = result.filter((match) => match.status === selectedStatus.value)
  }

  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter(
      (match) => match.homeTeam.toLowerCase().includes(query) || match.awayTeam.toLowerCase().includes(query)
    )
  }

  return [...result].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    const timeDiff = a.kickoff.toMillis() - b.kickoff.toMillis()
    return a.status === 'finished' ? -timeDiff : timeDiff
  })
})

const itemsPerPage = 4
const currentPage = ref(1)

// Vuelve a la primera página cada vez que cambia el resultado filtrado
watch(filteredMatches, () => {
  currentPage.value = 1
})

// Partidos a mostrar en la página actual
const paginatedMatches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredMatches.value.slice(start, start + itemsPerPage)
})

// Sincroniza los puntos de las predicciones con los resultados de los partidos
const syncPoints = async () => {
  for (const prediction of predictions.value) {
    const match = matches.value.find((m) => m.id === prediction.matchId)
    if (!match || match.status !== 'finished') continue

    const points = calculatePoints(prediction, match)
    if (points !== prediction.pointsEarned) {
      await updatePrediction(prediction.id, { pointsEarned: points })
      prediction.pointsEarned = points
    }
  }

  // Actualiza los puntos totales del usuario si cambiaron
  const totalPoints = predictions.value.reduce((sum, prediction) => sum + prediction.pointsEarned, 0)
  if (authStore.user && totalPoints !== authStore.user.points) {
    await updateProfile({ points: totalPoints })
  }
}

// Carga los datos de los partidos, equipos y predicciones propias del usuario
const loadPredictions = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [allMatches, allTeams, ownPredictions] = await Promise.all([
      getAllMatches(),
      getAllTeams(),
      authStore.user ? getPredictionsByUser(authStore.user.uid) : Promise.resolve([])
    ])
    matches.value = allMatches
    teams.value = allTeams
    predictions.value = ownPredictions
    await syncPoints()
  } catch (err) {
    hasError.value = true
    error('No se pudieron cargar los partidos. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadPredictions)
</script>
