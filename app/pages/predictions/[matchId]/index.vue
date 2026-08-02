<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-2xl">
      <div class="flex items-center justify-between">
        <NuxtLink to="/predictions" class="text-sm text-[#D4AF37] hover:underline">
          ← Volver a predicciones
        </NuxtLink>
        <button
          title="Actualizar"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isLoading"
          @click="loadData"
        >
          <svg
            class="h-4 w-4"
            :class="{ 'animate-spin': isLoading }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </div>

      <UiGlassCard v-if="isLoading" class="mt-6 w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Cargando partido...</p>
      </UiGlassCard>

      <UiGlassCard v-else-if="hasError" class="mt-6 w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-300">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">No se pudo cargar el partido</p>
          <p class="mt-1 text-sm text-white/60">Ocurrió un problema al conectar con el servidor.</p>
        </div>
        <button
          class="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
          @click="loadData"
        >
          Reintentar
        </button>
      </UiGlassCard>

      <UiGlassCard v-else-if="!match" class="mt-6 w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Partido no encontrado</p>
          <p class="mt-1 text-sm text-white/60">Puede que haya sido eliminado o el enlace sea incorrecto.</p>
        </div>
      </UiGlassCard>

      <UiGlassCard v-else class="mt-6 w-full" content-class="text-left px-8 py-8">
        <div class="flex items-center justify-between text-xs text-white/60">
          <span>{{ match.stage }}<span v-if="match.group"> · Grupo {{ match.group }}</span></span>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="statusBadgeClass(match.status)"
          >
            {{ matchStatusLabels[match.status] }}
          </span>
        </div>

        <div class="mt-4 flex items-center justify-center gap-4 text-center">
          <div class="flex flex-1 flex-col items-center gap-2">
            <img
              v-if="homeTeam?.flag"
              :src="homeTeam.flag"
              :alt="`Bandera de ${match.homeTeam}`"
              class="h-8 w-11 rounded object-cover border border-white/20"
            >
            <strong class="text-lg text-white">{{ match.homeTeam }}</strong>
          </div>
          <div class="shrink-0 font-['Bebas_Neue'] text-4xl tracking-wide text-yellow-300">
            {{ match.homeScore }} - {{ match.awayScore }}
          </div>
          <div class="flex flex-1 flex-col items-center gap-2">
            <img
              v-if="awayTeam?.flag"
              :src="awayTeam.flag"
              :alt="`Bandera de ${match.awayTeam}`"
              class="h-8 w-11 rounded object-cover border border-white/20"
            >
            <strong class="text-lg text-white">{{ match.awayTeam }}</strong>
          </div>
        </div>

        <dl class="mt-8 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-white/50">Fecha y hora</dt>
            <dd class="mt-1 text-base">{{ formatKickoff(match.kickoff) }}</dd>
          </div>
          <div>
            <dt class="text-white/50">Estadio</dt>
            <dd class="mt-1 text-base">{{ match.stadium }}</dd>
          </div>
        </dl>

        <div class="mt-8 border-t border-white/10 pt-6">
          <h2 class="font-['Bebas_Neue'] text-xl tracking-wide text-[#D4AF37]">
            {{ isFinal ? '¿Quién va a salir campeón del Mundial?' : 'Tu predicción' }}
          </h2>
          <p v-if="isFinal" class="mt-1 text-xs text-white/50">
            El ganador que elijas acá es tu campeón del torneo.
          </p>

          <form
            v-if="match.status === 'scheduled'"
            class="mt-4 flex flex-col gap-4"
            novalidate
            @submit.prevent="handleSubmit"
          >
            <div class="grid grid-cols-2 gap-4">
              <label class="flex flex-col gap-1.5 text-sm text-white/70">
                {{ match.homeTeam }}
                <input
                  v-model.number="form.homePrediction"
                  type="number"
                  min="0"
                  :max="MAX_GOALS"
                  class="rounded-xl border bg-white/5 px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37]"
                  :class="errors.homePrediction ? 'border-red-400/60' : 'border-white/20'"
                >
                <span v-if="errors.homePrediction" class="text-xs text-red-400">{{ errors.homePrediction }}</span>
              </label>

              <label class="flex flex-col gap-1.5 text-sm text-white/70">
                {{ match.awayTeam }}
                <input
                  v-model.number="form.awayPrediction"
                  type="number"
                  min="0"
                  :max="MAX_GOALS"
                  class="rounded-xl border bg-white/5 px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37]"
                  :class="errors.awayPrediction ? 'border-red-400/60' : 'border-white/20'"
                >
                <span v-if="errors.awayPrediction" class="text-xs text-red-400">{{ errors.awayPrediction }}</span>
              </label>
            </div>

            <p class="text-sm text-white/60">
              {{ isFinal ? 'Tu campeón' : 'Ganador elegido' }}:
              <span class="font-semibold text-[#D4AF37]">{{ formPredictedWinner }}</span>
            </p>

            <button
              type="submit"
              class="self-start rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
            >
              {{ ownPrediction ? 'Guardar cambios' : 'Guardar' }}
            </button>
          </form>

          <div
            v-else-if="ownPrediction"
            class="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
          >
            <div>
              <p class="text-xs uppercase tracking-wider text-white/40">
                {{ isFinal ? 'Tu campeón' : 'Predicción' }}
              </p>
              <p class="mt-1 font-['Bebas_Neue'] text-3xl tracking-wide text-[#D4AF37]">
                {{ isFinal ? ownPredictedWinner : `${ownPrediction.homePrediction} - ${ownPrediction.awayPrediction}` }}
              </p>
              <p v-if="isFinal" class="mt-1 text-xs text-white/50">Marcador predicho: {{ ownPrediction.homePrediction }} - {{ ownPrediction.awayPrediction }}</p>
              <p v-else class="mt-1 text-xs text-white/50">Ganador elegido: {{ ownPredictedWinner }}</p>
            </div>
            <span
              v-if="match.status === 'finished'"
              class="rounded-full bg-emerald-500/20 px-3 py-1.5 text-sm font-semibold text-emerald-300"
            >
              +{{ ownPrediction.pointsEarned }} pts
            </span>
          </div>

          <div v-else class="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p class="text-white/60">
              No hiciste una predicción para este partido antes de que empezara.
            </p>
          </div>
        </div>
      </UiGlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'
