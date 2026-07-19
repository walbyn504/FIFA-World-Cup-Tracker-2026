<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-[#04140D]/70 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <UiGlassCard class="w-full max-w-md" content-class="text-left px-8 py-8">
        <h2 class="mb-5 font-['Bebas_Neue'] text-2xl tracking-wide text-white">
          {{ isEditing ? 'Editar equipo' : 'Nuevo equipo' }}
        </h2>

        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Nombre
            <input
              v-model="form.name"
              required
              class="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
            >
          </label>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Grupo
            <input
              v-model="form.group"
              placeholder="A, B, C..."
              required
              class="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
            >
          </label>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Entrenador
            <input
              v-model="form.coach"
              class="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
            >
          </label>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Confederación
            <input
              v-model="form.confederation"
              placeholder="CONCACAF, UEFA..."
              class="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
            >
          </label>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Ranking FIFA
            <input
              v-model.number="form.fifaRanking"
              type="number"
              class="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
            >
          </label>

          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            URL de la bandera
            <input
              v-model="form.flag"
              placeholder="https://..."
              class="rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
            >
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
              {{ isEditing ? 'Guardar cambios' : 'Crear equipo' }}
            </button>
          </div>
        </form>
      </UiGlassCard>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Team } from '~~/shared/types/team'

// Define las propiedades que el componente espera recibir
const props = defineProps<{
  visible: boolean
  initialData?: Team | null
}>()

// Define los eventos que el componente puede emitir
const emit = defineEmits<{
  close: []
  submit: [team: Team]
}>()

// Define un equipo vacío para inicializar el formulario
const emptyTeam: Team = {
  name: '',
  group: '',
  flag: '',
  coach: '',
  confederation: '',
  fifaRanking: 0
}

// Define el estado del formulario y si se está editando un equipo existente
const form = ref<Team>({ ...emptyTeam })
const isEditing = computed(() => !!props.initialData)

// Permite que el formulario se actualice cuando cambie la propiedad `visible` o `initialData`
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      form.value = props.initialData ? { ...props.initialData } : { ...emptyTeam }
    }
  }
)

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>