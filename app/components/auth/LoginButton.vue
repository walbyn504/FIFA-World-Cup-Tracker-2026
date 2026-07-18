<template>
  <div class="flex flex-col items-center gap-3">
    <button
      :disabled="isLoading"
      class="flex items-center justify-center gap-2 rounded-full border border-white/40 bg-gradient-to-br from-amber-200 via-yellow-500 to-yellow-700 px-6 py-3 text-sm font-bold text-emerald-950 shadow-lg shadow-yellow-900/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      @click="handleLogin"
    >
      <svg v-if="!isLoading" class="h-5 w-5 rounded-full bg-white p-0.5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.26 21.3 7.31 24 12 24z"/>
        <path fill="#FBBC05" d="M5.29 14.31c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.65H1.28C.47 8.24 0 10.06 0 12.03s.47 3.79 1.28 5.38l4.01-3.1z"/>
        <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.65l4.01 3.1C6.23 6.92 8.88 4.75 12 4.75z"/>
      </svg>
      <span v-if="!isLoading">Iniciar sesión con Google</span>
      <span v-else class="flex items-center gap-2">
        <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-950/30 border-t-emerald-950" />
        Conectando...
      </span>
    </button>

    <p v-if="errorMessage" class="text-sm text-red-300">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
const { loginWithGoogle } = useAuth()

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await loginWithGoogle()
  } catch (error) {
    errorMessage.value = 'No se pudo iniciar sesión. Intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}
</script>
