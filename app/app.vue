<template>
  <div>
    <header v-if="authStore.isLoggedIn" class="flex items-center justify-between bg-neutral-900 px-4 py-2.5">
      <NuxtLink
        to="/profile"
        class="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-white/10"
      >
        <span class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-yellow-500 bg-gradient-to-br from-emerald-700 to-emerald-950 text-sm font-bold text-yellow-200">
          {{ authStore.user?.name?.charAt(0) ?? '?' }}
        </span>
        <span class="text-sm font-medium text-white">{{ authStore.user?.name }}</span>
      </NuxtLink>

      <button
        title="Cerrar sesión"
        class="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white/80 backdrop-blur transition hover:border-red-500/60 hover:bg-red-500/20 hover:text-red-400"
        @click="handleLogout"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </header>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { logout } = useAuth()

const handleLogout = async () => {
  await logout()
  await navigateTo('/')
}
</script>