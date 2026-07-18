<template>
  <div
    class="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4"
    style="background-image: url('/fondo-mundial.jpg')"
  >
    <div class="absolute inset-0 bg-black/25" />

    <UiGlassCard v-if="authStore.user" class="relative z-10">
      <div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-500 bg-gradient-to-br from-emerald-700 to-emerald-950 text-3xl font-bold text-yellow-200">
        {{ authStore.user.name.charAt(0) }}
      </div>

      <div class="-mt-3">
        <h1 class="text-2xl font-bold text-white drop-shadow-lg">
          {{ authStore.user.name }}
        </h1>
        <p class="text-sm text-white/70">{{ authStore.user.email }}</p>
      </div>

      <div class="grid w-full grid-cols-2 gap-3">
        <div class="rounded-2xl border border-white/20 bg-white/5 px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-white/60">Puntos</p>
          <p class="text-xl font-bold text-yellow-300">{{ authStore.user.points }}</p>
        </div>
        <div class="rounded-2xl border border-white/20 bg-white/5 px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-white/60">Equipo favorito</p>
          <p class="text-xl font-bold text-white">{{ authStore.user.favoriteTeam || '—' }}</p>
        </div>
      </div>
    </UiGlassCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
</script>
