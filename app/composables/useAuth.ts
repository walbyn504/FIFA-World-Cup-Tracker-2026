// Importa las funciones necesarias de Firebase para la autenticación
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
// Importa las funciones necesarias de Firebase para Firestore
import { doc, getDoc, setDoc } from 'firebase/firestore'
// Importa el modelo de usuario 
import type { User } from '~~/shared/types/user'

export const useAuth = () => {

  // Accede a las instancias de Firebase Auth y Firestore proporcionadas por el plugin de Nuxt
  const { $firebaseAuth, $firestore } = useNuxtApp()
  // Estado del usuario alamacenado en el store de Pinia
  const authStore = useAuthStore()

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider() //Proveedor de Google

    try {
      // Ventana para iniciar sesión con Google
      const result = await signInWithPopup($firebaseAuth, provider)
      // Obtiene el usuario autenticado de Firebase
      const firebaseUser = result.user

      // Busca si existe un usuario con ese id en la colección 'users' de Firestore
      const userRef = doc($firestore, 'users', firebaseUser.uid)
      const userSnap = await getDoc(userRef) // Responde si existe el usuario

      //No existe, crea nuevo perfil
      if (!userSnap.exists()) {
        const newUser: User = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName ?? '',
          email: firebaseUser.email ?? '',
          favoriteTeams: [],
          favoriteMatches: [],
          points: 0
        }
        await setDoc(userRef, newUser)
        authStore.setUser(newUser)
        //Cargue datos guardados
      } else {
        authStore.setUser(userSnap.data() as User)
      }
    } catch (error) {
      console.error('Error al iniciar sesion con Google:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut($firebaseAuth)
      authStore.setUser(null)
    } catch (error) {
      console.error('Error al cerrar sesion:', error)
      throw error
    }
  }

  // Actualiza los datos editables del perfil del usuario autenticado
  // ('points' se recalcula desde las predicciones, no lo edita el usuario a mano)
  const updateProfile = async (changes: Partial<Pick<User, 'name' | 'favoriteTeam' | 'points'>>) => {
    if (!authStore.user) return

    try {
      const userRef = doc($firestore, 'users', authStore.user.uid)
      await setDoc(userRef, changes, { merge: true })
      authStore.setUser({ ...authStore.user, ...changes })
    } catch (error) {
      console.error('Error al actualizar el perfil:', error)
      throw error
    }
  }

  return {
    loginWithGoogle,
    logout,
    updateProfile
  }
}