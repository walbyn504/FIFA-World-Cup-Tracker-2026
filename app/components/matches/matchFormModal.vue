<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-[#04140D]/70 backdrop-blur-sm"
    >
      <UiGlassCard class="w-full max-w-md" content-class="text-left px-8 py-8">
        <h2 class="mb-5 font-['Bebas_Neue'] text-2xl tracking-wide text-white">
          {{ isEditing ? 'Editar partido' : 'Nuevo partido' }}
        </h2>

        <form class="match-form-scroll flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1" novalidate @submit.prevent="handleSubmit">
          <p v-if="isFinished" class="-mb-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60">
            Este partido ya está finalizado: no se puede editar ni eliminar.
          </p>
          <p v-else-if="isLocked" class="-mb-1 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60">
            Este partido ya está {{ matchStatusLabels[props.initialData!.status].toLowerCase() }}: solo se puede actualizar el marcador y el estado.
          </p>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Fase
            <select
              v-model="form.stage"
              :disabled="isLocked"
              class="rounded-xl border bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] 
              outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
              :class="errors.stage ? 'border-red-400/60' : 'border-white/20'"
            >
              <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Selecciona una fase</option>
              <option
                v-for="stage in availableStages"
                :key="stage"
                :value="stage"
                class="bg-[#0F1F17] text-[#F5F0E6]"
              >
                {{ stage }}
              </option>
            </select>
            <p v-if="!isLocked" class="text-xs text-white/40">
              Las fases de eliminación directa se habilitan solas a medida que avanza el torneo.
            </p>
            <span v-if="errors.stage" class="text-xs text-red-400">{{ errors.stage }}</span>
          </label>
          <div class="grid grid-cols-2 gap-4">
            <label class="flex flex-col gap-1.5 text-sm text-white/70">
              Local
              <select
                v-model="form.homeTeam"
                :disabled="isLocked"
                class="rounded-xl border bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-
                [#D4AF37] disabled:cursor-not-allowed disabled:opacity-90 disabled:text-white"
                :class="errors.homeTeam ? 'border-red-400/60' : 'border-white/20'"
              >
                <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Selecciona un equipo</option>
                <option
                  v-for="team in availableHomeTeams"
                  :key="team.id"
                  :value="team.name"
                  class="bg-[#0F1F17] text-[#F5F0E6]"
                >
                  {{ team.name }}
                </option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-sm text-white/70">
              Visitante
              <select
                v-model="form.awayTeam"
                :disabled="isLocked"
                class="rounded-xl border bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-
                [#D4AF37] disabled:cursor-not-allowed disabled:opacity-90 disabled:text-white"
                :class="errors.awayTeam ? 'border-red-400/60' : 'border-white/20'"
              >
                <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Selecciona un equipo</option>
                <option
                  v-for="team in availableAwayTeams"
                  :key="team.id"
                  :value="team.name"
                  class="bg-[#0F1F17] text-[#F5F0E6]"
                >
                  {{ team.name }}
                </option>
              </select>
            </label>
          </div>
          <span v-if="errors.homeTeam" class="text-xs text-red-400">{{ errors.homeTeam }}</span>
          <span v-if="errors.awayTeam" class="-mt-2 text-xs text-red-400">{{ errors.awayTeam }}</span>
          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Ciudad
            <select
              v-model="form.city"
              :disabled="isLocked"
              class="rounded-xl border bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] 
              disabled:cursor-not-allowed disabled:opacity-50"
              :class="errors.city ? 'border-red-400/60' : 'border-white/20'"
            >
              <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Selecciona una ciudad</option>
              <option
                v-for="city in availableCities"
                :key="city"
                :value="city"
                class="bg-[#0F1F17] text-[#F5F0E6]"
              >
                {{ city }}
              </option>
            </select>
            <span v-if="errors.city" class="text-xs text-red-400">{{ errors.city }}</span>
          </label>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Estadio
            <select
              v-model="form.stadium"
              :disabled="isLocked || !form.city"
              class="rounded-xl border bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] 
              disabled:cursor-not-allowed disabled:opacity-50"
              :class="errors.stadium ? 'border-red-400/60' : 'border-white/20'"
            >
              <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Selecciona un estadio</option>
              <option
                v-for="stadium in availableStadiums"
                :key="stadium"
                :value="stadium"
                class="bg-[#0F1F17] text-[#F5F0E6]"
              >
                {{ stadium }}
              </option>
            </select>
            <span v-if="errors.stadium" class="text-xs text-red-400">{{ errors.stadium }}</span>
          </label>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Estado
            <select
              v-model="form.status"
              :disabled="isFinished"
              class="rounded-xl border bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
              :class="errors.status ? 'border-red-400/60' : 'border-white/20'"
            >
              <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Selecciona un estado</option>
              <option
                v-for="option in availableStatuses"
                :key="option.value"
                :value="option.value"
                class="bg-[#0F1F17] text-[#F5F0E6]"
              >
                {{ option.label }}
              </option>
            </select>
            <span v-if="errors.status" class="text-xs text-red-400">{{ errors.status }}</span>
          </label>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Fecha y hora
            <input
              v-model="form.kickoff"
              type="datetime-local"
              :min="form.status === 'scheduled' ? nowKickoff() : undefined"
              :max="form.status !== 'scheduled' ? nowKickoff() : undefined"
              :disabled="isLocked"
              class="rounded-xl border bg-white/5 px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] 
              disabled:cursor-not-allowed disabled:opacity-50"
              :class="errors.kickoff ? 'border-red-400/60' : 'border-white/20'"
            >
            <span v-if="errors.kickoff" class="text-xs text-red-400">{{ errors.kickoff }}</span>
          </label>

          <div v-if="form.status !== 'scheduled'" class="grid grid-cols-2 gap-4">
            <label class="flex flex-col gap-1.5 text-sm text-white/70">
              Goles local
              <input
                v-model.number="form.homeScore"
                type="number"
                min="0"
                :max="MAX_GOALS"
                :disabled="isFinished"
                class="rounded-xl border bg-white/5 px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
                :class="errors.homeScore || errors.draw ? 'border-red-400/60' : 'border-white/20'"
              >
              <span v-if="errors.homeScore" class="text-xs text-red-400">{{ errors.homeScore }}</span>
            </label>

            <label class="flex flex-col gap-1.5 text-sm text-white/70">
              Goles visitante
              <input
                v-model.number="form.awayScore"
                type="number"
                min="0"
                :max="MAX_GOALS"
                :disabled="isFinished"
                class="rounded-xl border bg-white/5 px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
                :class="errors.awayScore || errors.draw ? 'border-red-400/60' : 'border-white/20'"
              >
              <span v-if="errors.awayScore" class="text-xs text-red-400">{{ errors.awayScore }}</span>
            </label>

            <p v-if="errors.draw" class="col-span-2 text-center text-xs text-red-400">{{ errors.draw }}</p>
          </div>

          <div v-if="form.status !== 'scheduled' && (form.homeScore > 0 || form.awayScore > 0)" class="flex flex-col gap-3">
            <div v-if="form.homeScore > 0" class="flex flex-col gap-1.5">
              <span class="text-sm text-white/70">Goleadores {{ form.homeTeam }}</span>
              <select
                v-for="(_, index) in form.homeScore"
                :key="`home-scorer-${index}`"
                v-model="homeScorers[index]"
                :disabled="isFinished"
                class="rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Gol {{ index + 1 }}: selecciona jugador</option>
                <option
                  v-for="player in homeSquad"
                  :key="player.id"
                  :value="player.id"
                  class="bg-[#0F1F17] text-[#F5F0E6]"
                >
                  {{ player.name }}
                </option>
              </select>
            </div>

            <div v-if="form.awayScore > 0" class="flex flex-col gap-1.5">
              <span class="text-sm text-white/70">Goleadores {{ form.awayTeam }}</span>
              <select
                v-for="(_, index) in form.awayScore"
                :key="`away-scorer-${index}`"
                v-model="awayScorers[index]"
                :disabled="isFinished"
                class="rounded-xl border border-white/20 bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Gol {{ index + 1 }}: selecciona jugador</option>
                <option
                  v-for="player in awaySquad"
                  :key="player.id"
                  :value="player.id"
                  class="bg-[#0F1F17] text-[#F5F0E6]"
                >
                  {{ player.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="mt-2 flex justify-end gap-3">
            <button
              type="button"
              class="rounded-xl border border-white/20 px-4 py-2.5 text-[#F5F0E6] hover:bg-white/5"
              @click="$emit('close')"
            >
              {{ isFinished ? 'Cerrar' : 'Cancelar' }}
            </button>
            <button
              v-if="!isFinished"
              type="submit"
              class="rounded-xl bg-[#D4AF37] px-4 py-2.5 font-semibold text-[#04140D] hover:brightness-110"
            >
              {{ isEditing ? 'Guardar cambios' : 'Crear partido' }}
            </button>
          </div>
        </form>
      </UiGlassCard>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Timestamp } from 'firebase/firestore'
import type { Match, MatchGoal, MatchStatus } from '~~/shared/types/match'
import type { Team } from '~~/shared/types/team'
import type { Player } from '~~/shared/types/player'
import type { ProjectedSlot } from '~/composables/useBracket'
import { matchStatuses, matchStatusLabels, MAX_GOALS } from '~/utils/matchOptions'
import { matchVenues } from '~/utils/matchVenues'

// Cantidad mínima de jugadores en plantilla
const MIN_SQUAD_SIZE = 11

// Obtiene la instancia del store de autenticación
const props = defineProps<{
  visible: boolean
  initialData?: (Match & { id?: string }) | null
  teams: (Team & { id: string })[]
  matches: (Match & { id?: string })[]
  players: (Player & { id?: string })[]
  unlockedStages: string[]
  projectedBracket: Record<string, ProjectedSlot[]>
}>()

// Define los eventos que el componente puede emitir
const emit = defineEmits<{
  close: []
  submit: [match: Match]
}>()

// Define el estado del formulario y si se está editando un partido existente
type MatchFormState = Omit<Match, 'kickoff'> & { kickoff: string }

const emptyMatch: MatchFormState = {
  homeTeam: '',
  awayTeam: '',
  group: '',
  stage: '',
  stadium: '',
  city: '',
  kickoff: '',
  homeScore: 0,
  awayScore: 0,
  status: '' as MatchStatus
}

// Convierte un Timestamp de Firestore al formato que espera <input type="datetime-local">
const toDatetimeLocal = (timestamp: Match['kickoff']): string => {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Convierte el estado de un partido a la forma que espera el formulario
const toFormState = (match?: (Match & { id?: string }) | null): MatchFormState =>
  match ? { ...match, kickoff: toDatetimeLocal(match.kickoff) } : { ...emptyMatch }

// Define el estado del formulario y si se está editando un partido existente
const form = ref<MatchFormState>(toFormState(props.initialData))
const isEditing = computed(() => !!props.initialData)

// Un partido que ya arrancó (en vivo) o terminó no puede cambiar, solo se actualiza el marcador y el estado
const isLocked = computed(() => isEditing.value && props.initialData?.status !== 'scheduled')

// Un partido ya finalizado no se puede volver a editar
const isFinished = computed(() => isEditing.value && props.initialData?.status === 'finished')

// Filtra las fases disponibles
const availableStages = computed(() => {
  const original = props.initialData?.stage
  if (original && !props.unlockedStages.includes(original)) {
    return [original, ...props.unlockedStages]
  }
  return props.unlockedStages
})

// Filtra los estados disponibles según el estado original del partido
const availableStatuses = computed(() => {
  const original = props.initialData?.status
  if (original === 'finished') return matchStatuses.filter((s) => s.value === 'finished')
  if (original === 'live') return matchStatuses.filter((s) => s.value !== 'scheduled')
  return matchStatuses
})

// Devuelve la fecha y hora actual en el formato que espera <input type="datetime-local">
const nowKickoff = (): string => {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Guarda los mensajes de error por campo
const errors = ref<Record<string, string>>({})

// Valida que la fecha y hora del partido sea coherente con el estado elegido
const validateKickoff = (): string => {
  if (!form.value.kickoff) return ''
  const kickoffTime = new Date(form.value.kickoff).getTime()

  if (form.value.status === 'scheduled' && kickoffTime < Date.now()) {
    return 'Un partido programado no puede tener una fecha y hora que ya pasó.'
  }

  if (form.value.status === 'live') {
    if (kickoffTime > Date.now()) {
      return 'Un partido en vivo no puede tener una fecha y hora futura.'
    }
    const diffMinutes = (Date.now() - kickoffTime) / 60000
    if (diffMinutes > 90) {
      return 'Un partido en vivo debe haber comenzado hace 90 minutos o menos.'
    }
  }

  if (form.value.status === 'finished' && kickoffTime > Date.now()) {
    return 'Un partido finalizado no puede tener una fecha y hora futura.'
  }

  return ''
}

// Valida que la cantidad de goles sea coherente con el estado del partido
const isKnockoutStage = computed(() => !!form.value.stage && form.value.stage !== 'Fase de grupos')
const stageMatchups = computed(() => props.projectedBracket[form.value.stage] || [])

// Devuelve el rival de un equipo en la fase eliminatoria según la llave proyectada
const bracketOpponentOf = (teamName: string): string | undefined => {
  const pair = stageMatchups.value.find((m) => m.homeTeam === teamName || m.awayTeam === teamName)
  if (!pair) return undefined
  return pair.homeTeam === teamName ? pair.awayTeam : pair.homeTeam
}

// Filtra los equipos que participan en la fase elegida, según las llaves proyectadas
const teamsInStage = computed(() => {
  const names = new Set(stageMatchups.value.flatMap((m) => [m.homeTeam, m.awayTeam]).filter(Boolean))
  return props.teams.filter((t) => names.has(t.name))
})

// Filtra las opciones del visitante (local-rival)
const availableAwayTeams = computed(() => {
  let list: (Team & { id: string })[]
  if (form.value.stage === 'Fase de grupos' && form.value.homeTeam) {
    const homeGroup = props.teams.find((t) => t.name === form.value.homeTeam)?.group?.toUpperCase()
    list = props.teams.filter((t) => t.group?.toUpperCase() === homeGroup && t.name !== form.value.homeTeam)
  } else if (isKnockoutStage.value && form.value.homeTeam) {
    const opponent = bracketOpponentOf(form.value.homeTeam)
    list = props.teams.filter((t) => t.name === opponent)
  } else if (isKnockoutStage.value) {
    list = teamsInStage.value.filter((t) => t.name !== form.value.homeTeam)
  } else {
    list = props.teams.filter((t) => t.name !== form.value.homeTeam)
  }
  list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  if (form.value.awayTeam && !list.some((t) => t.name === form.value.awayTeam)) {
    const current = props.teams.find((t) => t.name === form.value.awayTeam)
    if (current) list = [current, ...list]
  }
  return list
})

// Filtra las opciones del local (visitante-rival)
const availableHomeTeams = computed(() => {
  let list: (Team & { id: string })[]
  if (form.value.stage === 'Fase de grupos' && form.value.awayTeam) {
    const awayGroup = props.teams.find((t) => t.name === form.value.awayTeam)?.group?.toUpperCase()
    list = props.teams.filter((t) => t.group?.toUpperCase() === awayGroup && t.name !== form.value.awayTeam)
  } else if (isKnockoutStage.value && form.value.awayTeam) {
    const opponent = bracketOpponentOf(form.value.awayTeam)
    list = props.teams.filter((t) => t.name === opponent)
  } else if (isKnockoutStage.value) {
    list = teamsInStage.value.filter((t) => t.name !== form.value.awayTeam)
  } else {
    list = props.teams.filter((t) => t.name !== form.value.awayTeam)
  }
  list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  if (form.value.homeTeam && !list.some((t) => t.name === form.value.homeTeam)) {
    const current = props.teams.find((t) => t.name === form.value.homeTeam)
    if (current) list = [current, ...list]
  }
  return list
})

// Ciudades que tuvieron sedes en la fase elegida (catálogo del Mundial 2026)
const availableCities = computed(() => {
  const list = !form.value.stage
    ? matchVenues.map((v) => v.city)
    : matchVenues.filter((v) => v.stages.includes(form.value.stage)).map((v) => v.city)
  if (form.value.city && !list.includes(form.value.city)) {
    return [form.value.city, ...list]
  }
  return list
})

// Estadios de la ciudad ya elegida (cada ciudad tiene un único estadio en el catálogo)
const availableStadiums = computed(() => {
  const list = !form.value.city ? [] : matchVenues.filter((v) => v.city === form.value.city).map((v) => v.stadium)
  if (form.value.stadium && !list.includes(form.value.stadium)) {
    return [form.value.stadium, ...list]
  }
  return list
})

// Jugadores de cada plantilla, para elegir el anotador de cada gol
const homeSquad = computed(() => {
  const teamId = props.teams.find((t) => t.name === form.value.homeTeam)?.id
  return props.players.filter((p) => p.teamId === teamId) as (Player & { id: string })[]
})
const awaySquad = computed(() => {
  const teamId = props.teams.find((t) => t.name === form.value.awayTeam)?.id
  return props.players.filter((p) => p.teamId === teamId) as (Player & { id: string })[]
})

// select para cada anotador de un gol
const homeScorers = ref<string[]>([])
const awayScorers = ref<string[]>([])

// Ajusta el largo del array de goleadores para que siempre coincida con la cantidad de goles cargada
const resizeScorers = (list: string[], count: number): string[] => {
  const next = list.slice(0, count)
  while (next.length < count) next.push('')
  return next
}

// Ajusta la cantidad de select de goleadores cuando cambia la cantidad de goles
watch(() => form.value.homeScore, (count) => {
  homeScorers.value = resizeScorers(homeScorers.value, Math.max(0, count || 0))
}, { immediate: true })

// Ajusta la cantidad de select de goleadores cuando cambia la cantidad de goles
watch(() => form.value.awayScore, (count) => {
  awayScorers.value = resizeScorers(awayScorers.value, Math.max(0, count || 0))
}, { immediate: true })

// Arma la lista de goleadores a guardar
const buildScorers = (): MatchGoal[] => {
  const home: MatchGoal[] = homeScorers.value
    .filter((playerId) => playerId)
    .map((playerId) => ({
      playerId,
      playerName: homeSquad.value.find((p) => p.id === playerId)?.name ?? '',
      team: 'home' as const
    }))
  const away: MatchGoal[] = awayScorers.value
    .filter((playerId) => playerId)
    .map((playerId) => ({
      playerId,
      playerName: awaySquad.value.find((p) => p.id === playerId)?.name ?? '',
      team: 'away' as const
    }))
  return [...home, ...away]
}

// Evita que el auto-completado se disparen al resetear el formulario
let isResettingForm = false

// Al elegir la ciudad, se autocompleta el estadio (relación 1 a 1 en el catálogo)
watch(() => form.value.city, (city) => {
  if (isResettingForm) return
  form.value.stadium = matchVenues.find((v) => v.city === city)?.stadium ?? ''
})

// Si la fase cambia y la ciudad elegida ya no tiene sedes en la nueva fase, se limpia
watch(() => form.value.stage, () => {
  if (isResettingForm) return
  if (form.value.city && !availableCities.value.includes(form.value.city)) {
    form.value.city = ''
  }
})

// Permite que el formulario se actualice cuando cambie la propiedad
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      isResettingForm = true
      form.value = toFormState(props.initialData)
      errors.value = {}
      const scorers = props.initialData?.scorers ?? []
      homeScorers.value = resizeScorers(
        scorers.filter((s) => s.team === 'home').map((s) => s.playerId),
        form.value.homeScore || 0
      )
      awayScorers.value = resizeScorers(
        scorers.filter((s) => s.team === 'away').map((s) => s.playerId),
        form.value.awayScore || 0
      )
      nextTick(() => { isResettingForm = false })
    }
  }
)

// Cantidad de jugadores registrados en la plantilla de un equipo (por nombre)
const squadSize = (teamName: string): number => {
  const teamId = props.teams.find((t) => t.name === teamName)?.id
  if (!teamId) return 0
  return props.players.filter((p) => p.teamId === teamId).length
}

// Valida que la cantidad de goles sea un número entero no negativo y no mayor al máximo permitido
const validateGoalCount = (value: unknown): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Ingresá una cantidad de goles.'
  if (value < 0) return 'Los goles no pueden ser negativos.'
  if (value > MAX_GOALS) return `Los goles no pueden ser más de ${MAX_GOALS}.`
  return ''
}

const validate = (): boolean => {
  errors.value = {}

  if (!form.value.stage) {
    errors.value.stage = 'La fase es obligatoria.'
  } else if (!availableStages.value.includes(form.value.stage)) {
    errors.value.stage = 'Esa fase todavía no está habilitada.'
  }

  if (!form.value.homeTeam) {
    errors.value.homeTeam = 'El equipo local es obligatorio.'
  }

  if (!form.value.awayTeam) {
    errors.value.awayTeam = 'El equipo visitante es obligatorio.'
  } else if (form.value.awayTeam === form.value.homeTeam) {
    errors.value.awayTeam = 'El visitante debe ser distinto al local.'
  }else if (form.value.stage === 'Fase de grupos') {
    const homeGroup = props.teams.find((t) => t.name === form.value.homeTeam)?.group?.toUpperCase()
    const awayGroup = props.teams.find((t) => t.name === form.value.awayTeam)?.group?.toUpperCase()

    if (homeGroup && awayGroup && homeGroup !== awayGroup) {
      errors.value.awayTeam = `En fase de grupos, ambos equipos deben ser del mismo grupo (local: Grupo ${homeGroup}).`
    } else {
      const duplicate = props.matches.find((m) => {
        if (m.id === props.initialData?.id) return false
        if (m.stage !== 'Fase de grupos') return false
        const sameTeams =
          (m.homeTeam === form.value.homeTeam && m.awayTeam === form.value.awayTeam) ||
          (m.homeTeam === form.value.awayTeam && m.awayTeam === form.value.homeTeam)
        return sameTeams
      })

      if (duplicate) {
        errors.value.awayTeam = `Ya existe un partido entre ${form.value.homeTeam} y ${form.value.awayTeam} en fase de grupos.`
      }
    }
  } else if (isKnockoutStage.value) {
    if (bracketOpponentOf(form.value.homeTeam) !== form.value.awayTeam) {
      errors.value.awayTeam = `Según la llave, ese no es el rival de ${form.value.homeTeam} en ${form.value.stage}.`
    } else {
      const duplicate = props.matches.find((m) => {
        if (m.id === props.initialData?.id) return false
        if (m.stage !== form.value.stage) return false
        return (
          (m.homeTeam === form.value.homeTeam && m.awayTeam === form.value.awayTeam) ||
          (m.homeTeam === form.value.awayTeam && m.awayTeam === form.value.homeTeam)
        )
      })

      if (duplicate) {
        errors.value.awayTeam = `Ya existe un partido entre ${form.value.homeTeam} y ${form.value.awayTeam} en ${form.value.stage}.`
      }
    }
  }

  // Ningún equipo puede jugar un partido si su plantilla no tiene el mínimo de jugadores.
  if (!isLocked.value) {
    if (form.value.homeTeam && !errors.value.homeTeam && squadSize(form.value.homeTeam) < MIN_SQUAD_SIZE) {
      errors.value.homeTeam = `El equipo local no tiene la cantidad mínima de jugadores (${MIN_SQUAD_SIZE}) en plantilla.`
    }

    if (form.value.awayTeam && !errors.value.awayTeam && squadSize(form.value.awayTeam) < MIN_SQUAD_SIZE) {
      errors.value.awayTeam = `El equipo visitante no tiene la cantidad mínima de jugadores (${MIN_SQUAD_SIZE}) en plantilla.`
    }
  }

  if (!form.value.stadium?.trim()) {
    errors.value.stadium = 'El estadio es obligatorio.'
  }

  if (!form.value.city?.trim()) {
    errors.value.city = 'La ciudad es obligatoria.'
  }

  if (!form.value.status) {
    errors.value.status = 'El estado es obligatorio.'
  }

  if (!form.value.kickoff) {
    errors.value.kickoff = 'La fecha y hora son obligatorias.'
  } else {
    const kickoffError = validateKickoff()
    if (kickoffError) errors.value.kickoff = kickoffError
  }

  if (form.value.status !== 'scheduled') {
    const homeScoreError = validateGoalCount(form.value.homeScore)
    if (homeScoreError) errors.value.homeScore = homeScoreError

    const awayScoreError = validateGoalCount(form.value.awayScore)
    if (awayScoreError) errors.value.awayScore = awayScoreError

    // En eliminación directa (Dieciseisavos en adelante) no puede haber empate
    if (
      !homeScoreError && !awayScoreError && isKnockoutStage.value &&
      form.value.status === 'finished' && form.value.homeScore === form.value.awayScore
    ) {
      errors.value.draw = 'En fase eliminatoria no puede haber empate.'
    }

    if (!form.value.awayTeam) {
      errors.value.awayTeam = 'El equipo visitante es obligatorio.'
    } else if (form.value.awayTeam === form.value.homeTeam) {
      errors.value.awayTeam = 'El visitante debe ser distinto al local.'
    } else if (form.value.stage === 'Fase de grupos') {
      const homeGroup = props.teams.find((t) => t.name === form.value.homeTeam)?.group?.toUpperCase()
      const awayGroup = props.teams.find((t) => t.name === form.value.awayTeam)?.group?.toUpperCase()
      if (homeGroup && awayGroup && homeGroup !== awayGroup) {
        errors.value.awayTeam = `En fase de grupos, ambos equipos deben ser del mismo grupo (local: Grupo ${homeGroup}).`
      }
    }
  }

  return Object.keys(errors.value).length === 0
}

// El grupo no se pide en el formulario: se toma del grupo del equipo local
const deriveGroup = (): string => {
  if (form.value.stage !== 'Fase de grupos') return ''
  return props.teams.find((t) => t.name === form.value.homeTeam)?.group ?? ''
}

const handleSubmit = () => {
  if (isFinished.value) return
  if (!validate()) return

  const { kickoff, group, ...rest } = form.value
  emit('submit', {
    ...rest,
    group: deriveGroup(),
    kickoff: Timestamp.fromDate(new Date(kickoff)),
    scorers: form.value.status !== 'scheduled' ? buildScorers() : []
  })
}
</script>

<style scoped>
.match-form-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(1, 27, 0, 0.4) transparent;
}

.match-form-scroll::-webkit-scrollbar {
  width: 6px;
}

.match-form-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.match-form-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(212, 175, 55, 0.4);
  border-radius: 9999px;
}

.match-form-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(212, 175, 55, 0.6);
}
</style>
