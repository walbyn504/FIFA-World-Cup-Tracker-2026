import type { Player } from '~~/shared/types/player'

export const usePlayers = () => {
  const { getAll, getById, getWhere, create, update, remove, where } = useFirestore()

  // Busca todos los jugadores
  const getAllPlayers = () => getAll<Player>('players')

  // Busca un jugador por su id
  const getPlayerById = (playerId: string) => getById<Player>('players', playerId)

  // Busca los jugadores de un equipo especifico
  const getPlayersByTeam = (teamId: string) => getWhere<Player>('players', where('teamId', '==', teamId))

  // Crea un jugador nuevo
  const createPlayer = (player: Player) => create('players', player)

  // Actualiza un jugador existente
  const updatePlayer = (playerId: string, changes: Partial<Player>) => update<Player>('players', playerId, changes)

  // Elimina un jugador
  const deletePlayer = (playerId: string) => remove('players', playerId)

  return {
    getAllPlayers,
    getPlayerById,
    getPlayersByTeam,
    createPlayer,
    updatePlayer,
    deletePlayer
  }
}
