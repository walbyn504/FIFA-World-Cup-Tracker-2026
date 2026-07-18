<template>
  <div class="login-container">
    <div class="glass-panel">
      <div class="glass-sheen" />

      <button
        v-if="!authStore.isLoggedIn"
        class="login-btn"
        :disabled="isLoading"
        @click="handleLogin"
      >
        <svg v-if="!isLoading" class="google-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"/>
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.26 21.3 7.31 24 12 24z"/>
          <path fill="#FBBC05" d="M5.29 14.31c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.65H1.28C.47 8.24 0 10.06 0 12.03s.47 3.79 1.28 5.38l4.01-3.1z"/>
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.65l4.01 3.1C6.23 6.92 8.88 4.75 12 4.75z"/>
        </svg>
        <span v-if="!isLoading">Iniciar sesión con Google</span>
        <span v-else class="loading-text">
          <span class="spinner" />
          Conectando...
        </span>
      </button>

      <div v-else class="user-info">
        <div class="avatar-ring">
          <span class="avatar-initial">{{ authStore.user?.name?.charAt(0) ?? '?' }}</span>
        </div>
        <span class="user-name">Hola, {{ authStore.user?.name }}</span>
        <button class="logout-btn" @click="handleLogout">
          Cerrar sesión
        </button>
      </div>

      <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { loginWithGoogle, logout } = useAuth()
const authStore = useAuthStore()

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

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    errorMessage.value = 'No se pudo cerrar sesión.'
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background:
    radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.15), transparent 45%),
    radial-gradient(circle at 80% 80%, rgba(30, 122, 70, 0.25), transparent 50%),
    linear-gradient(160deg, #071f17 0%, #0b3d2e 55%, #0f2e22 100%);
}

/* --- Panel de vidrio líquido --- */
.glass-panel {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 2rem 2.4rem;
  min-width: 280px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    inset 0 1px 1px rgba(255, 255, 255, 0.4),
    inset 0 -1px 12px rgba(0, 0, 0, 0.15);
}

/* Barrido de brillo tipo "cristal líquido" */
.glass-sheen {
  position: absolute;
  top: -60%;
  left: -60%;
  width: 60%;
  height: 220%;
  background: linear-gradient(
    115deg,
    transparent 30%,
    rgba(255, 255, 255, 0.35) 48%,
    rgba(255, 255, 255, 0.05) 55%,
    transparent 70%
  );
  transform: rotate(20deg);
  animation: sheen-sweep 6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes sheen-sweep {
  0%   { left: -60%; }
  45%  { left: 130%; }
  100% { left: 130%; }
}

/* --- Botón principal (dorado trofeo) --- */
.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #f4d97a 0%, #d4af37 55%, #b8912c 100%);
  color: #0b3d2e;
  font-weight: 700;
  letter-spacing: 0.01em;
  padding: 0.7rem 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
}

.login-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.google-icon {
  background: white;
  border-radius: 50%;
  padding: 2px;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(11, 61, 46, 0.3);
  border-top-color: #0b3d2e;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* --- Estado logueado --- */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #f5f7f5;
}

.avatar-ring {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e7a46, #0b3d2e);
  border: 2px solid #d4af37;
  font-weight: 700;
  color: #f4d97a;
}

.user-name {
  font-weight: 600;
  color: #f5f7f5;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #f5f7f5;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.85rem;
  backdrop-filter: blur(6px);
  transition: background 0.15s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.error-msg {
  color: #ff8a8a;
  font-size: 0.85rem;
  text-align: center;
}
</style>