import type { Match, MatchStatus } from '~~/shared/types/match'
import type { Team } from '~~/shared/types/team'
import type { Prediction } from '~~/shared/types/prediction'
import { matchStatusLabels, MAX_GOALS } from '~/utils/matchOptions'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const matchId = route.params.matchId as string

const { getMatchById } = useMatches()
const { getAllTeams } = useTeams()
const { getPredictionsByMatch, getPredictionsByUser, calculatePoints, createPrediction, updatePrediction } = usePredictions()
const authStore = useAuthStore()
const { updateProfile } = useAuth()
const { success, error } = useNotify()

const match = ref<(Match & { id: string }) | null>(null)
const teams = ref<(Team & { id: string })[]>([])
const ownPrediction = ref<(Prediction & { id: string }) | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

const form = ref({ homePrediction: 0, awayPrediction: 0 })
const errors = ref<Record<string, string>>({})

const homeTeam = computed(() => teams.value.find((t) => t.name === match.value?.homeTeam) ?? null)
const awayTeam = computed(() => teams.value.find((t) => t.name === match.value?.awayTeam) ?? null)

// Determina si el partido es la final del torneo
const isFinal = computed(() => match.value?.stage === 'Final')

// Ganador implícito en un marcador (para "elegir ganador" a partir del marcador)
const predictedWinner = (homeScore: number, awayScore: number): string => {
  if (!match.value) return ''
  if (homeScore === awayScore) return 'Empate'
  return homeScore > awayScore ? match.value.homeTeam : match.value.awayTeam
}

