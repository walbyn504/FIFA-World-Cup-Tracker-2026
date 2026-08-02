export default defineNuxtRouteMiddleware(async () => {

  // Evita que el middleware se ejecute en el servidor y evite bucles de redireccionamiento al recargar la pagina
  if (import.meta.server) return

  const authStore = useAuthStore()

  // Espera activamente a que Firebase termine de verificar la sesion
  while (authStore.isLoading) {
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  // Ya se sabe con certeza si hay sesion o no
  if (!authStore.isLoggedIn) {
    // Redirige al usuario a la pagina de inicio de sesion si no hay sesion activa
    window.location.href = '/'
  }
})
