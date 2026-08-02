<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">Selecciones</h1>
        <div class="flex items-center gap-2">
          <UiRefreshButton :loading="isLoading" @click="loadTeams" />
          <UiAddButton label="Agregar equipo" @click="openCreateModal" />
        </div>
      </div>

      <div v-if="!hasError && teams.length > 0" class="mb-5 flex flex-col gap-3 sm:flex-row">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre de selección..."
          class="flex-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
        >
        <select
          v-model="selectedGroup"
          :disabled="isFiltering"
          class="rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Todos los grupos</option>
          <option
            v-for="group in availableGroups"
            :key="group"
            :value="group"
            class="bg-[#0F1F17] text-[#F5F0E6]"
          >
            Grupo {{ group }}
          </option>
        </select>
      </div>

      <UiGlassCard v-if="isLoading" class="w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Cargando equipos...</p>
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
          <p class="font-medium text-white">No se pudieron cargar los equipos</p>
          <p class="mt-1 text-sm text-white/60">Ocurrió un problema al conectar con el servidor.</p>
        </div>
        <button
          class="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
          @click="loadTeams"
        >
          Reintentar
        </button>
      </UiGlassCard>

      <UiGlassCard v-else-if="teams.length === 0" class="w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h13.5a1 1 0 0 1 1 1v11.5" />
            <path d="M4 4v16l3.5-2.5L11 20l3.5-2.5" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Todavía no hay equipos registrados</p>
          <p class="mt-1 text-sm text-white/60">Agregá la primera selección para empezar a darle seguimiento.</p>
        </div>
      </UiGlassCard>

      <UiGlassCard v-else-if="isFiltering" class="w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Filtrando equipos...</p>
      </UiGlassCard>

      <UiGlassCard v-else-if="filteredTeams.length === 0" class="w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/60">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Sin resultados</p>
          <p class="mt-1 text-sm text-white/60">Ningún equipo coincide con la búsqueda o el filtro aplicado.</p>
        </div>
      </UiGlassCard>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="team in paginatedTeams" :key="team.id">
          <UiGlassCard
            class="w-full"
            content-class="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 text-left"
          >
            <!-- Columna Izquierda: Botón Favorito -->
            <div class="flex items-center justify-start">
              <UiFavoriteButton
                :is-favorite="isFavoriteTeam(team.id)"
                @click="toggleFavoriteTeam(team.id)"
              />
            </div>

            <div class="flex items-center gap-2 text-xs text-white/60">
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

            <!-- Columna Derecha: Acciones (Ver, Editar, Eliminar) -->
            <div class="flex shrink-0 gap-2">
              <NuxtLink
                :to="`/teams/${team.id}`"
                title="Ver equipo"
                class="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </NuxtLink>
              <button
                title="Editar equipo"
                class="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37]/35 text-[#D4AF37] transition hover:bg-[#D4AF37]/50"
                @click="openEditModal(team)"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
              <button
                :title="blockDeleteReason(team) ?? 'Eliminar equipo'"
                :disabled="!!blockDeleteReason(team)"
                class="flex h-9 w-9 items-center justify-center rounded-full border border-red-500 bg-red-500/35 text-red-300 transition hover:bg-red-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-500/35"
                @click="askDelete(team.id)"
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

      <UiPagination
        v-if="!isLoading && !hasError && !isFiltering"
        v-model="currentPage"
        :total-items="filteredTeams.length"
        :items-per-page="itemsPerPage"
        class="mt-6"
      />
    </div>

    <TeamsTeamFormModal
      :visible="isModalOpen"
      :initial-data="teamBeingEdited"
      :teams="teams"
      :name-locked="!!teamBeingEdited && !!blockDeleteReason(teamBeingEdited)"
      @close="isModalOpen = false"
      @submit="handleSubmit"
    />

    <UiConfirmDilog
      :visible="isConfirmOpen"
      title="¿Eliminar equipo?"
      message="Esta acción no se puede deshacer."
      @cancel="isConfirmOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Team } from '~~/shared/types/team'
import type { Player } from '~~/shared/types/player'
import type { Match } from '~~/shared/types/match'

const { getAllTeams, getTeamsByGroup, createTeam, updateTeam, deleteTeam } = useTeams()
const { getAllPlayers } = usePlayers()
const { getAllMatches } = useMatches()
const { isFavoriteTeam, toggleFavoriteTeam } = useFavorites()
const { success, error } = useNotify()

const teams = ref<(Team & { id: string })[]>([])
const groupTeams = ref<(Team & { id: string })[] | null>(null)
const players = ref<(Player & { id: string })[]>([])
const matches = ref<(Match & { id: string })[]>([])