//Determina el ganador predicho a partir de los valores del formulario y de la predicción propia
const formPredictedWinner = computed(() => predictedWinner(form.value.homePrediction, form.value.awayPrediction))

// Determina el ganador predicho a partir de la predicción propia
const ownPredictedWinner = computed(() =>
  ownPrediction.value ? predictedWinner(ownPrediction.value.homePrediction, ownPrediction.value.awayPrediction) : ''
)

// Formatea la fecha y hora del partido a un string legible
const formatKickoff = (kickoff: Timestamp) =>
  kickoff.toDate().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Estilos de los badges de estado del partido
const statusBadgeClass = (status: MatchStatus) => ({
  scheduled: 'bg-white/10 text-white/70',
  live: 'bg-red-500/20 text-red-300',
  finished: 'bg-emerald-500/20 text-emerald-300'
}[status])

// Valida que la cantidad de goles sea un número válido y esté dentro del rango permitido
const validateGoalCount = (value: unknown): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Ingresá una cantidad de goles.'
  if (value < 0) return 'Los goles no pueden ser negativos.'
  if (value > MAX_GOALS) return `Los goles no pueden ser más de ${MAX_GOALS}.`
  return ''
}

const validate = (): boolean => {
  errors.value = {}

  const homePredictionError = validateGoalCount(form.value.homePrediction)
  if (homePredictionError) errors.value.homePrediction = homePredictionError

  const awayPredictionError = validateGoalCount(form.value.awayPrediction)
  if (awayPredictionError) errors.value.awayPrediction = awayPredictionError

  return Object.keys(errors.value).length === 0
}

// Maneja el envío del formulario de predicción
const handleSubmit = async () => {
  if (!validate()) return
  if (!authStore.user || !match.value) return

  try {
    if (ownPrediction.value) {
      await updatePrediction(ownPrediction.value.id, {
        homePrediction: form.value.homePrediction,
        awayPrediction: form.value.awayPrediction
      })
    } else {
      await createPrediction({
        userId: authStore.user.uid,
        matchId: match.value.id,
        homePrediction: form.value.homePrediction,
        awayPrediction: form.value.awayPrediction,
        pointsEarned: 0
      })
    }
    success('Predicción guardada correctamente.')
    router.push('/predictions')
    await loadData()
  } catch (err) {
    error('No se pudo guardar la predicción.')
  }
}

// Carga los datos del partido, de los equipos y de la predicción propia
const loadData = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [matchResult, allTeams, matchPredictions] = await Promise.all([
      getMatchById(matchId),
      getAllTeams(),
      getPredictionsByMatch(matchId)
    ])
    match.value = matchResult

    teams.value = allTeams

    const mine = authStore.user
      ? matchPredictions.find((p) => p.userId === authStore.user!.uid) ?? null
      : null

    // Si ya terminó el partido, aprovecha para dejar el puntaje al día
    // (las reglas de Firestore solo dejan que el dueño actualice su propia predicción)
    if (mine && matchResult && matchResult.status === 'finished') {
      const points = calculatePoints(mine, matchResult)
      if (points !== mine.pointsEarned) {
        await updatePrediction(mine.id, { pointsEarned: points })
        mine.pointsEarned = points
      }

      // Refleja el total en el perfil (solo el dueño puede escribir su propio usuario)
      if (authStore.user) {
        const allOwnPredictions = await getPredictionsByUser(authStore.user.uid)
        const totalPoints = allOwnPredictions.reduce((sum, p) => sum + p.pointsEarned, 0)
        if (totalPoints !== authStore.user.points) {
          await updateProfile({ points: totalPoints })
        }
      }
    }

    ownPrediction.value = mine
    if (mine) {
      form.value = { homePrediction: mine.homePrediction, awayPrediction: mine.awayPrediction }
    }
  } catch (err) {
    hasError.value = true
    error('No se pudo cargar el partido. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)
</script>
