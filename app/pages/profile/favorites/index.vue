<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-4xl">
      <!-- Encabezado de la página -->
      <div class="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="font-['Bebas_Neue'] text-4xl tracking-wide text-white">Mis Favoritos</h1>
          <p class="text-sm text-white/60">Consulta y gestiona tus selecciones y partidos preferidos</p>
        </div>
        <UiRefreshButton :loading="isLoading" @click="loadFavorites" />
      </div>

      <!-- Selector de pestañas (Tabs) -->
      <div class="mb-6 flex border-b border-white/15">
        <button
          class="px-5 py-3 text-sm font-semibold transition border-b-2"
          :class="activeTab === 'teams' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/60 hover:text-white'"
          @click="activeTab = 'teams'"
        >
          Equipos Favoritos ({{ favoriteTeams.length }})
        </button>
        <button
          class="px-5 py-3 text-sm font-semibold transition border-b-2"
          :class="activeTab === 'matches' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-white/60 hover:text-white'"
          @click="activeTab = 'matches'"
        >
          Partidos Favoritos ({{ favoriteMatches.length }})
        </button>
      </div>

      <!-- Estado: Cargando -->
      <UiGlassCard v-if="isLoading" class="w-full py-12">
        <div class="flex flex-col items-center justify-center gap-3">
          <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
            <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
          <p class="text-white/60">Cargando tus favoritos...</p>
        </div>
      </UiGlassCard>

      <!-- Estado: Error -->
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
            <p class="font-medium text-white">No se pudieron cargar tus favoritos</p>
            <p class="mt-1 text-sm text-white/60">Ocurrió un error al obtener la información desde el servidor.</p>
          </div>
          <button
            class="mt-2 rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
            @click="loadFavorites"
          >
            Reintentar
          </button>
        </div>
      </UiGlassCard>

      <!-- PESTAÑA 1: EQUIPOS FAVORITOS -->
      <template v-else-if="activeTab === 'teams'">
        <!-- Si no tiene equipos favoritos -->
        <UiGlassCard v-if="favoriteTeams.length === 0" class="w-full py-12">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
              <svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <p class="font-medium text-white">No tienes selecciones favoritas marcadas</p>
            <p class="mt-1 text-sm text-white/60">Explora las selecciones y haz clic en el ícono de corazón para guardarlas aquí.</p>
          </div>
        </UiGlassCard>

        <!-- Lista de equipos favoritos -->
        <ul v-else class="flex flex-col gap-3">
          <li v-for="team in favoriteTeams" :key="team.id">
            <UiGlassCard
              class="w-full"
              content-class="grid grid-cols-[auto_1fr] items-center gap-4 px-5 py-4 text-left"
            >
              <div class="flex items-center">
                <UiFavoriteButton
                  :is-favorite="isFavoriteTeam(team.id)"
                  @click="toggleFavoriteTeam(team.id)"
                />
              </div>

              <div class="flex items-center gap-3">
                <img
                  v-if="team.flag"
                  :src="team.flag"
                  :alt="`Bandera de ${team.name}`"
                  class="h-8 w-11 shrink-0 rounded object-cover border border-white/20"
                >
                <div>
                  <strong class="text-lg text-white">{{ team.name }}</strong>
                  <span class="ml-2 text-sm text-white/60">Grupo {{ team.group }}</span>
                </div>
              </div>
            </UiGlassCard>
          </li>
        </ul>
      </template>

      <!-- PESTAÑA 2: PARTIDOS FAVORITOS -->
      <template v-else-if="activeTab === 'matches'">
        <!-- Si no tiene partidos favoritos -->
        <UiGlassCard v-if="favoriteMatches.length === 0" class="w-full py-12">
          <div class="flex flex-col items-center justify-center text-center">
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
              <svg class="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <p class="font-medium text-white">No tienes partidos favoritos marcados</p>
            <p class="mt-1 text-sm text-white/60">Explora el calendario de partidos y guarda tus encuentros favoritos.</p>
          </div>
        </UiGlassCard>

        <!-- Lista de partidos favoritos -->
        <ul v-else class="flex flex-col gap-3">
          <li v-for="match in favoriteMatches" :key="match.id">
            <UiGlassCard
              class="w-full"
              content-class="grid grid-cols-[auto_1fr] items-center gap-4 px-5 py-4 text-left"
            >
              <div class="flex items-center">
                <UiFavoriteButton
                  :is-favorite="isFavoriteMatch(match.id)"
                  @click="toggleFavoriteMatch(match.id)"
                />
              </div>

              <!-- Información del Partido -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-3">
                  <span class="font-semibold text-white">{{ match.homeTeam }}</span>
                  <span class="rounded bg-white/10 px-2 py-0.5 text-xs text-[#D4AF37]">
                    {{ match.homeScore ?? '-' }} : {{ match.awayScore ?? '-' }}
                  </span>
                  <span class="font-semibold text-white">{{ match.awayTeam }}</span>
                </div>
                <div class="text-xs text-white/60">
                  <span>{{ formatKickoff(match.kickoff) }}</span>
                  <span v-if="match.stadium" class="ml-2">• {{ match.stadium }}</span>
                </div>
              </div>
            </UiGlassCard>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'
import type { Team } from '~~/shared/types/team'
import type { Match } from '~~/shared/types/match'

definePageMeta({
  middleware: 'auth'
})

const { isFavoriteTeam, toggleFavoriteTeam, isFavoriteMatch, toggleFavoriteMatch, favoriteTeamIds, favoriteMatchIds } = useFavorites()
const { getAllTeams } = useTeams()
const { getAllMatches } = useMatches()
const { error } = useNotify()

const activeTab = ref<'teams' | 'matches'>('teams')
const isLoading = ref(true)
const hasError = ref(false)

const allTeams = ref<(Team & { id: string })[]>([])
const allMatches = ref<(Match & { id: string })[]>([])

// Equipos filtrados por la lista de favoritos del usuario
const favoriteTeams = computed(() => {
  return allTeams.value.filter((team) => favoriteTeamIds.value.includes(team.id))
})

// Partidos filtrados por la lista de favoritos del usuario
const favoriteMatches = computed(() => {
  return allMatches.value.filter((match) => favoriteMatchIds.value.includes(match.id))
})

const loadFavorites = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [fetchedTeams, fetchedMatches] = await Promise.all([
      getAllTeams(),
      getAllMatches()
    ])
    allTeams.value = fetchedTeams
    allMatches.value = fetchedMatches
  } catch (err) {
    hasError.value = true
    error('Ocurrió un problema al cargar los favoritos.')
  } finally {
    isLoading.value = false
  }
}

const formatKickoff = (kickoff: Timestamp) =>
  kickoff.toDate().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

onMounted(loadFavorites)
</script>