<template>
  <div
    class="relative min-h-screen bg-cover bg-center"
    style="background-image: url('/fondo-mundial.jpg')"
  >
    <div class="absolute inset-0 bg-black/25" />

    <div class="relative z-10">
      <header v-if="authStore.isLoggedIn" class="flex flex-wrap items-center justify-between gap-3 bg-[#0B2318] px-5 py-2.5">
        <div class="flex flex-wrap items-center gap-5">
          <span class="text-sm font-semibold tracking-wide text-[#F2D479]">FIFA Tracker</span>

          <nav class="flex gap-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="rounded-lg px-2.5 py-1.5 text-sm text-white/75 transition hover:bg-white/10"
              active-class="text-emerald-400 bg-emerald-400/15"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-2.5">
          <NuxtLink
            to="/profile"
            class="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-white/10"
          >
            <span class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-yellow-500 bg-gradient-to-br from-emerald-700 to-emerald-950 text-xs font-bold text-yellow-200">
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
        </div>
      </header>

      <slot />
    </div>

    <UiToast />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { logout } = useAuth()

// Links de navegación del header
const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/teams', label: 'Equipos' },
  { to: '/players', label: 'Jugadores' },
  { to: '/matches', label: 'Partidos' },
  { to: '/groups', label: 'Grupos' },
  { to: '/bracket', label: 'Llaves' },
  { to: '/predictions', label: 'Predicciones' },
  { to: '/statistics', label: 'Estadísticas' }
]

const handleLogout = async () => {
  await logout()
  await navigateTo('/')
}
</script>