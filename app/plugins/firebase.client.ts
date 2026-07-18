// Paquetes que proporcionan la autenticación, la base de datos y el almacenamiento de Firebase
import { initializeApp } from 'firebase/app' 
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Inicializa Firebase y proporciona las instancias a la aplicación 
export default defineNuxtPlugin(() => {
    // Aceeso a la configuración de tiempo de ejecución para obtener las claves de Firebase
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

  // Proporciona las instancias de Firebase a la aplicación Nuxt para que puedan ser utilizadas en cualquier parte del proyecto
  return {
    provide: { 
      firebaseAuth: auth, 
      firestore,
      firebaseStorage: storage
    }
  }
})