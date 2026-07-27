<template>
  <div class="flex min-h-screen items-center justify-center px-4">
    <UiGlassCard v-if="authStore.user" class="w-full max-w-md">
      <div class="relative">
        <div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-yellow-500 bg-gradient-to-br from-emerald-700 to-emerald-950 text-3xl font-bold text-yellow-200">
          {{ authStore.user.name.charAt(0) }}
        </div>
        <button
          title="Editar perfil"
          class="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0F1F17] bg-[#D4AF37] text-[#04140D] transition hover:brightness-110"
          @click="isModalOpen = true"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>

      <div class="-mt-3">
        <h1 class="text-2xl font-bold text-white drop-shadow-lg">
          {{ authStore.user.name }}
        </h1>
        <p class="text-sm text-white/70">{{ authStore.user.email }}</p>
      </div>

      <div class="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3">
        <p class="text-xs uppercase tracking-wide text-white/60">Puntos</p>
        <p class="text-xl font-bold text-yellow-300">{{ authStore.user.points }}</p>
      </div>

      <NuxtLink
        to="/profile/favorites"
        class="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D4AF37] bg-[#D4AF37]/20 px-4 py-2.5 text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/30"
      >
        <svg class="h-4 w-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        Mis Favoritos
      </NuxtLink>

      <NuxtLink
        to="/profile/predictions"
        class="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        Mis Predicciones
      </NuxtLink>
    </UiGlassCard>

    <ProfileFormModal
      v-if="authStore.user"
      :visible="isModalOpen"
      :initial-data="{ name: authStore.user.name }"
      @close="isModalOpen = false"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import type { User } from '~~/shared/types/user'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { updateProfile } = useAuth()
const { success, error } = useNotify()

const isModalOpen = ref(false)

const handleSubmit = async (changes: Pick<User, 'name'>) => {
  try {
    await updateProfile(changes)
    isModalOpen.value = false
    success('Perfil actualizado correctamente.')
  } catch (err) {
    error('No se pudo actualizar el perfil.')
  }
}
</script>
