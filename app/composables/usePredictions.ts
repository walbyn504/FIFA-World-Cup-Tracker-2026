import type { Prediction } from '~~/shared/types/prediction'
import type { Match } from '~~/shared/types/match'

export const usePredictions = () => {
  const { getAll, getById, getWhere, create, update, where } = useFirestore()

  // Busca todas las predicciones
  const getAllPredictions = () => getAll<Prediction>('predictions')

  // Busca una predicción por su id
  const getPredictionById = (predictionId: string) => getById<Prediction>('predictions', predictionId)

  // Busca las predicciones de un usuario especifico
  const getPredictionsByUser = (userId: string) => getWhere<Prediction>('predictions', where('userId', '==', userId))

  // Busca las predicciones de un partido especifico
  const getPredictionsByMatch = (matchId: string) => getWhere<Prediction>('predictions', where('matchId', '==', matchId))

  // Crea una predicción nueva
  const createPrediction = (prediction: Prediction) => create('predictions', prediction)

  // Actualiza una predicción existente. Las reglas de Firestore solo dejan
  // actualizar (ni eliminar) las predicciones propias, así que esto siempre
  // se llama sobre una predicción del usuario autenticado
  const updatePrediction = (predictionId: string, changes: Partial<Prediction>) =>
    update<Prediction>('predictions', predictionId, changes)

  // Puntos que otorga una predicción ya jugada: 3 si acertó el marcador exacto,
  // 1 si acertó el resultado (local, empate o visitante) sin el marcador exacto, 0 si no
  const calculatePoints = (prediction: Prediction, match: Match): number => {
    if (match.status !== 'finished') return 0
    if (prediction.homePrediction === match.homeScore && prediction.awayPrediction === match.awayScore) return 3

    const actualResult = Math.sign(match.homeScore - match.awayScore)
    const predictedResult = Math.sign(prediction.homePrediction - prediction.awayPrediction)
    return actualResult === predictedResult ? 1 : 0
  }

  return {
    getAllPredictions,
    getPredictionById,
    getPredictionsByUser,
    getPredictionsByMatch,
    createPrediction,
    updatePrediction,
    calculatePoints
  }
}
