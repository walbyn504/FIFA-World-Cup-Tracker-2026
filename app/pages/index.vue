<template>
  <div
    class="relative flex min-h-screen items-center justify-center bg-cover bg-center px-4"
    style="background-image: url('/fondo-mundial.jpg')"
  >
    <div class="absolute inset-0 bg-black/25" />

    <UiGlassCard class="relative z-10">
      <h1 class="text-3xl font-bold tracking-wide text-white drop-shadow-lg">
        FIFA World Cup Tracker 2026
      </h1>
      <p v-if="!authStore.isLoggedIn" class="-mt-3 text-sm text-white/80">
        Inicia sesión para ver tu perfil, hacer predicciones y seguir la Copa del Mundo.
      </p>
      <p v-else class="-mt-3 text-sm text-white/80">
        ¡Hola de nuevo, {{ authStore.user?.name }}! Ya iniciaste sesión.
      </p>
      <AuthLoginButton v-if="!authStore.isLoggedIn" />
    </UiGlassCard>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
</script>
