<template>
  <div class="min-h-screen px-6 py-10 text-[#F5F0E6]">
    <div class="mx-auto max-w-5xl">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="font-['Bebas_Neue'] text-3xl tracking-wide">Grupos</h1>
        <UiRefreshButton :loading="isLoading" @click="loadStandings" />
      </div>

      <UiGlassCard v-if="isLoading" class="w-full">
        <svg class="h-9 w-9 animate-spin text-[#D4AF37]" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
        <p class="text-white/60">Cargando tabla de posiciones...</p>
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
          <p class="font-medium text-white">No se pudo cargar la tabla de posiciones</p>
          <p class="mt-1 text-sm text-white/60">Ocurrió un problema al conectar con el servidor.</p>
        </div>
        <button
          class="rounded-xl bg-[#D4AF37] px-5 py-2.5 font-semibold text-[#04140D] transition hover:brightness-110"
          @click="loadStandings"
        >
          Reintentar
        </button>
      </UiGlassCard>

      <UiGlassCard v-else-if="groups.length === 0" class="w-full">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-white">Todavía no hay grupos con equipos registrados</p>
          <p class="mt-1 text-sm text-white/60">Agregá selecciones con su grupo para ver la tabla de posiciones.</p>
        </div>
      </UiGlassCard>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UiGlassCard v-for="group in groups" :key="group" class="w-full" content-class="flex flex-col gap-3 px-5 py-4">
          <h2 class="font-['Bebas_Neue'] text-xl tracking-wide text-[#D4AF37]">Grupo {{ group }}</h2>

          <ul class="flex flex-col gap-2">
            <li
              v-for="standing in standingsByGroup[group]"
              :key="standing.teamId"
              class="flex items-center gap-2"
            >
              <img
                v-if="standing.flag"
                :src="standing.flag"
                :alt="`Bandera de ${standing.teamName}`"
                class="h-5 w-7 shrink-0 rounded border border-white/20 object-cover"
              >
              <span class="text-sm text-white">{{ standing.teamName }}</span>
            </li>
          </ul>

          <NuxtLink
            :to="`/groups/${group}`"
            class="mt-1 self-start rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#04140D] transition hover:brightness-110"
          >
            Ver información
          </NuxtLink>
        </UiGlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TeamStanding } from '~/composables/useStandings'

const { getGroupStandings } = useStandings()
const { error } = useNotify()

const standingsByGroup = ref<Record<string, TeamStanding[]>>({})
const isLoading = ref(true)
const hasError = ref(false)

// Grupos ordenados alfabéticamente (A, B, C...)
const groups = computed(() => Object.keys(standingsByGroup.value).sort())

const loadStandings = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    standingsByGroup.value = await getGroupStandings()
  } catch (err) {
    hasError.value = true
    error('No se pudo cargar la tabla de posiciones. Intenta de nuevo.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadStandings)
</script>
