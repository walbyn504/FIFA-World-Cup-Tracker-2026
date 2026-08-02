<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div v-if="!authStore.isLoggedIn" class="flex min-h-[80vh] items-center justify-center px-4">
      <UiGlassCard class="w-full max-w-md">
        <h1 class="text-3xl font-bold tracking-wide text-white drop-shadow-lg">
          FIFA World Cup Tracker 2026
        </h1>
        <p class="-mt-3 text-sm text-white/80">
          Inicia sesión para ver tu perfil, hacer predicciones y seguir la Copa del Mundo.
        </p>
        <AuthLoginButton />
      </UiGlassCard>
    </div>

    <div v-else class="mx-auto max-w-6xl">
      <div class="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="font-['Bebas_Neue'] text-4xl tracking-wide text-white">Inicio</h1>
          <p class="text-sm text-white/60">¡Hola de nuevo, {{ authStore.user?.name }}! Así va el Mundial.</p>
        </div>
        <UiRefreshButton :loading="isLoading" @click="loadDashboard" />
      </div>

      <UiGlassCard v-if="isLoading" class="w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Cargando indicadores...</p>
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
          <p class="font-medium text-white">No se pudieron cargar los indicadores</p>
          <p class="mt-1 text-sm text-white/60">Ocurrió un problema al conectar con el servidor.</p>
        </div>
        <button
          class="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
          @click="loadDashboard"
        >
          Reintentar
        </button>
      </UiGlassCard>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <!-- Goles anotados -->
        <UiGlassCard content-class="relative flex items-center gap-4 overflow-hidden px-5 py-4 text-left">
          <svg class="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-[#D4AF37]/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M3 21V3h18v9" />
            <path d="M3 9h18M3 15h9" />
          </svg>
          <div class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F3D77A] to-[#9c7a1a] text-[#04140D] shadow-lg shadow-black/30 ring-2 ring-[#D4AF37]/40">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21V3h18v9" />
              <path d="M3 9h18M3 15h9" />
            </svg>
          </div>
          <div class="relative min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-white/50">Goles anotados</p>
            <p class="truncate font-['Bebas_Neue'] text-3xl tracking-wide text-white">{{ goalsScored }}</p>
          </div>
        </UiGlassCard>

        <!-- Selecciones clasificadas -->
        <UiGlassCard content-class="relative flex items-center gap-4 overflow-hidden px-5 py-4 text-left">
          <svg class="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-sky-400/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M4 21V4h14l-2 4 2 4H4" />
          </svg>
          <div class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-700 text-white shadow-lg shadow-black/30 ring-2 ring-sky-300/30">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 21V4h14l-2 4 2 4H4" />
            </svg>
          </div>
          <div class="relative min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-white/50">Selecciones clasificadas</p>
            <p class="truncate font-['Bebas_Neue'] text-3xl tracking-wide text-white">{{ qualifiedTeams }}</p>
          </div>
        </UiGlassCard>

        <!-- Predicciones realizadas -->
        <UiGlassCard content-class="relative flex items-center gap-4 overflow-hidden px-5 py-4 text-left">
          <svg class="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-violet-400/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
          <div class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-700 text-white shadow-lg shadow-black/30 ring-2 ring-violet-300/30">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
            </svg>
          </div>
          <div class="relative min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-white/50">Predicciones realizadas</p>
            <p class="truncate font-['Bebas_Neue'] text-3xl tracking-wide text-white">{{ predictionsCount }}</p>
          </div>
        </UiGlassCard>
      </div>

      <div v-if="!isLoading && !hasError" class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Partidos jugados vs pendientes -->
        <UiGlassCard content-class="flex flex-col gap-1 px-6 py-5 text-left">
          <div class="mb-3 flex items-center gap-2">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-white shadow shadow-black/30 ring-2 ring-emerald-300/30">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 9l6 6M15 9l-6 6" />
              </svg>
            </div>
            <h2 class="font-['Bebas_Neue'] text-2xl tracking-wide text-white">Partidos jugados vs pendientes</h2>
          </div>

          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <span class="w-24 shrink-0 text-sm text-white/70">Jugados</span>
              <div class="h-6 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  class="h-6 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  :style="{ width: `${matchesBarWidth(matchesPlayed)}%` }"
                />
              </div>
              <span class="w-10 shrink-0 text-right font-['Bebas_Neue'] text-xl text-white">{{ matchesPlayed }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-24 shrink-0 text-sm text-white/70">Pendientes</span>
              <div class="h-6 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  class="h-6 rounded-full bg-gradient-to-r from-amber-300 to-amber-600"
                  :style="{ width: `${matchesBarWidth(matchesPending)}%` }"
                />
              </div>
              <span class="w-10 shrink-0 text-right font-['Bebas_Neue'] text-xl text-white">{{ matchesPending }}</span>
            </div>
          </div>
        </UiGlassCard>

        <!-- Usuario con mayor puntaje -->
        <UiGlassCard content-class="flex flex-col gap-1 px-6 py-5 text-left">
          <div class="mb-3 flex items-center gap-2">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F3D77A] to-[#9c7a1a] text-[#04140D] shadow shadow-black/30 ring-2 ring-[#D4AF37]/40">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
                <path d="M7 6H4a2 2 0 0 0 2 4M17 6h3a2 2 0 0 1-2 4" />
              </svg>
            </div>
            <h2 class="font-['Bebas_Neue'] text-2xl tracking-wide text-white">Usuario con mayor puntaje</h2>
          </div>

          <p v-if="rankedUsers.length === 0" class="py-4 text-center text-sm text-white/50">
            Todavía no hay usuarios con puntaje registrado.
          </p>

          <ul v-else class="flex flex-col gap-3">
            <li v-for="(rankedUser, index) in rankedUsers" :key="rankedUser.name + index" class="flex items-center gap-3">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                :class="rankBadgeClass(index)"
              >
                {{ index + 1 }}
              </span>
              <span class="w-24 shrink-0 truncate text-sm text-white/80">{{ rankedUser.name }}</span>
              <div class="h-5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  class="h-5 rounded-full bg-gradient-to-r from-[#F3D77A] to-[#D4AF37]"
                  :style="{ width: `${userBarWidth(rankedUser.points)}%` }"
                />
              </div>
              <span class="w-10 shrink-0 text-right font-['Bebas_Neue'] text-lg text-white">{{ rankedUser.points }}</span>
            </li>
          </ul>
        </UiGlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getQualifiedTeamsCount } from '~/composables/useBracket'

const authStore = useAuthStore()
const { getAllMatches } = useMatches()
const { getAllPredictions } = usePredictions()
const { getAllUsers } = useUsers()
const { getGroupStandings } = useStandings()
const { error } = useNotify()

const isLoading = ref(true)
const hasError = ref(false)

const matchesPlayed = ref(0)
const matchesPending = ref(0)
const goalsScored = ref(0)
const qualifiedTeams = ref(0)
const predictionsCount = ref(0)
const rankedUsers = ref<{ name: string, points: number }[]>([])

// Estilos para el badge de ranking según la posición del usuario
const rankBadgeClass = (index: number) => {
  if (index === 0) return 'bg-gradient-to-br from-[#F3D77A] to-[#9c7a1a] text-[#04140D] ring-2 ring-[#D4AF37]/50'
  if (index === 1) return 'bg-gradient-to-br from-slate-300 to-slate-500 text-[#04140D]'
  if (index === 2) return 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
  return 'bg-white/10 text-white/70'
}

// Ancho relativo de la barra de partidos jugados y pendientes tomando el total de partidos como el 100%
const matchesBarWidth = (value: number) => (value / Math.max(matchesPlayed.value, matchesPending.value, 1)) * 100

// Ancho relativo de la barra de cada usuario tomando el puntaje más alto del top como el 100%
const userBarWidth = (points: number) => {
  const max = Math.max(...rankedUsers.value.map((u) => u.points), 1)
  return (points / max) * 100
}

// Carga los indicadores del dashboard
const loadDashboard = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [matches, predictions, users, standings] = await Promise.all([
      getAllMatches(),
      getAllPredictions(),
      getAllUsers(),
      getGroupStandings()
    ])

    matchesPlayed.value = matches.filter((m) => m.status === 'finished').length
    matchesPending.value = matches.filter((m) => m.status !== 'finished').length
    goalsScored.value = matches.reduce((sum, m) => sum + m.homeScore + m.awayScore, 0)
    qualifiedTeams.value = getQualifiedTeamsCount(standings)
    predictionsCount.value = predictions.length

    rankedUsers.value = [...users]
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((user) => ({ name: user.name, points: user.points }))
  } catch (err) {
    hasError.value = true
    error('No se pudieron cargar los indicadores. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

// Carga los indicadores al montar la página si el usuario está logueado
onMounted(() => {
  if (authStore.isLoggedIn) loadDashboard()
})

// Recarga los indicadores si el usuario inicia sesión mientras está en la página
watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) loadDashboard()
  },
  { immediate: true }
)
</script>
