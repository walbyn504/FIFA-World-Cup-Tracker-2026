<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">Selecciones</h1>
        <div class="flex items-center gap-2">
          <button
            title="Actualizar lista"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isLoading"
            @click="loadTeams"
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
            + Agregar equipo
          </button>
        </div>
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

      <ul v-else class="flex flex-col gap-3">
        <li v-for="team in teams" :key="team.id">
          <UiGlassCard
            class="w-full"
            content-class="flex items-center justify-between gap-4 px-5 py-4 text-left"
          >
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
                  title="Eliminar equipo"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-red-500 bg-red-500/35 text-red-300 transition hover:bg-red-500/50"
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
    </div>

    <TeamsTeamFormModal
      :visible="isModalOpen"
      :initial-data="teamBeingEdited"
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

const { getAllTeams, createTeam, updateTeam, deleteTeam } = useTeams()
const { success, error } = useNotify()

const teams = ref<(Team & { id: string })[]>([])
const isLoading = ref(true)
const hasError = ref(false)
const isModalOpen = ref(false)
const isConfirmOpen = ref(false)
const teamToDelete = ref<string | null>(null)

// Guarda el equipo que se esta editando (con su id).
// Si es null, el modal esta en modo "crear"
const teamBeingEdited = ref<(Team & { id: string }) | null>(null)

const loadTeams = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    teams.value = await getAllTeams()
  } catch (err) {
    hasError.value = true
    error('No se pudieron cargar los equipos. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  teamBeingEdited.value = null
  isModalOpen.value = true
}

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

const askDelete = (id: string) => {
  teamToDelete.value = id
  isConfirmOpen.value = true
}

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