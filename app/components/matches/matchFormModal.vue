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
                :class="errors.homeScore ? 'border-red-400/60' : 'border-white/20'"
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
                :class="errors.awayScore ? 'border-red-400/60' : 'border-white/20'"
              >
              <span v-if="errors.awayScore" class="text-xs text-red-400">{{ errors.awayScore }}</span>
            </label>
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
import type { Match, MatchStatus } from '~~/shared/types/match'
import type { Team } from '~~/shared/types/team'
import type { Player } from '~~/shared/types/player'
import type { ProjectedSlot } from '~/composables/useBracket'
import { matchStatuses, matchStatusLabels, MAX_GOALS } from '~/utils/matchOptions'
import { matchVenues } from '~/utils/matchVenues'

// Cantidad mínima de jugadores en plantilla para poder disputar un partido
const MIN_SQUAD_SIZE = 11

// Define las propiedades que el componente espera recibir
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

// El formulario usa `kickoff` como string (datetime-local) en vez del Timestamp que guarda Firestore
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

const toFormState = (match?: (Match & { id?: string }) | null): MatchFormState =>
  match ? { ...match, kickoff: toDatetimeLocal(match.kickoff) } : { ...emptyMatch }

// Define el estado del formulario y si se está editando un partido existente
const form = ref<MatchFormState>(toFormState(props.initialData))
const isEditing = computed(() => !!props.initialData)

// Un partido que ya arrancó (en vivo) o terminó no puede cambiar de equipos, estadio,
// fecha, etc.: solo se actualiza el marcador y el estado (para poder pasar de en vivo a finalizado)
const isLocked = computed(() => isEditing.value && props.initialData?.status !== 'scheduled')

// Un partido ya finalizado no se puede volver a editar de ninguna forma (ni
// el marcador): queda fijo para siempre
const isFinished = computed(() => isEditing.value && props.initialData?.status === 'finished')

// Fases que se pueden elegir ahora mismo: las que ya están habilitadas según el
// avance del torneo, más la fase propia del partido (si se está editando uno ya
// creado), para no dejarlo sin opción válida aunque esa fase ya no esté "activa"
const availableStages = computed(() => {
  const original = props.initialData?.stage
  if (original && !props.unlockedStages.includes(original)) {
    return [original, ...props.unlockedStages]
  }
  return props.unlockedStages
})

// No se puede "retroceder" el estado de un partido (de en vivo a programado, o de finalizado a otra cosa)
const availableStatuses = computed(() => {
  const original = props.initialData?.status
  if (original === 'finished') return matchStatuses.filter((s) => s.value === 'finished')
  if (original === 'live') return matchStatuses.filter((s) => s.value !== 'scheduled')
  return matchStatuses
})

// Fecha y hora actuales en formato datetime-local: sirve de mínimo para "Programado"
// (no se puede programar en el pasado) y de máximo para "En Vivo"/"Finalizado" (no pueden ser a futuro).
// Es una función (no un computed) para que se recalcule en cada render y no quede "congelada"
// en el momento en que se abrió el modal.
const nowKickoff = (): string => {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Guarda los mensajes de error por campo
const errors = ref<Record<string, string>>({})

// El selector nativo del navegador no siempre respeta la hora exacta de `min`/`max`
// (solo la fecha), así que la fecha/hora se valida también acá, en cuanto cambia,
// para mostrar el error de inmediato y no solo al enviar el formulario.
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

// En fase eliminatoria no hay "grupo": el rival de cada equipo ya lo fija la
// llave (computeProjectedBracket), así que el formulario no puede dejar armar
// cualquier combinación, solo el cruce real de esa fase
const isKnockoutStage = computed(() => !!form.value.stage && form.value.stage !== 'Fase de grupos')
const stageMatchups = computed(() => props.projectedBracket[form.value.stage] || [])

// Nombre del rival que le toca a `teamName` en la fase elegida, según la llave
// (undefined si ese equipo no juega esa fase, o la llave todavía no lo define)
const bracketOpponentOf = (teamName: string): string | undefined => {
  const pair = stageMatchups.value.find((m) => m.homeTeam === teamName || m.awayTeam === teamName)
  if (!pair) return undefined
  return pair.homeTeam === teamName ? pair.awayTeam : pair.homeTeam
}

// Todos los equipos que juegan la fase elegida, según la llave
const teamsInStage = computed(() => {
  const names = new Set(stageMatchups.value.flatMap((m) => [m.homeTeam, m.awayTeam]).filter(Boolean))
  return props.teams.filter((t) => names.has(t.name))
})

// Filtra las opciones del visitante: en fase de grupos, segun el grupo del local
// ya elegido; en fase eliminatoria, solo el rival real que le toca al local
// según la llave. Siempre incluye el equipo ya guardado, aunque el filtro lo
// hubiera excluido
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

// Filtra las opciones del local: en fase de grupos, segun el grupo del visitante
// ya elegido; en fase eliminatoria, solo el rival real que le toca al visitante
// según la llave
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

// Evita que el auto-completado de estadio/ciudad se dispare al cargar el formulario
// (por ejemplo, al editar un partido ya guardado), y solo actúe ante un cambio real del usuario
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
// `visible` o `initialData`
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      isResettingForm = true
      form.value = toFormState(props.initialData)
      errors.value = {}
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
  // No aplica a partidos ya en vivo/finalizados (isLocked): ahí los equipos ya no se pueden
  // cambiar, y no tendría sentido bloquear la actualización del marcador de un partido viejo
  // solo porque la plantilla del equipo cambió después.
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
// (solo tiene sentido en la fase de grupos, ya que en llaves eliminatorias no aplica)
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
    kickoff: Timestamp.fromDate(new Date(kickoff))
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
