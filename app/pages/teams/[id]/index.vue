<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-2xl">
      <div class="flex items-center justify-between">
        <NuxtLink to="/teams" class="text-sm text-[#D4AF37] hover:underline">
          ← Volver a selecciones
        </NuxtLink>
        <button
          title="Actualizar"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isLoading"
          @click="loadTeam"
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
        <p class="text-white/60">Cargando equipo...</p>
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
          <p class="font-medium text-white">No se pudo cargar el equipo</p>
          <p class="mt-1 text-sm text-white/60">Ocurrió un problema al conectar con el servidor.</p>
        </div>
        <button
          class="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
          @click="loadTeam"
        >
          Reintentar
        </button>
      </UiGlassCard>

      <UiGlassCard v-else-if="!team" class="mt-6 w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Equipo no encontrado</p>
          <p class="mt-1 text-sm text-white/60">Puede que haya sido eliminado o el enlace sea incorrecto.</p>
        </div>
      </UiGlassCard>

      <UiGlassCard v-else class="mt-6 w-full" content-class="text-left px-8 py-8">
        <div class="flex items-center gap-4">
          <img
            v-if="team.flag"
            :src="team.flag"
            :alt="`Bandera de ${team.name}`"
            class="h-12 w-16 rounded object-cover"
          >
          <div>
            <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">{{ team.name }}</h1>
            <p class="text-sm text-white/60">Grupo {{ team.group }}</p>
          </div>
        </div>

        <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-white/50">Entrenador</dt>
            <dd class="mt-1 text-base">{{ team.coach || '—' }}</dd>
          </div>
          <div>
            <dt class="text-white/50">Confederación</dt>
            <dd class="mt-1 text-base">{{ team.confederation || '—' }}</dd>
          </div>
          <div>
            <dt class="text-white/50">Ranking FIFA</dt>
            <dd class="mt-1 text-base">{{ team.fifaRanking }}</dd>
          </div>
        </dl>

        <NuxtLink
          :to="`/teams/${team.id}/players`"
          class="mt-8 inline-block rounded-xl bg-[#D4AF37] px-4 py-2 font-semibold text-[#04140D] hover:brightness-110"
        >
          Ver plantilla de jugadores →
        </NuxtLink>
      </UiGlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Team } from '~~/shared/types/team'

const route = useRoute()
const { getTeamById } = useTeams()
const { error } = useNotify()

const team = ref<(Team & { id: string }) | null>(null)
const isLoading = ref(true)
const hasError = ref(false)

// Función para cargar los datos del equipo según el ID de la ruta
const loadTeam = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const id = route.params.id as string
    team.value = await getTeamById(id)
  } catch (err) {
    hasError.value = true
    error('No se pudo cargar el equipo. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTeam)
</script>