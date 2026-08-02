<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-4xl">
      <div class="mb-4 flex items-center justify-between">
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">Grupo {{ groupId }}</h1>
        <button
          title="Actualizar"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 text-white transition hover:bg-white/35 disabled:opacity-50"
          :disabled="isLoading"
          @click="loadStandings"
        >
          <svg class="h-4 w-4" :class="{ 'animate-spin': isLoading }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </div>

      <div v-if="groupKeys.length > 0" class="mb-6 flex flex-wrap items-center gap-1.5">
        <NuxtLink
          to="/groups"
          class="rounded-lg px-2.5 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          Todos
        </NuxtLink>
        <NuxtLink
          v-for="key in groupKeys"
          :key="key"
          :to="`/groups/${key}`"
          class="rounded-lg px-2.5 py-1.5 text-sm text-white/70 transition hover:bg-white/10"
          :class="key === groupId ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : ''"
        >
          {{ key }}
        </NuxtLink>
      </div>

      <UiGlassCard v-if="isLoading" class="w-full">
        <p class="text-white/60">Calculando tabla de posiciones...</p>
      </UiGlassCard>

      <UiGlassCard v-else-if="hasError" class="w-full">
        <p class="text-red-300">No se pudo calcular la tabla de posiciones.</p>
        <button class="mt-3 rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#04140D]" @click="loadStandings">
          Reintentar
        </button>
      </UiGlassCard>

      <UiGlassCard v-else-if="standings.length === 0" class="w-full">
        <p class="text-white/60">Todavía no hay equipos ni partidos registrados en este grupo.</p>
      </UiGlassCard>

      <UiGlassCard v-else class="w-full" content-class="overflow-x-auto p-0">
        <table class="w-full text-left text-base">
          <thead>
            <tr class="border-b border-white/15 text-white/50">
              <th class="px-5 py-4">#</th>
              <th class="px-5 py-4">Equipo</th>
              <th class="px-3 py-4 text-center">PJ</th>
              <th class="px-3 py-4 text-center">G</th>
              <th class="px-3 py-4 text-center">E</th>
              <th class="px-3 py-4 text-center">P</th>
              <th class="px-3 py-4 text-center">GF</th>
              <th class="px-3 py-4 text-center">GC</th>
              <th class="px-3 py-4 text-center">DG</th>
              <th class="px-5 py-4 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(team, index) in standings"
              :key="team.teamId"
              class="border-b border-white/5"
            >
              <td class="px-5 py-4 text-white/50">{{ index + 1 }}</td>
              <td class="flex items-center gap-2.5 px-5 py-4">
                <img v-if="team.flag" :src="team.flag" :alt="team.teamName" class="h-5 w-7 rounded-sm object-cover">
                <span>{{ team.teamName }}</span>
              </td>
              <td class="px-3 py-4 text-center">{{ team.played }}</td>
              <td class="px-3 py-4 text-center">{{ team.won }}</td>
              <td class="px-3 py-4 text-center">{{ team.drawn }}</td>
              <td class="px-3 py-4 text-center">{{ team.lost }}</td>
              <td class="px-3 py-4 text-center">{{ team.goalsFor }}</td>
              <td class="px-3 py-4 text-center">{{ team.goalsAgainst }}</td>
              <td class="px-3 py-4 text-center">{{ team.goalDifference }}</td>
              <td class="px-5 py-4 text-center font-semibold text-[#D4AF37]">{{ team.points }}</td>
            </tr>
          </tbody>
        </table>
      </UiGlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamStanding } from '~/composables/useStandings'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
// El grupo actual se obtiene de la URL
const groupId = computed(() => route.params.group as string)

const { getGroupStandings } = useStandings()

const allGroups = ref<Record<string, TeamStanding[]>>({})
const isLoading = ref(true)
const hasError = ref(false)

// Todos los grupos ya cargados
const groupKeys = computed(() => Object.keys(allGroups.value).sort())

// Tabla de posiciones del grupo actual
const standings = computed(() => allGroups.value[groupId.value] ?? [])

// Carga la tabla de posiciones de todos los grupos
const loadStandings = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    allGroups.value = await getGroupStandings()
  } catch (error) {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStandings)
</script>