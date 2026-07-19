<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-2xl">
      <NuxtLink to="/teams" class="text-sm text-[#D4AF37] hover:underline">
        ← Volver a selecciones
      </NuxtLink>

      <p v-if="isLoading" class="mt-6 text-white/60">Cargando equipo...</p>

      <UiGlassCard v-else-if="team" class="mt-6 w-full" content-class="text-left px-8 py-8">
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

      <p v-else class="mt-6 text-white/60">Equipo no encontrado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Team } from '~~/shared/types/team'

const route = useRoute()
const { getTeamById } = useTeams()

const team = ref<(Team & { id: string }) | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  const id = route.params.id as string
  team.value = await getTeamById(id)
  isLoading.value = false
})
</script>