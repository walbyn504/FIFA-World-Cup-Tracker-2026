<template>
  <div class="min-h-screen bg-[#04140D] px-6 py-10 text-[#F5F0E6]">
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
        <li
          v-for="team in teams"
          :key="team.id"
          class="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-5 py-4"
        >
          <div>
            <strong class="text-lg">{{ team.name }}</strong>
            <span class="ml-2 text-sm text-white/60">Grupo {{ team.group }}</span>
          </div>
          <div class="flex gap-2">
            <NuxtLink
                :to="`/teams/${team.id}`"
                class="rounded-lg border border-white/25 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
            >
                Ver
            </NuxtLink>
            <button
                class="rounded-lg border border-[#D4AF37]/40 px-3 py-1.5 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10"
                @click="openEditModal(team)"
            >
                Editar
            </button>
            <button
                class="rounded-lg border border-red-400/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-400/10"
                @click="handleDelete(team.id)"
            >
                Eliminar
            </button>
            </div>
        </li>
      </ul>
    </div>

    <TeamsTeamFormModal
      :visible="isModalOpen"
      :initial-data="teamBeingEdited"
      @close="isModalOpen = false"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import type { Team } from '~~/shared/types/team'

const { getAllTeams, createTeam, updateTeam, deleteTeam } = useTeams()

const teams = ref<(Team & { id: string })[]>([])
const isLoading = ref(true)
const isModalOpen = ref(false)

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

const handleDelete = async (id: string) => {
  await deleteTeam(id)
  await loadTeams()
}

onMounted(loadTeams)
</script>