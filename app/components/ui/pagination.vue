<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
    <button
      class="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="modelValue === 1"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      class="flex h-9 w-9 items-center justify-center rounded-full text-sm transition"
      :class="page === modelValue
        ? 'bg-[#0B2318] font-semibold text-white'
        : 'bg-black/40 text-white hover:bg-black/60'"
      @click="$emit('update:modelValue', page)"
    >
      {{ page }}
    </button>

    <button
      class="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white transition hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="modelValue === totalPages"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  totalItems: number
  itemsPerPage: number
}>()

defineEmits<{
  'update:modelValue': [page: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage)))

// Muestra maximo 5 numeros de pagina, centrados en la pagina actual
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.modelValue
  const maxVisible = 5

  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  const end = Math.min(total, start + maxVisible - 1)
  start = Math.max(1, end - maxVisible + 1)

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
</script>