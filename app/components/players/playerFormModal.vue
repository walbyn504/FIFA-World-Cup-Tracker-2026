<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-[#04140D]/70 backdrop-blur-sm"
    >
      <UiGlassCard class="w-full max-w-md" content-class="text-left px-8 py-8">
        <h2 class="mb-5 font-['Bebas_Neue'] text-2xl tracking-wide text-white">
          {{ isEditing ? 'Editar jugador' : 'Nuevo jugador' }}
        </h2>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Selección
            <select
              v-model="form.teamId"
              :disabled="teamLocked"
              class="rounded-xl border bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
              :class="errors.teamId ? 'border-red-400/60' : 'border-white/20'"
            >
              <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Selecciona un equipo</option>
              <option
                v-for="team in sortedTeams"
                :key="team.id"
                :value="team.id"
                class="bg-[#0F1F17] text-[#F5F0E6]"
              >
                {{ team.name }}
              </option>
            </select>
            <p v-if="teamLocked" class="text-xs text-white/40">
              No se puede cambiar: esta selección tiene un partido programado o en vivo, o todavía sigue en competencia.
            </p>
            <span v-if="errors.teamId" class="text-xs text-red-400">{{ errors.teamId }}</span>
          </label>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Nombre
            <input
              v-model="form.name"
              class="rounded-xl border bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
              :class="errors.name ? 'border-red-400/60' : 'border-white/20'"
            >
            <span v-if="errors.name" class="text-xs text-red-400">{{ errors.name }}</span>
          </label>

          <div class="grid grid-cols-2 gap-4">
            <label class="flex flex-col gap-1.5 text-sm text-white/70">
              Número
              <input
                v-model.number="form.number"
                type="number"
                class="rounded-xl border bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
                :class="errors.number ? 'border-red-400/60' : 'border-white/20'"
              >
              <span v-if="errors.number" class="text-xs text-red-400">{{ errors.number }}</span>
            </label>

            <label class="flex flex-col gap-1.5 text-sm text-white/70">
              Posición
              <select
                v-model="form.position"
                class="rounded-xl border bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37]"
                :class="errors.position ? 'border-red-400/60' : 'border-white/20'"
              >
                <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Selecciona</option>
                <option
                  v-for="pos in positions"
                  :key="pos"
                  :value="pos"
                  class="bg-[#0F1F17] text-[#F5F0E6]"
                >
                  {{ pos }}
                </option>
              </select>
              <span v-if="errors.position" class="text-xs text-red-400">{{ errors.position }}</span>
            </label>
          </div>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Club
            <div class="group relative">
              <div
                aria-hidden="true"
                class="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-pre rounded-xl border bg-white/5 px-3 py-2.5 group-focus-within:border-[#D4AF37]"
                :class="errors.club ? 'border-red-400/60' : 'border-white/20'"
              >
                <span class="invisible">{{ form.club }}</span><span class="text-white/30">{{ clubSuggestionTail }}</span>
              </div>
              <input
                v-model="form.club"
                autocomplete="off"
                class="relative w-full whitespace-pre bg-transparent px-3 py-2.5 text-[#F5F0E6] outline-none"
                @keydown.tab="acceptClubSuggestion"
                @keydown.right="acceptClubSuggestion"
              >
            </div>
            <span v-if="errors.club" class="text-xs text-red-400">{{ errors.club }}</span>
          </label>

          <label class="flex items-center gap-2 text-sm text-white/70">
            <input
              v-model="form.isStarter"
              type="checkbox"
              class="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#D4AF37]"
            >
            Titular
          </label>
          <span v-if="errors.isStarter" class="-mt-3 text-xs text-red-400">{{ errors.isStarter }}</span>

          <div class="mt-2 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-xl border border-white/20 px-4 py-2.5 text-[#F5F0E6] hover:bg-white/5"
              @click="$emit('close')"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-xl bg-[#D4AF37] px-4 py-2.5 font-semibold text-[#04140D] hover:brightness-110"
            >
              {{ isEditing ? 'Guardar cambios' : 'Crear jugador' }}
            </button>
          </div>
        </form>
      </UiGlassCard>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Player } from '~~/shared/types/player'
import type { Team } from '~~/shared/types/team'
import type { Match } from '~~/shared/types/match'
import type { TeamStanding } from '~/composables/useStandings'
import { isTeamStillInContention } from '~/composables/useBracket'
import { clubNames } from '~/utils/clubCatalog'

// Define las propiedades que el componente espera recibir
const props = defineProps<{
  visible: boolean
  initialData?: (Player & { id?: string }) | null
  teams: (Team & { id: string })[]
  players: (Player & { id: string })[]
  matches: (Match & { id: string })[]
  standings: Record<string, TeamStanding[]>
}>()

// Define los eventos que el componente puede emitir
const emit = defineEmits<{
  close: []
  submit: [player: Player]
}>()

const positions = ['Defensa', 'Delantero', 'Mediocampista', 'Portero']

// Selecciones ordenadas alfabéticamente, para el select de "Selección"
const sortedTeams = computed(() => [...props.teams].sort((a, b) => a.name.localeCompare(b.name)))

// Define un jugador vacío para inicializar el formulario
const emptyPlayer: Player = {
  teamId: '',
  name: '',
  number: 0,
  position: '',
  club: '',
  isStarter: false
}

// Define el estado del formulario y si se está editando un jugador existente
const form = ref<Player>({ ...emptyPlayer })
const isEditing = computed(() => !!props.initialData)

// No se puede reasignar a un jugador de selección si la que ya tiene ahora
// mismo tiene un partido programado o en vivo, o si todavía sigue en
// competencia en la llave eliminatoria (no tendría sentido alterar esa
// plantilla a último momento)
const teamLocked = computed(() => {
  if (!isEditing.value || !props.initialData?.teamId) return false
  const team = props.teams.find((t) => t.id === props.initialData!.teamId)
  if (!team) return false

  const hasPendingMatch = props.matches.some(
    (m) => (m.homeTeam === team.name || m.awayTeam === team.name) && m.status !== 'finished'
  )
  if (hasPendingMatch) return true

  return isTeamStillInContention(team.name, props.standings, props.matches)
})

// Guarda los mensajes de error por campo
const errors = ref<Record<string, string>>({})

// Primer club del catálogo cuyo nombre empieza con lo ya escrito (si hay alguno)
const clubSuggestion = computed(() => {
  const typed = form.value.club
  if (!typed) return ''
  return clubNames.find((name) => name.toLowerCase().startsWith(typed.toLowerCase())) ?? ''
})

// Lo que falta del nombre sugerido, para mostrarlo como texto "fantasma" dentro del input
const clubSuggestionTail = computed(() => {
  if (!clubSuggestion.value) return ''
  return clubSuggestion.value.slice(form.value.club.length)
})

// Acepta la sugerencia con Tab, o con flecha derecha si el cursor ya está al final del texto
const acceptClubSuggestion = (event: KeyboardEvent) => {
  if (!clubSuggestionTail.value) return

  const input = event.target as HTMLInputElement
  if (event.key === 'ArrowRight' && input.selectionStart !== input.value.length) return

  event.preventDefault()
  form.value.club = clubSuggestion.value
  nextTick(() => input.setSelectionRange(form.value.club.length, form.value.club.length))
}

// Permite que el formulario se actualice cuando cambie la propiedad
// `visible` o `initialData`
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      form.value = props.initialData ? { ...props.initialData } : { ...emptyPlayer }
      errors.value = {}
    }
  }
)