// Función que determina si un equipo puede ser eliminado o no
const blockDeleteReason = (team: Team & { id: string }): string | null => {
  if (players.value.some((p) => p.teamId === team.id)) {
    return 'No se puede eliminar: la selección tiene jugadores registrados.'
  }
  if (matches.value.some((m) => m.homeTeam === team.name || m.awayTeam === team.name)) {
    return 'No se puede eliminar: la selección tiene partidos registrados.'
  }
  return null
}

const isLoading = ref(true)
const isFiltering = ref(false)
const hasError = ref(false)
const isModalOpen = ref(false)
const isConfirmOpen = ref(false)
const teamToDelete = ref<string | null>(null)
const searchQuery = ref('')
const selectedGroup = ref('')

// Grupos distintos presentes en los equipos cargados, para el filtro
const availableGroups = computed(() =>
  [...new Set(teams.value.map((t) => t.group))].sort()
)

// Consulta a Firestore (where 'group') los equipos del grupo seleccionado
const applyGroupFilter = async (group: string) => {
  if (!group) {
    groupTeams.value = null
    return
  }
  isFiltering.value = true
  try {
    groupTeams.value = await getTeamsByGroup(group)
  } catch (err) {
    error('No se pudieron filtrar los equipos por grupo.')
    groupTeams.value = []
  } finally {
    isFiltering.value = false
  }
}

watch(selectedGroup, (group) => applyGroupFilter(group))

// Equipos filtrados por búsqueda y grupo, ordenados alfabéticamente
const filteredTeams = computed(() => {
  const source = selectedGroup.value ? (groupTeams.value ?? []) : teams.value
  const query = searchQuery.value.trim().toLowerCase()
  const result = query ? source.filter((team) => team.name.toLowerCase().includes(query)) : source
  return [...result].sort((a, b) => a.name.localeCompare(b.name))
})

const itemsPerPage = 5
const currentPage = ref(1)

// Vuelve a la primera página cada vez que cambia el resultado filtrado
watch(filteredTeams, () => {
  currentPage.value = 1
})

// Equipos a mostrar en la página actual
const paginatedTeams = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTeams.value.slice(start, start + itemsPerPage)
})

// Equipo que se está editando actualmente en el modal
const teamBeingEdited = ref<(Team & { id: string }) | null>(null)

// Carga todos los equipos, jugadores y partidos
const loadTeams = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [allTeams, allPlayers, allMatches] = await Promise.all([getAllTeams(), getAllPlayers(), getAllMatches()])
    teams.value = allTeams
    players.value = allPlayers
    matches.value = allMatches
    if (selectedGroup.value) {
      await applyGroupFilter(selectedGroup.value)
    }
  } catch (err) {
    hasError.value = true
    error('No se pudieron cargar los equipos. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

// Abre el modal para crear un nuevo equipo
const openCreateModal = () => {
  teamBeingEdited.value = null
  isModalOpen.value = true
}

// Abre el modal para editar un equipo existente
const openEditModal = (team: Team & { id: string }) => {
  teamBeingEdited.value = team
  isModalOpen.value = true
}

// Decide si el submit del modal significa crear o actualizar
const handleSubmit = async (team: Team) => {
  const isEditing = !!teamBeingEdited.value
  try {
    if (isEditing) {
      await updateTeam(teamBeingEdited.value!.id, team)
    } else {
      await createTeam(team)
    }
    isModalOpen.value = false
    await loadTeams()
    success(isEditing ? 'Equipo actualizado correctamente.' : 'Equipo creado correctamente.')
  } catch (err) {
    error(isEditing ? 'No se pudo actualizar el equipo.' : 'No se pudo crear el equipo.')
  }
}

// Abre el diálogo de confirmación para eliminar un equipo
const askDelete = (id: string) => {
  const team = teams.value.find((t) => t.id === id)
  if (!team) return

  // Verifica si hay una razón para bloquear la eliminación del equipo
  const reason = blockDeleteReason(team)
  if (reason) {
    error(reason)
    return
  }

  teamToDelete.value = id
  isConfirmOpen.value = true
}

// Elimina el equipo confirmado en el diálogo
const handleDelete = async () => {
  if (!teamToDelete.value) return
  try {
    await deleteTeam(teamToDelete.value)
    await loadTeams()
    success('Equipo eliminado correctamente.')
  } catch (err) {
    error('No se pudo eliminar el equipo.')
  } finally {
    isConfirmOpen.value = false
    teamToDelete.value = null
  }
}

onMounted(loadTeams)
</script>