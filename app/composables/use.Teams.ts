
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import type { Team } from '~~/shared/types/team'

export const useTeams = () => {
  const { $firestore } = useNuxtApp()

  // Trae todos los equipos
  const getAllTeams = async () => {
    const teamsRef = collection($firestore, 'teams')
    const snapshot = await getDocs(teamsRef)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Team) }))
  }

  // Trae un equipo por su id
  const getTeamById = async (teamId: string) => {
    const teamRef = doc($firestore, 'teams', teamId)
    const teamSnap = await getDoc(teamRef)
    if (!teamSnap.exists()) return null
    return { id: teamSnap.id, ...(teamSnap.data() as Team) }
  }

  // Trae equipos de un grupo especifico
  const getTeamsByGroup = async (group: string) => {
    const teamsRef = collection($firestore, 'teams')
    const q = query(teamsRef, where('group', '==', group))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Team) }))
  }

  // Crea un equipo nuevo
  const createTeam = async (team: Team) => {
    const teamsRef = collection($firestore, 'teams')
    const docRef = await addDoc(teamsRef, team)
    return docRef.id
  }

  // Actualiza un equipo existente
  const updateTeam = async (teamId: string, changes: Partial<Team>) => {
    const teamRef = doc($firestore, 'teams', teamId)
    await updateDoc(teamRef, changes)
  }

  // Elimina un equipo
  const deleteTeam = async (teamId: string) => {
    const teamRef = doc($firestore, 'teams', teamId)
    await deleteDoc(teamRef)
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


