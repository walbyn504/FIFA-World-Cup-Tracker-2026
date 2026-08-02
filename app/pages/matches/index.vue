<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">Partidos</h1>
        <div class="flex items-center gap-2">
          <UiRefreshButton :loading="isLoading" @click="loadMatches" />
          <UiAddButton label="Agregar partido" @click="openCreateModal" />
        </div>
      </div>

      <div v-if="!hasError && matches.length > 0" class="mb-5 flex flex-col gap-3">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por estadio o ciudad..."
          class="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
        >
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <select
            v-model="selectedTeamName"
            class="flex-1 rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37]"
          >
            <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Todas las selecciones</option>
            <option
              v-for="team in sortedTeams"
              :key="team.id"
              :value="team.name"
              class="bg-[#0F1F17] text-[#F5F0E6]"
            >
              {{ team.name }}
            </option>
          </select>

          <select
            v-model="selectedStage"
            :disabled="isFiltering"
            class="flex-1 rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
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
            v-if="selectedStage === 'Fase de grupos'"
            v-model="selectedGroup"
            :disabled="isFiltering"
            class="flex-1 rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
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

          <select
            v-model="selectedStatus"
            class="flex-1 rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37]"
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

          <input
            v-model="selectedDate"
            type="date"
            class="rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37]"
          >
        </div>
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
          @click="loadMatches"
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
          <p class="font-medium text-white">Todavía no hay partidos registrados</p>
          <p class="mt-1 text-sm text-white/60">Agregá el primer partido para empezar a armar el calendario.</p>
        </div>
      </UiGlassCard>

      <UiGlassCard v-else-if="isFiltering" class="w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Filtrando partidos...</p>
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
          <p class="mt-1 text-sm text-white/60">Ningún partido coincide con la búsqueda o los filtros aplicados.</p>
        </div>
      </UiGlassCard>

      <ul v-else class="flex flex-col gap-3">
        <li v-for="match in paginatedMatches" :key="match.id">
          <UiGlassCard class="w-full" content-class="flex items-center justify-between gap-4 px-5 py-4 text-left">
            <!-- Bloque izquierdo: Botón de favorito + Info del partido -->
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <UiFavoriteButton
                :is-favorite="isFavoriteMatch(match.id)"
                @click="toggleFavoriteMatch(match.id)"
              />

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
                  <span class="shrink-0 font-bold text-yellow-300">{{ match.homeScore }} - {{ match.awayScore }}</span>
                  <strong class="truncate">{{ match.awayTeam }}</strong>
                  <img
                    v-if="teamFlag(match.awayTeam)"
                    :src="teamFlag(match.awayTeam)"
                    :alt="`Bandera de ${match.awayTeam}`"
                    class="h-5 w-7 shrink-0 rounded object-cover border border-white/20"
                  >
                </div>
                <div class="mt-1 text-sm text-white/60">{{ match.stadium }} · {{ match.city }}</div>
              </div>
            </div>

            <!-- Bloque derecho: Estado + Acciones -->
            <div class="flex shrink-0 flex-col items-end gap-2">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="statusBadgeClass(match.status)"
              >
                {{ matchStatusLabels[match.status] }}
              </span>
              <div class="flex gap-2">
                <NuxtLink
                  :to="`/matches/${match.id}`"
                  title="Ver partido"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </NuxtLink>
                <button
                  title="Editar partido"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37]/35 text-[#D4AF37] transition hover:bg-[#D4AF37]/50"
                  @click="openEditModal(match)"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
                <button
                  :title="deleteBlockReason(match) || 'Eliminar partido'"
                  :disabled="!!deleteBlockReason(match)"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-red-500 bg-red-500/35 text-red-300 transition hover:bg-red-500/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-500/35"
                  @click="askDelete(match.id)"
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
            </div>
          </UiGlassCard>
        </li>
      </ul>

      <UiPagination
        v-if="!isLoading && !hasError && !isFiltering"
        v-model="currentPage"
        :total-items="filteredMatches.length"
        :items-per-page="itemsPerPage"
        class="mt-6"
      />
    </div>

    <MatchesMatchFormModal
      :visible="isModalOpen"
      :initial-data="matchBeingEdited"
      :teams="teams"
      :matches="matches"
      :players="players"
      :unlocked-stages="unlockedStages"
      :projected-bracket="projectedBracket"
      @close="isModalOpen = false"
      @submit="handleSubmit"
    />

    <UiConfirmDilog
      :visible="isConfirmOpen"
      title="¿Eliminar partido?"
      message="Esta acción no se puede deshacer."
      @cancel="isConfirmOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'
import type { Match, MatchStatus } from '~~/shared/types/match'
import type { Team } from '~~/shared/types/team'
import type { Player } from '~~/shared/types/player'
import type { TeamStanding } from '~/composables/useStandings'

definePageMeta({
  middleware: 'auth'
})
import { getUnlockedStages, computeProjectedBracket } from '~/composables/useBracket'
import { matchStages, matchStatuses, matchStatusLabels } from '~/utils/matchOptions'

const { getAllMatches, getMatchesByStage, getMatchesByGroup, createMatch, updateMatch, deleteMatch } = useMatches()
const { getAllTeams } = useTeams()
const { getAllPlayers } = usePlayers()
const { generateBracket, bracketStages } = useBracket()
const { getGroupStandings } = useStandings()
const { toggleFavoriteMatch, isFavoriteMatch } = useFavorites()
const { success, error } = useNotify()

const matches = ref<(Match & { id: string })[]>([])
const queriedMatches = ref<(Match & { id: string })[] | null>(null)
const teams = ref<(Team & { id: string })[]>([])
const players = ref<(Player & { id: string })[]>([])
const standings = ref<Record<string, TeamStanding[]>>({})

// Obtiene los grupos desbloqueados y el cuadro de eliminación proyectado según los resultados actuales
const unlockedStages = computed(() => getUnlockedStages(standings.value, matches.value))
const projectedBracket = computed(() => computeProjectedBracket(standings.value, matches.value))

const isLoading = ref(true)
const isFiltering = ref(false)
const hasError = ref(false)
const isModalOpen = ref(false)
const isConfirmOpen = ref(false)
const matchToDelete = ref<string | null>(null)
const searchQuery = ref('')
const selectedTeamName = ref('')
const selectedStage = ref('')
const selectedGroup = ref('')
const selectedStatus = ref<MatchStatus | ''>('')
const selectedDate = ref('')

// El partido que se está editando actualmente
const matchBeingEdited = ref<(Match & { id: string }) | null>(null)

// Obtiene los grupos disponibles según los equipos cargados
const availableGroups = computed(() => [...new Set(teams.value.map((t) => t.group))].sort())
const sortedTeams = computed(() => [...teams.value].sort((a, b) => a.name.localeCompare(b.name)))

// Devuelve la bandera de un equipo dado su nombre
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

// Carga los datos de los partidos, equipos, jugadores y tabla de posiciones
const applyQueryFilter = async () => {
  if (!selectedGroup.value && !selectedStage.value) {
    queriedMatches.value = null
    return
  }
  isFiltering.value = true
  try {
    queriedMatches.value = selectedGroup.value
      ? await getMatchesByGroup(selectedGroup.value)
      : await getMatchesByStage(selectedStage.value)
  } catch (err) {
    error('No se pudieron filtrar los partidos.')
    queriedMatches.value = []
  } finally {
    isFiltering.value = false
  }
}

// Vuelve a limpiar el grupo seleccionado si se cambia la fase
watch(selectedStage, (stage) => {
  if (stage !== 'Fase de grupos') selectedGroup.value = ''
})

// Vuelve a aplicar el filtro cada vez que cambian la fase o el grupo
watch([selectedStage, selectedGroup], applyQueryFilter)

// Filtra los partidos según los filtros aplicados
const filteredMatches = computed(() => {
  let result = (selectedStage.value || selectedGroup.value) ? (queriedMatches.value ?? []) : matches.value

  // Filtra por equipo seleccionado
  if (selectedTeamName.value) {
    result = result.filter(
      (match) => match.homeTeam === selectedTeamName.value || match.awayTeam === selectedTeamName.value
    )
  }

  // Filtra por estado del partido
  if (selectedStatus.value) {
    result = result.filter((match) => match.status === selectedStatus.value)
  }

  // Filtra por fecha seleccionada
  if (selectedDate.value) {
    result = result.filter((match) => {
      const kickoffDate = match.kickoff.toDate()
      const pad = (n: number) => String(n).padStart(2, '0')
      const isoDate = `${kickoffDate.getFullYear()}-${pad(kickoffDate.getMonth() + 1)}-${pad(kickoffDate.getDate())}`
      return isoDate === selectedDate.value
    })
  }

  // Filtra por búsqueda de estadio o ciudad
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    result = result.filter(
      (match) => match.stadium.toLowerCase().includes(query) || match.city.toLowerCase().includes(query)
    )
  }

  // Ordena los partidos por estado y fecha
  const statusOrder: Record<MatchStatus, number> = { live: 0, scheduled: 1, finished: 2 }
  return [...result].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff

    const timeDiff = a.kickoff.toDate().getTime() - b.kickoff.toDate().getTime()
    return a.status === 'finished' ? -timeDiff : timeDiff
  })
})

