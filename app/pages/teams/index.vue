<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-3xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">Selecciones</h1>
        <button
          class="rounded-xl bg-[#D4AF37] px-4 py-2 font-semibold text-[#04140D] hover:brightness-110"
          @click="openCreateModal"
        >
          + Agregar equipo
        </button>
      </div>

      <p v-if="isLoading" class="text-white/60">Cargando equipos...</p>

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
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
              >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
              </NuxtLink>
              <button
                  title="Editar equipo"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#D4AF37] transition hover:bg-[#D4AF37]/25"
                  @click="openEditModal(team)"
              >
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
              </button>
              <button
                  title="Eliminar equipo"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-red-400/50 bg-red-500/15 text-red-300 transition hover:bg-red-500/25"
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

const teams = ref<(Team & { id: string })[]>([])
const isLoading = ref(true)
const isModalOpen = ref(false)
const isConfirmOpen = ref(false)
const teamToDelete = ref<string | null>(null)

// Guarda el equipo que se esta editando (con su id).
// Si es null, el modal esta en modo "crear"
const teamBeingEdited = ref<(Team & { id: string }) | null>(null)

const loadTeams = async () => {
  isLoading.value = true
  teams.value = await getAllTeams()
  isLoading.value = false
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
  if (teamBeingEdited.value) {
    await updateTeam(teamBeingEdited.value.id, team)
  } else {
    await createTeam(team)
  }
  isModalOpen.value = false
  await loadTeams()
}

const askDelete = (id: string) => {
  teamToDelete.value = id
  isConfirmOpen.value = true
}

const handleDelete = async () => {
  if (!teamToDelete.value) return
  await deleteTeam(teamToDelete.value)
  isConfirmOpen.value = false
  teamToDelete.value = null
  await loadTeams()
}

onMounted(loadTeams)
</script>