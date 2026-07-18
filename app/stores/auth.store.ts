import { defineStore } from 'pinia'
import type { User } from '~~/shared/types/user'

// Almacenar el estado de autenticación del usuario en un store de Pinia
export const useAuthStore = defineStore('auth', {
  //Guardar el estado de autenticación del usuario 
  state: () => ({ 
    user: null as User | null,
    isLoading: true
  }),
  getters: {
    // Verificar si el usuario está autenticado
    isLoggedIn: (state) => state.user !== null
  },
  actions: {
    // Establecer el usuario autenticado
    setUser(user: User | null) {
      this.user = user
    },
    // Establecer el estado de carga
    setLoading(loading: boolean) {
      this.isLoading = loading
    }
  }
})