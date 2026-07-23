<template>
  <button
    :title="title"
    :disabled="loading"
    class="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-gradient-to-b from-white/30 to-white/10 text-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:border-white/50 hover:from-white/40 hover:to-white/15 hover:shadow-[0_4px_16px_rgba(0,0,0,0.35)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
    @click="$emit('click')"
  >
    <svg
      class="h-5 w-5"
      :class="{ 'animate-spin': loading }"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    loading?: boolean
    title?: string
  }>(),
  {
    loading: false,
    title: 'Actualizar lista'
  }
)

defineEmits<{
  click: []
}>()
</script>
