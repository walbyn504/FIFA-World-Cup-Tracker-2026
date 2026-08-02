<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-2xl">
      <div class="flex items-center justify-between">
        <NuxtLink to="/matches" class="text-sm text-[#D4AF37] hover:underline">
          ← Volver a partidos
        </NuxtLink>
        <button
          title="Actualizar"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isLoading"
          @click="loadMatch"
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
          @click="loadMatch"
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

        <div v-if="homeScorers.length > 0 || awayScorers.length > 0" class="mt-6 flex items-start justify-center gap-4 text-center text-xs text-white/70">
          <ul class="flex flex-1 flex-col gap-1">
            <li v-for="(scorer, index) in homeScorers" :key="`home-${index}`">⚽ {{ scorer.playerName }}</li>
          </ul>
          <ul class="flex flex-1 flex-col gap-1">
            <li v-for="(scorer, index) in awayScorers" :key="`away-${index}`">⚽ {{ scorer.playerName }}</li>
          </ul>
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
          <div>
            <dt class="text-white/50">Ciudad</dt>
            <dd class="mt-1 text-base">{{ match.city }}</dd>
          </div>
        </dl>
      </UiGlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'
import type { Match, MatchStatus } from '~~/shared/types/match'
import type { Team } from '~~/shared/types/team'
import { matchStatusLabels } from '~/utils/matchOptions'

const route = useRoute()
const { getMatchById } = useMatches()
const { getAllTeams } = useTeams()
const { error } = useNotify()

const match = ref<(Match & { id: string }) | null>(null)
const teams = ref<(Team & { id: string })[]>([])
const isLoading = ref(true)
const hasError = ref(false)

// Obtenemos los datos del partido y de los equipos
const homeTeam = computed(() => teams.value.find((t) => t.name === match.value?.homeTeam) ?? null)
const awayTeam = computed(() => teams.value.find((t) => t.name === match.value?.awayTeam) ?? null)

// Filtramos los goleadores por equipo
const homeScorers = computed(() => match.value?.scorers?.filter((s) => s.team === 'home') ?? [])
const awayScorers = computed(() => match.value?.scorers?.filter((s) => s.team === 'away') ?? [])

// Formatea la fecha y hora del partido a un string legible
const formatKickoff = (kickoff: Timestamp) =>
  kickoff.toDate().toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Estilos de los badges de estado del partido
const statusBadgeClass = (status: MatchStatus) => ({
  scheduled: 'bg-white/10 text-white/70',
  live: 'bg-red-500/20 text-red-300',
  finished: 'bg-emerald-500/20 text-emerald-300'
}[status])

// Carga los datos del partido y de los equipos
const loadMatch = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const id = route.params.id as string
    const [matchResult, allTeams] = await Promise.all([getMatchById(id), getAllTeams()])
    match.value = matchResult
    teams.value = allTeams
  } catch (err) {
    hasError.value = true
    error('No se pudo cargar el partido. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadMatch)
</script>
