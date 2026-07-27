<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-[#04140D]/70 backdrop-blur-sm"
    >
      <UiGlassCard class="w-full max-w-md" content-class="text-left px-8 py-8">
        <h2 class="mb-5 font-['Bebas_Neue'] text-2xl tracking-wide text-white">
          Editar perfil
        </h2>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
          <label class="flex flex-col gap-1.5 text-sm text-white/70">
            Nombre
            <input
              v-model="form.name"
              class="rounded-xl border bg-white/5 px-3 py-2.5 text-[#F5F0E6] placeholder-white/30 outline-none focus:border-[#D4AF37]"
              :class="errors.name ? 'border-red-400/60' : 'border-white/20'"
            >
            <span v-if="errors.name" class="text-xs text-red-400">{{ errors.name }}</span>
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
              Guardar cambios
            </button>
          </div>
        </form>
      </UiGlassCard>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { User } from '~~/shared/types/user'

const props = defineProps<{
  visible: boolean
  initialData: Pick<User, 'name'>
}>()

const emit = defineEmits<{
  close: []
  submit: [changes: Pick<User, 'name'>]
}>()

const form = ref<Pick<User, 'name'>>({ ...props.initialData })

const errors = ref<Record<string, string>>({})

// Recarga el formulario cada vez que se abre el modal
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      form.value = { ...props.initialData }
      errors.value = {}
    }
  }
)

const validate = (): boolean => {
  errors.value = {}

  if (!form.value.name?.trim()) {
    errors.value.name = 'El nombre es obligatorio.'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', form.value)
}
</script>