// Revisa cada campo y llena `errors` si algo no es válido.
// Devuelve true si el formulario está listo para enviarse.
const validate = (): boolean => {
  errors.value = {}

  if (!form.value.teamId) {
    errors.value.teamId = 'La selección es obligatoria.'
  }

  if (!form.value.name?.trim()) {
    errors.value.name = 'El nombre es obligatorio.'
  }

  if (!form.value.number || form.value.number <= 0) {
    errors.value.number = 'El número es obligatorio y debe ser mayor a 0.'
  } else if (
    form.value.teamId &&
    props.players.some(
      (p) =>
        p.teamId === form.value.teamId &&
        p.number === form.value.number &&
        p.id !== props.initialData?.id
    )
  ) {
    errors.value.number = 'Ya existe un jugador con ese número en esta selección.'
  }

  if (!form.value.position) {
    errors.value.position = 'La posición es obligatoria.'
  }

  if (!form.value.club?.trim()) {
    errors.value.club = 'El club es obligatorio.'
  }

  if (form.value.isStarter && form.value.teamId) {
    const otherStarters = props.players.filter(
      (p) => p.teamId === form.value.teamId && p.isStarter && p.id !== props.initialData?.id
    )
    if (otherStarters.length >= 11) {
      errors.value.isStarter = 'Ya hay 11 titulares en esta selección.'
    } else if (form.value.position === 'Portero' && otherStarters.some((p) => p.position === 'Portero')) {
      errors.value.isStarter = 'Ya hay un portero titular en esta selección.'
    }
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', form.value)
}
</script>
