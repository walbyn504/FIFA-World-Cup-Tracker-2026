<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-[#04140D]/70 backdrop-blur-sm"
      @click.self="$emit('cancel')"
    >
      <div class="w-full max-w-sm rounded-3xl border border-white/20 bg-gradient-to-b from-white/20 via-white/10 to-white/5 px-7 py-7 backdrop-blur-xl backdrop-saturate-150 shadow-2xl text-[#F5F0E6]">
        <h3 class="font-['Bebas_Neue'] text-xl tracking-wide">{{ title }}</h3>
        <p class="mt-2 text-sm text-white/70">{{ message }}</p>

        <div class="mt-6 flex justify-end gap-3">
          <button
            class="rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
            @click="$emit('cancel')"
          >
            Cancelar
          </button>
          <button
            class="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            @click="$emit('confirm')"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    message?: string
  }>(),
  {
    title: '¿Estás seguro?',
    message: 'Esta acción no se puede deshacer.'
  }
)

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>