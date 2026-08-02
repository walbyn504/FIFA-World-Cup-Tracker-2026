<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-6xl">
      <NuxtLink :to="`/teams/${teamId}`" class="text-sm text-[#D4AF37] hover:underline">
        ← Volver al equipo
      </NuxtLink>

      <div class="mt-6 flex items-center gap-3">
        <img
          v-if="team?.flag"
          :src="team.flag"
          :alt="`Bandera de ${team.name}`"
          class="h-8 w-11 shrink-0 rounded object-cover border border-white/20"
        >
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">
          Plantilla{{ team ? ` de ${team.name}` : '' }}
        </h1>
        <button
          title="Actualizar"
          class="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-50"
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

      <div v-else class="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <div v-if="substitutes.length > 0" class="order-2 lg:order-1 lg:w-72 lg:shrink-0">
          <h2 class="mb-3 font-['Bebas_Neue'] text-xl tracking-wide text-white/80">Suplentes</h2>
          <ul class="flex flex-col gap-1.5">
            <li v-for="player in paginatedSubstitutes" :key="player.id">
              <UiGlassCard class="w-full" content-class="flex items-center gap-2 px-3 py-2">
                <UiJerseyBadge :number="player.number" class="h-7 w-7 shrink-0" />
                <div class="min-w-0 flex-1">
                  <strong class="block truncate text-sm text-white">{{ player.name }}</strong>
                  <div class="truncate text-xs text-white/60">{{ player.position }} · {{ player.club }}</div>
                </div>
                <button
                  title="Mover a titulares"
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="togglingId === player.id"
                  @click="toggleStarter(player)"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 19V5" />
                    <path d="m5 12 7-7 7 7" />
                  </svg>
                </button>
              </UiGlassCard>
            </li>
          </ul>

          <UiPagination
            v-model="substitutesPage"
            :total-items="substitutes.length"
            :items-per-page="substitutesPerPage"
            class="mt-3"
          />
        </div>

        <div class="pitch order-1 min-w-0 flex-1 lg:order-2">
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
              <button
                v-for="player in row.players"
                :key="player.id"
                type="button"
                title="Mover a suplentes"
                class="flex w-16 flex-col items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="togglingId === player.id"
                @click="toggleStarter(player)"
              >
                <UiJerseyBadge :number="player.number" class="h-14 w-14" />
                <span class="line-clamp-2 text-center text-xs font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
                  {{ player.name }}
                </span>
              </button>
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

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const teamId = route.params.id as string

const { getPlayersByTeam, updatePlayer } = usePlayers()
const { getTeamById } = useTeams()
const { error, warning } = useNotify()

const team = ref<(Team & { id: string }) | null>(null)
const players = ref<(Player & { id: string })[]>([])
const isLoading = ref(true)
const hasError = ref(false)
const togglingId = ref<string | null>(null)

// Orden de filas en la cancha: delanteros arriba, arquero abajo (como una alineación)
const positionOrder = ['Delantero', 'Mediocampista', 'Defensa', 'Portero']

// Titulares vs. suplentes: se define a mano desde el formulario de cada jugador (campo isStarter)
const starters = computed(() => players.value.filter((p) => p.isStarter))
const substitutes = computed(() => players.value.filter((p) => !p.isStarter))
const hasStartingGoalkeeper = computed(() => starters.value.some((p) => p.position === 'Portero'))

const substitutesPerPage = 5
const substitutesPage = ref(1)

// Vuelve a la primera página cada vez que cambia la lista de suplentes
watch(substitutes, () => {
  substitutesPage.value = 1
})

// Subconjunto de suplentes a mostrar según la página actual
const paginatedSubstitutes = computed(() => {
  const start = (substitutesPage.value - 1) * substitutesPerPage
  return substitutes.value.slice(start, start + substitutesPerPage)
})

// Estructura de filas en la cancha según la posición de los jugadores
const formationRows = computed(() =>
  positionOrder
    .map((position) => ({
      position,
      players: starters.value.filter((p) => p.position === position)
    }))
    .filter((row) => row.players.length > 0)
)

// Mueve un jugador entre titulares y suplentes directo desde la plantilla, sin pasar por el modal
const toggleStarter = async (player: Player & { id: string }) => {
  if (!player.isStarter && starters.value.length >= 11) {
    warning('Ya hay 11 titulares en este equipo.')
    return
  }
  // Evita que haya más de un portero titular
  if (!player.isStarter && player.position === 'Portero' && hasStartingGoalkeeper.value) {
    warning('Ya hay un portero titular en este equipo.')
    return
  }
  // Evita que un portero titular quede sin suplente
  togglingId.value = player.id
  try {
    await updatePlayer(player.id, { isStarter: !player.isStarter })
    player.isStarter = !player.isStarter
  } catch (err) {
    error('No se pudo actualizar el jugador.')
  } finally {
    togglingId.value = null
  }
}

// Carga la información del equipo y su plantilla de jugadores
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
  min-height: 480px;
  padding: 22px 16px;
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
