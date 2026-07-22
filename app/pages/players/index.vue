<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">Jugadores</h1>
        <div class="flex items-center gap-2">
          <button
            title="Actualizar lista"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isLoading"
            @click="loadPlayers"
          >
            <svg
              class="h-5 w-5"
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
          <button
            class="rounded-xl bg-[#D4AF37] px-4 py-2 font-semibold text-[#04140D] hover:brightness-110"
            @click="openCreateModal"
          >
            + Agregar jugador
          </button>
        </div>
      </div>

      <div v-if="!hasError && players.length > 0" class="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre de jugador..."
          class="flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
        >
        <select
          v-model="selectedTeamId"
          :disabled="isFiltering"
          class="rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Todas las selecciones</option>
          <option
            v-for="team in teams"
            :key="team.id"
            :value="team.id"
            class="bg-[#0F1F17] text-[#F5F0E6]"
          >
            {{ team.name }}
          </option>
        </select>
      </div>

      <UiGlassCard v-if="isLoading" class="w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Cargando jugadores...</p>
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
          <p class="font-medium text-white">No se pudieron cargar los jugadores</p>
          <p class="mt-1 text-sm text-white/60">Ocurrió un problema al conectar con el servidor.</p>
        </div>
        <button
          class="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
          @click="loadPlayers"
        >
          Reintentar
        </button>
      </UiGlassCard>

      <UiGlassCard v-else-if="players.length === 0" class="w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Todavía no hay jugadores registrados</p>
          <p class="mt-1 text-sm text-white/60">Agregá el primer jugador para empezar a armar las plantillas.</p>
        </div>
      </UiGlassCard>

      <UiGlassCard v-else-if="isFiltering" class="w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Filtrando jugadores...</p>
      </UiGlassCard>

      <UiGlassCard v-else-if="filteredPlayers.length === 0" class="w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/60">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Sin resultados</p>
          <p class="mt-1 text-sm text-white/60">Ningún jugador coincide con la búsqueda o el filtro aplicado.</p>
        </div>
      </UiGlassCard>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="player in filteredPlayers" :key="player.id">
          <UiGlassCard
            class="w-full"
            content-class="flex items-center justify-between gap-4 px-5 py-4 text-left"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-sm font-semibold text-[#04140D]">
                {{ player.number }}
              </div>
              <div>
                <strong class="text-lg text-white">{{ player.name }}</strong>
                <div class="text-sm text-white/60">
                  {{ player.position }} · {{ player.club }}
                  <span class="text-white/40">· {{ teamNameById(player.teamId) }}</span>
                </div>
              </div>
            </div>
            <div class="flex shrink-0 gap-2">
              <NuxtLink
                  :to="`/players/${player.id}`"
                  title="Ver jugador"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35"
              >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
              </NuxtLink>
              <button
                  title="Editar jugador"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37]/35 text-[#D4AF37] transition hover:bg-[#D4AF37]/50"
                  @click="openEditModal(player)"
              >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
              </button>
              <button
                  title="Eliminar jugador"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-red-500 bg-red-500/35 text-red-300 transition hover:bg-red-500/50"
                  @click="askDelete(player.id)"
              >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
              </button>
            </div>
          </UiGlassCard>
        </li>
      </ul>
    </div>

    <PlayersPlayerFormModal
      :visible="isModalOpen"
      :initial-data="playerBeingEdited"
      :teams="teams"
      :players="players"
      @close="isModalOpen = false"
      @submit="handleSubmit"
    />

    <UiConfirmDilog
      :visible="isConfirmOpen"
      title="¿Eliminar jugador?"
      message="Esta acción no se puede deshacer."
      @cancel="isConfirmOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~~/shared/types/player'
import type { Team } from '~~/shared/types/team'

const { getAllPlayers, getPlayersByTeam, createPlayer, updatePlayer, deletePlayer } = usePlayers()
const { getAllTeams } = useTeams()
const { success, error } = useNotify()

const players = ref<(Player & { id: string })[]>([])
const teamPlayers = ref<(Player & { id: string })[] | null>(null)
const teams = ref<(Team & { id: string })[]>([])
const isLoading = ref(true)
const isFiltering = ref(false)
const hasError = ref(false)
const isModalOpen = ref(false)
const isConfirmOpen = ref(false)
const playerToDelete = ref<string | null>(null)
const searchQuery = ref('')
const selectedTeamId = ref('')

// Guarda el jugador que se esta editando (con su id).
// Si es null, el modal esta en modo "crear"
const playerBeingEdited = ref<(Player & { id: string }) | null>(null)

const teamNameById = (teamId: string) => teams.value.find((t) => t.id === teamId)?.name ?? 'Sin equipo'

// Consulta a Firestore (where 'teamId') los jugadores del equipo seleccionado
const applyTeamFilter = async (teamId: string) => {
  if (!teamId) {
    teamPlayers.value = null
    return
  }
  isFiltering.value = true
  try {
    teamPlayers.value = await getPlayersByTeam(teamId)
  } catch (err) {
    error('No se pudieron filtrar los jugadores por selección.')
    teamPlayers.value = []
  } finally {
    isFiltering.value = false
  }
}

watch(selectedTeamId, (teamId) => applyTeamFilter(teamId))

// Aplica el buscador por nombre sobre la selección elegida (o sobre todos los jugadores)
const filteredPlayers = computed(() => {
  const source = selectedTeamId.value ? (teamPlayers.value ?? []) : players.value
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return source
  return source.filter((player) => player.name.toLowerCase().includes(query))
})

const loadPlayers = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [allPlayers, allTeams] = await Promise.all([getAllPlayers(), getAllTeams()])
    players.value = allPlayers
    teams.value = allTeams
    if (selectedTeamId.value) {
      await applyTeamFilter(selectedTeamId.value)
    }
  } catch (err) {
    hasError.value = true
    error('No se pudieron cargar los jugadores. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  playerBeingEdited.value = null
  isModalOpen.value = true
}

const openEditModal = (player: Player & { id: string }) => {
  playerBeingEdited.value = player
  isModalOpen.value = true
}

// Decide si el submit del modal significa crear o actualizar
const handleSubmit = async (player: Player) => {
  const isEditing = !!playerBeingEdited.value
  try {
    if (isEditing) {
      await updatePlayer(playerBeingEdited.value!.id, player)
    } else {
      await createPlayer(player)
    }
    isModalOpen.value = false
    await loadPlayers()
    success(isEditing ? 'Jugador actualizado correctamente.' : 'Jugador creado correctamente.')
  } catch (err) {
    error(isEditing ? 'No se pudo actualizar el jugador.' : 'No se pudo crear el jugador.')
  }
}

const askDelete = (id: string) => {
  playerToDelete.value = id
  isConfirmOpen.value = true
}

const handleDelete = async () => {
  if (!playerToDelete.value) return
  try {
    await deletePlayer(playerToDelete.value)
    await loadPlayers()
    success('Jugador eliminado correctamente.')
  } catch (err) {
    error('No se pudo eliminar el jugador.')
  } finally {
    isConfirmOpen.value = false
    playerToDelete.value = null
  }
}

onMounted(loadPlayers)
</script>
