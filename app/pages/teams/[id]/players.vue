<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-3xl">
      <div class="flex items-center justify-between">
        <NuxtLink :to="`/teams/${teamId}`" class="text-sm text-[#D4AF37] hover:underline">
          ← Volver al equipo
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

      <div v-if="team" class="mt-6 flex items-center gap-3">
        <img
          v-if="team.flag"
          :src="team.flag"
          :alt="`Bandera de ${team.name}`"
          class="h-8 w-11 shrink-0 rounded object-cover border border-white/20"
        >
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">Plantilla de {{ team.name }}</h1>
      </div>

      <UiGlassCard v-if="isLoading" class="mt-6 w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Cargando plantilla...</p>
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
          <p class="font-medium text-white">No se pudo cargar la plantilla</p>
          <p class="mt-1 text-sm text-white/60">Ocurrió un problema al conectar con el servidor.</p>
        </div>
        <button
          class="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
          @click="loadData"
        >
          Reintentar
        </button>
      </UiGlassCard>

      <UiGlassCard v-else-if="players.length === 0" class="mt-6 w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Todavía no hay jugadores en esta selección</p>
          <p class="mt-1 text-sm text-white/60">Agregalos desde la sección de jugadores.</p>
        </div>
      </UiGlassCard>

      <div v-else class="pitch mt-6">
        <div class="pitch__center-circle" />
        <div class="pitch__halfway-line" />
        <div class="pitch__box pitch__box--top" />
        <div class="pitch__box pitch__box--bottom" />

        <div class="relative z-10 flex h-full flex-1 flex-col justify-between py-2">
          <div
            v-for="row in formationRows"
            :key="row.position"
            class="flex flex-wrap items-start justify-evenly gap-x-2 gap-y-4 px-2"
          >
            <div v-for="player in row.players" :key="player.id" class="flex w-16 flex-col items-center gap-1">
              <UiJerseyBadge :number="player.number" class="h-14 w-14" />
              <span class="line-clamp-2 text-center text-xs font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                {{ player.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~~/shared/types/player'
import type { Team } from '~~/shared/types/team'

const route = useRoute()
const teamId = route.params.id as string

const { getPlayersByTeam } = usePlayers()
const { getTeamById } = useTeams()
const { error } = useNotify()

const team = ref<(Team & { id: string }) | null>(null)
const players = ref<(Player & { id: string })[]>([])
const isLoading = ref(true)
const hasError = ref(false)

// Orden de filas en la cancha: delanteros arriba, arquero abajo (como una alineación)
const positionOrder = ['Delantero', 'Mediocampista', 'Defensa', 'Portero']

const formationRows = computed(() =>
  positionOrder
    .map((position) => ({
      position,
      players: players.value.filter((p) => p.position === position)
    }))
    .filter((row) => row.players.length > 0)
)

const loadData = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [teamResult, playersResult] = await Promise.all([
      getTeamById(teamId),
      getPlayersByTeam(teamId)
    ])
    team.value = teamResult
    players.value = playersResult
  } catch (err) {
    hasError.value = true
    error('No se pudo cargar la plantilla. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.pitch {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 460px;
  padding: 24px 16px;
  border-radius: 24px;
  border: 3px solid rgba(255, 255, 255, 0.5);
  background-image: repeating-linear-gradient(
    180deg,
    #1f7a3d 0px,
    #1f7a3d 48px,
    #1c6f38 48px,
    #1c6f38 96px
  );
  box-shadow:
    inset 0 0 0 6px rgba(255, 255, 255, 0.12),
    0 20px 50px rgba(0, 0, 0, 0.45);
}

.pitch__halfway-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
}

.pitch__center-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 130px;
  height: 130px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
}

.pitch__box {
  position: absolute;
  left: 50%;
  width: 220px;
  height: 70px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transform: translateX(-50%);
}

.pitch__box--top {
  top: 0;
  border-top: none;
}

.pitch__box--bottom {
  bottom: 0;
  border-bottom: none;
}
</style>
