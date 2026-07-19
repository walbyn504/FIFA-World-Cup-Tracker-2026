import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import type { Team } from '~~/shared/types/team'

export const useTeams = () => {
  const { $firestore } = useNuxtApp()

  // Busca todos los equipos
  const getAllTeams = async () => {
    try {
      const teamsRef = collection($firestore, 'teams')
      const snapshot = await getDocs(teamsRef)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Team) }))
    } catch (error) {
      console.error('Error obteniendo equipos:', error)
      throw error
    }
  }

  // Busca un equipo por su id
  const getTeamById = async (teamId: string) => {
    try {
      const teamRef = doc($firestore, 'teams', teamId)
      const teamSnap = await getDoc(teamRef)
      if (!teamSnap.exists()) return null
      return { id: teamSnap.id, ...(teamSnap.data() as Team) }
    } catch (error) {
      console.error('Error obteniendo equipo:', error)
      throw error
    }
  }

  // Busca equipos de un grupo especifico
  const getTeamsByGroup = async (group: string) => {
    try {
      const teamsRef = collection($firestore, 'teams')
      const q = query(teamsRef, where('group', '==', group))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Team) }))
    } catch (error) {
      console.error('Error obteniendo equipos por grupo:', error)
      throw error
    }
  }

  // Crea un equipo nuevo
  const createTeam = async (team: Team) => {
    try {
      const teamsRef = collection($firestore, 'teams')
      const docRef = await addDoc(teamsRef, team)
      return docRef.id
    } catch (error) {
      console.error('Error creando equipo:', error)
      throw error
    }
  }

  // Actualiza un equipo existente
  const updateTeam = async (teamId: string, changes: Partial<Team>) => {
    try {
      const teamRef = doc($firestore, 'teams', teamId)
      await updateDoc(teamRef, changes)
    } catch (error) {
      console.error('Error actualizando equipo:', error)
      throw error
    }
  }

  // Elimina un equipo
  const deleteTeam = async (teamId: string) => {
    try {
      const teamRef = doc($firestore, 'teams', teamId)
      await deleteDoc(teamRef)
    } catch (error) {
      console.error('Error eliminando equipo:', error)
      throw error
    }
  }

  return {
    getAllTeams,
    getTeamById,
    getTeamsByGroup,
    createTeam,
    updateTeam,
    deleteTeam
  }
}