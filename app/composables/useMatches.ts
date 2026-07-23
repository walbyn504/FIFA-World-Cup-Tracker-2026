import type { Match } from '~~/shared/types/match'

export const useMatches = () => {
  const { getAll, getById, getWhere, create, update, remove, where } = useFirestore()

  // Busca todos los partidos
  const getAllMatches = () => getAll<Match>('matches')

  // Busca un partido por su id
  const getMatchById = (matchId: string) => getById<Match>('matches', matchId)

  // Busca los partidos de un grupo especifico
  const getMatchesByGroup = (group: string) => getWhere<Match>('matches', where('group', '==', group))

  // Busca los partidos de una fase especifica
  const getMatchesByStage = (stage: string) => getWhere<Match>('matches', where('stage', '==', stage))

  // Crea un partido nuevo
  const createMatch = (match: Match) => create('matches', match)

  // Actualiza un partido existente
  const updateMatch = (matchId: string, changes: Partial<Match>) => update<Match>('matches', matchId, changes)

  // Elimina un partido
  const deleteMatch = (matchId: string) => remove('matches', matchId)

  return {
    getAllMatches,
    getMatchById,
    getMatchesByGroup,
    getMatchesByStage,
    createMatch,
    updateMatch,
    deleteMatch
  }
}
