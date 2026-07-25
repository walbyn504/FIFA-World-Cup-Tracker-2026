import { Timestamp } from 'firebase/firestore'
import type { Match } from '~~/shared/types/match'

export interface BracketRound {
  stage: string
  matches: (Match & { id: string })[]
}

// Cruces de la primera ronda eliminatoria: el 1ro de un grupo enfrenta al
// 2do del grupo emparejado, evitando que dos equipos del mismo grupo se
// crucen apenas termina la fase de grupos.
const FIRST_ROUND_GROUP_PAIRS: [string, string][] = [['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H']]

// A qué fase avanza el ganador de cada ronda eliminatoria
const NEXT_STAGE: Record<string, string> = {
  Dieciseisavos: 'Octavos',
  Octavos: 'Cuartos',
  Cuartos: 'Semifinal',
  Semifinal: 'Final'
}

export const useBracket = () => {
  const { getAll } = useFirestore()
  const { getGroupStandings } = useStandings()
  const { createMatch } = useMatches()

  const bracketStages = [
    'Dieciseisavos',
    'Octavos',
    'Cuartos',
    'Semifinal',
    'Tercer lugar',
    'Final'
  ]

  const getBracket = async (): Promise<BracketRound[]> => {
    try {
      const matches = await getAll<Match>('matches')

      return bracketStages.map((stage) => ({
        stage,
        matches: matches.filter((m) => m.stage === stage)
      }))
    } catch (error) {
      console.error('Error al armar el bracket:', error)
      throw error
    }
  }

  const winnerOf = (match: Match): string => (match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam)
  const loserOf = (match: Match): string => (match.homeScore > match.awayScore ? match.awayTeam : match.homeTeam)

  const sortByKickoff = (matches: (Match & { id: string })[]) =>
    [...matches].sort((a, b) => a.kickoff.toMillis() - b.kickoff.toMillis())

  const placeholderMatch = (
    homeTeam: string, awayTeam: string, stage: string, kickoff: Date
  ): Match => ({
    homeTeam,
    awayTeam,
    group: '',
    stage,
    stadium: 'Por definir',
    city: 'Por definir',
    kickoff: Timestamp.fromDate(kickoff),
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled'
  })

  // Genera los partidos de Octavos a partir del top 2 de cada grupo (16
  // clasificados), solo si la fase de grupos ya terminó y Octavos no fue
  // generado antes. Con 8 grupos de 4 equipos (32 en total) el primer cruce
  // eliminatorio real es Octavos, no Dieciseisavos (esa ronda solo existe en
  // el formato de 48 equipos con 32 clasificados directos); por eso
  // "Dieciseisavos" queda listado en el bracket pero siempre vacío.
  const generateFirstRound = async (allMatches: (Match & { id: string })[]): Promise<string> => {
    if (allMatches.some((m) => m.stage === 'Octavos')) {
      return 'Octavos ya estaba generado.'
    }

    const standings = await getGroupStandings()
    const groups = Object.keys(standings)

    if (groups.length === 0) {
      return 'Todavía no hay equipos ni partidos de fase de grupos cargados.'
    }

    for (const group of Object.values(standings)) {
      const complete = group.length > 1 && group.every((s) => s.played === group.length - 1)
      if (!complete) return 'Todavía faltan partidos de fase de grupos por finalizar.'
    }

    const kickoffBase = new Date('2026-06-30T16:00:00-05:00')
    let index = 0

    for (const [groupA, groupB] of FIRST_ROUND_GROUP_PAIRS) {
      const first = standings[groupA]
      const second = standings[groupB]
      if (!first || !second || first.length < 2 || second.length < 2) continue

      const fixtures: [string, string][] = [
        [first[0]!.teamName, second[1]!.teamName],
        [second[0]!.teamName, first[1]!.teamName]
      ]

      for (const [homeTeam, awayTeam] of fixtures) {
        const kickoff = new Date(kickoffBase)
        kickoff.setHours(kickoffBase.getHours() + index * 3)
        await createMatch(placeholderMatch(homeTeam, awayTeam, 'Octavos', kickoff))
        index++
      }
    }

    return index > 0 ? `Se generaron ${index} partidos de Octavos.` : 'No se pudo generar Octavos.'
  }

  // Genera la siguiente ronda a partir de los ganadores de "fromStage", una vez
  // que todos sus partidos están finalizados. En semifinales, también arma el
  // partido de Tercer lugar con los perdedores.
  const generateNextRound = async (fromStage: string, allMatches: (Match & { id: string })[]): Promise<string> => {
    const toStage = NEXT_STAGE[fromStage]
    if (!toStage) return ''

    const current = allMatches.filter((m) => m.stage === fromStage)
    if (current.length === 0) return ''
    if (current.some((m) => m.status !== 'finished')) return `Todavía faltan partidos de ${fromStage} por finalizar.`
    if (allMatches.some((m) => m.stage === toStage)) return `${toStage} ya estaba generado.`

    const ordered = sortByKickoff(current)
    const kickoffBase = new Date(ordered[ordered.length - 1]!.kickoff.toMillis() + 7 * 24 * 60 * 60 * 1000)
    let index = 0

    for (let i = 0; i + 1 < ordered.length; i += 2) {
      const matchA = ordered[i]!
      const matchB = ordered[i + 1]!
      const kickoff = new Date(kickoffBase)
      kickoff.setHours(kickoffBase.getHours() + index * 3)

      await createMatch(placeholderMatch(winnerOf(matchA), winnerOf(matchB), toStage, kickoff))

      if (fromStage === 'Semifinal') {
        await createMatch(placeholderMatch(loserOf(matchA), loserOf(matchB), 'Tercer lugar', kickoff))
      }

      index++
    }

    return `Se generó ${toStage}${fromStage === 'Semifinal' ? ' y Tercer lugar' : ''} (${index} partido${index === 1 ? '' : 's'}).`
  }

  // Recorre toda la llave y genera automáticamente cualquier ronda que ya esté
  // lista (según los resultados registrados) pero todavía no exista.
  const generateBracket = async (): Promise<string[]> => {
    const messages: string[] = []
    const allMatches = await getAll<Match>('matches')

    messages.push(await generateFirstRound(allMatches))

    for (const stage of ['Octavos', 'Cuartos', 'Semifinal']) {
      const refreshed = await getAll<Match>('matches')
      const message = await generateNextRound(stage, refreshed)
      if (message) messages.push(message)
    }

    return messages
  }

  return { getBracket, generateBracket, bracketStages }
}