const itemsPerPage = 3
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

// Carga los partidos, equipos, jugadores y tabla de posiciones
const loadMatches = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const [allMatches, allTeams, allPlayers, groupStandings] = await Promise.all([
      getAllMatches(), getAllTeams(), getAllPlayers(), getGroupStandings()
    ])
    matches.value = allMatches
    teams.value = allTeams
    players.value = allPlayers
    standings.value = groupStandings
    if (selectedStage.value || selectedGroup.value) {
      await applyQueryFilter()
    }
  } catch (err) {
    hasError.value = true
    error('No se pudieron cargar los partidos. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

// Abre el modal para crear un nuevo partido
const openCreateModal = () => {
  matchBeingEdited.value = null
  isModalOpen.value = true
}

// Abre el modal para editar un partido existente
const openEditModal = (match: Match & { id: string }) => {
  matchBeingEdited.value = match
  isModalOpen.value = true
}

// Maneja la creación o actualización de un partido
const handleSubmit = async (match: Match) => {
  const isEditing = !!matchBeingEdited.value
  try {
    if (isEditing) {
      await updateMatch(matchBeingEdited.value!.id, match)
    } else {
      await createMatch(match)
    }
    isModalOpen.value = false
    await loadMatches()
    success(isEditing ? 'Partido actualizado correctamente.' : 'Partido creado correctamente.')

    if (match.status === 'finished') {
      const messages = await generateBracket()
      const relevant = messages.filter((m) => m && !m.includes('ya estaba generado'))
      if (relevant.length > 0) success(relevant.join(' '))
    }
  } catch (err) {
    error(isEditing ? 'No se pudo actualizar el partido.' : 'No se pudo crear el partido.')
  }
}

// Restricciones para eliminar un partido
const deleteBlockReason = (match: Match & { id: string }): string => {
  if (match.status === 'finished') return 'Un partido finalizado no se puede eliminar'
  if (bracketStages.includes(match.stage)) return 'Un cruce de eliminatoria no se puede eliminar, solo editar'
  return ''
}

// Abre el diálogo de confirmación para eliminar un partido
const askDelete = (id: string) => {
  const match = matches.value.find((m) => m.id === id)
  if (!match || deleteBlockReason(match)) return

  matchToDelete.value = id
  isConfirmOpen.value = true
}

// Maneja la eliminación de un partido
const handleDelete = async () => {
  if (!matchToDelete.value) return
  try {
    await deleteMatch(matchToDelete.value)
    await loadMatches()
    success('Partido eliminado correctamente.')
  } catch (err) {
    error('No se pudo eliminar el partido.')
  } finally {
    isConfirmOpen.value = false
    matchToDelete.value = null
  }
}

onMounted(loadMatches)
</script>