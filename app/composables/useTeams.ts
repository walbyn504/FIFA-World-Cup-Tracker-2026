import type { Team } from '~~/shared/types/team'

export const useTeams = () => {
  const { getAll, getById, getWhere, create, update, remove, where } = useFirestore()

  // Busca todos los equipos
  const getAllTeams = () => getAll<Team>('teams')

  // Busca un equipo por su id
  const getTeamById = (teamId: string) => getById<Team>('teams', teamId)

  // Busca equipos de un grupo especifico
  const getTeamsByGroup = (group: string) => getWhere<Team>('teams', where('group', '==', group))

  // Crea un equipo nuevo
  const createTeam = (team: Team) => create('teams', team)

  // Actualiza un equipo existente
  const updateTeam = (teamId: string, changes: Partial<Team>) => update<Team>('teams', teamId, changes)

  // Elimina un equipo
  const deleteTeam = (teamId: string) => remove('teams', teamId)

  return {
    getAllTeams,
    getTeamById,
    getTeamsByGroup,
    createTeam,
    updateTeam,
    deleteTeam
  }
}