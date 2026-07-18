// Paquetes que proporcionan la autenticación, la base de datos y el almacenamiento de Firebase
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import type { User } from '~~/shared/types/user'

// Inicializa Firebase y proporciona las instancias a la aplicación
export default defineNuxtPlugin(() => {
  // Acceso a la configuración de tiempo de ejecución para obtener las claves de Firebase
  const config = useRuntimeConfig()

  // Configuración de Firebase utilizando las variables de entorno
  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId
  }

  // Inicializa la aplicación de Firebase con la configuración proporcionada
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app) // Login/logout con Google
  const firestore = getFirestore(app) // Leer y escribir datos en Firestore
  const storage = getStorage(app) // Subir y descargar archivos desde Firebase Storage

  // Store de Pinia donde se guarda el usuario logueado
  const authStore = useAuthStore()

  // Escucha cambios en el estado de sesion (login, logout, o sesion restaurada al recargar)
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userRef = doc(firestore, 'users', firebaseUser.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        authStore.setUser(userSnap.data() as User)
      }
    } else {
      authStore.setUser(null)
    }
    authStore.setLoading(false)
  })

  // Proporciona las instancias de Firebase a la aplicacion Nuxt para que puedan ser utilizadas en cualquier parte del proyecto
  return {
    provide: {
      firebaseAuth: auth,
      firestore,
      firebaseStorage: storage
    }
  }
})