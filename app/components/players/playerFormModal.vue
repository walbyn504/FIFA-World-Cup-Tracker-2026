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
              class="rounded-xl border bg-[#0F1F17] px-3 py-2.5 text-[#F5F0E6] outline-none focus:border-[#D4AF37]"
              :class="errors.teamId ? 'border-red-400/60' : 'border-white/20'"
            >
              <option value="" class="bg-[#0F1F17] text-[#F5F0E6]">Selecciona un equipo</option>
              <option
                v-for="team in teams"
                :key="team.id"
                :value="team.id"
                class="bg-[#0F1F17] text-[#F5F0E6]"
              >
                {{ team.name }}
              </option>
            </select>
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
            <input
              v-model="form.club"
              class="rounded-xl border bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
              :class="errors.club ? 'border-red-400/60' : 'border-white/20'"
            >
            <span v-if="errors.club" class="text-xs text-red-400">{{ errors.club }}</span>
          </label>

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

// Define las propiedades que el componente espera recibir
const props = defineProps<{
  visible: boolean
  initialData?: (Player & { id?: string }) | null
  teams: (Team & { id: string })[]
  players: (Player & { id: string })[]
}>()

// Define los eventos que el componente puede emitir
const emit = defineEmits<{
  close: []
  submit: [player: Player]
}>()

const positions = ['Portero', 'Defensa', 'Mediocampista', 'Delantero']

// Define un jugador vacío para inicializar el formulario
const emptyPlayer: Player = {
  teamId: '',
  name: '',
  number: 0,
  position: '',
  club: ''
}

// Define el estado del formulario y si se está editando un jugador existente
const form = ref<Player>({ ...emptyPlayer })
const isEditing = computed(() => !!props.initialData)

// Guarda los mensajes de error por campo
const errors = ref<Record<string, string>>({})

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

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', form.value)
}
</script>
