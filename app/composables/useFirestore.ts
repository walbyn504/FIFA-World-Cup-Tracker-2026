import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, type QueryConstraint, type DocumentData
} from 'firebase/firestore'

export const useFirestore = () => {
  const { $firestore } = useNuxtApp()

  // Obtiene todos los documentos de una colección
  const getAll = async <T>(collectionName: string): Promise<(T & { id: string })[]> => {
    try {
      const ref = collection($firestore, collectionName)
      const snapshot = await getDocs(ref)
      return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))
    } catch (error) {
      console.error(`Error obteniendo ${collectionName}:`, error)
      throw error
    }
  }

  // Obtiene un documento por su id
  const getById = async <T>(collectionName: string, id: string): Promise<(T & { id: string }) | null> => {
    try {
      const ref = doc($firestore, collectionName, id)
      const snap = await getDoc(ref)
      if (!snap.exists()) return null
      return { id: snap.id, ...(snap.data() as T) }
    } catch (error) {
      console.error(`Error obteniendo documento de ${collectionName}:`, error)
      throw error
    }
  }

  /*const getWhere = async <T>(
    collectionName: string,
    ...conditions: QueryConstraint[]
  ): Promise<(T & { id: string })[]> => {
    try {
      const ref = collection($firestore, collectionName)
      const q = query(ref, ...conditions)
      const snapshot = await getDocs(q)
      return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))
    } catch (error) {
      console.error(`Error consultando ${collectionName}:`, error)
      throw error
    }
  }*/

  // Crea un nuevo documento en una colección
  const create = async <T extends DocumentData>(collectionName: string, data: T): Promise<string> => {
    try {
      const ref = collection($firestore, collectionName)
      const docRef = await addDoc(ref, data)
      return docRef.id
    } catch (error) {
      console.error(`Error creando en ${collectionName}:`, error)
      throw error
    }
  }

  // Actualiza un documento existente
  const update = async <T extends DocumentData>(
    collectionName: string, id: string, changes: Partial<T>
  ): Promise<void> => {
    try {
      const ref = doc($firestore, collectionName, id)
      await updateDoc(ref, changes as any)
    } catch (error) {
      console.error(`Error actualizando ${collectionName}:`, error)
      throw error
    }
  }

  // Elimina un documento
  const remove = async (collectionName: string, id: string): Promise<void> => {
    try {
      const ref = doc($firestore, collectionName, id)
      await deleteDoc(ref)
    } catch (error) {
      console.error(`Error eliminando de ${collectionName}:`, error)
      throw error
    }
  }

  return { getAll, getById, create, update, remove, where }
}