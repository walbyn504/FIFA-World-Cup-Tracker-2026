<template>
  <button
    type="button"
    :title="isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'"
    class="text-red-500 transition-transform active:scale-90 hover:text-red-400 focus:outline-none"
  >
    <!-- Corazón Lleno (Favorito) -->
    <svg
      v-if="isFavorite"
      class="h-4 w-4 fill-current"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>

    <!-- Corazón Delineado (No favorito) -->
    <svg
      v-else
      class="h-4 w-4 text-white/40 transition-colors hover:text-red-400"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      viewBox="0 0 24 24"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isFavorite: boolean
}>()
</script>