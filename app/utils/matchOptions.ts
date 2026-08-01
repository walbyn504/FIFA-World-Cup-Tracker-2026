import type { MatchStatus } from '~~/shared/types/match'

// Tope de goles por equipo (resultado real o predicción)
export const MAX_GOALS = 10

// Fases del torneo, de fase de grupos a la final
export const matchStages = [
  'Fase de grupos',
  'Dieciseisavos',
  'Octavos',
  'Cuartos',
  'Semifinal',
  'Tercer lugar',
  'Final'
]

export const matchStatuses: { value: MatchStatus, label: string }[] = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'live', label: 'En Vivo' },
  { value: 'finished', label: 'Finalizado' }
]

export const matchStatusLabels: Record<MatchStatus, string> = {
  scheduled: 'Programado',
  live: 'En Vivo',
  finished: 'Finalizado'
}
