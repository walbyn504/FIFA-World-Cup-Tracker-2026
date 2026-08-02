import { Timestamp } from 'firebase/firestore'
import type { Match } from '~~/shared/types/match'
import type { TeamStanding } from './useStandings'
import { matchVenues } from '~/utils/matchVenues'

export interface BracketRound {
  stage: string
  matches: (Match & { id: string })[]
}

// A qué fase avanza el ganador de cada ronda eliminatoria
const NEXT_STAGE: Record<string, string> = {
  Dieciseisavos: 'Octavos',
  Octavos: 'Cuartos',
  Cuartos: 'Semifinal',
  Semifinal: 'Final'
}

// Devuelve la potencia de 2 más cercana que sea mayor o igual a n.
const nextPowerOfTwo = (n: number): number => {
  let power = 1
  while (power < n) power *= 2
  return power
}

// Devuelve true si todos los equipos de un grupo ya jugaron todos sus partidos
const isGroupComplete = (standings: { played: number }[]): boolean =>
  standings.length > 1 && standings.every((s) => s.played === standings.length - 1)

// Compara dos equipos según los criterios de desempate oficiales de FIFA
const bestThirdPlacedComparator = (a: TeamStanding, b: TeamStanding): number =>
  b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor


//De los mejores terceros, arma los cruces de la mitad del cuadro correspondiente.
const buildHalfFixtures = (
  winners: TeamStanding[], runnerups: TeamStanding[], thirds: TeamStanding[]
): [string, string][] => {
  const usedWinners = new Set<number>()
  // Los mejores terceros se cruzan contra líderes de grupo que NO sean de su mismo grupo
  const thirdPairs: [string, string][] = thirds.map((third) => {
    const idx = winners.findIndex((w, i) => !usedWinners.has(i) && w.group !== third.group)
    const safeIdx = idx === -1 ? winners.findIndex((_, i) => !usedWinners.has(i)) : idx
    usedWinners.add(safeIdx)
    return [winners[safeIdx]!.teamName, third.teamName]
  })

  // Los líderes de grupo que sobran se cruzan contra los segundos lugares que sobran
  const remainingWinners = winners.filter((_, i) => !usedWinners.has(i))
  const winnerRunnerupPairs: [string, string][] = remainingWinners.map((winner, i) => [
    winner.teamName, runnerups[i]!.teamName
  ])

  // Los segundos lugares que sobran se cruzan entre sí
  const remainingRunnerups = runnerups.slice(remainingWinners.length)
  const runnerupPairs: [string, string][] = []
  for (let i = 0; i < remainingRunnerups.length; i += 2) {
    runnerupPairs.push([remainingRunnerups[i]!.teamName, remainingRunnerups[i + 1]!.teamName])
  }

  return [...thirdPairs, ...winnerRunnerupPairs, ...runnerupPairs]
}

// Divide los mejores terceros en dos mitades para que cada mitad del cuadro
const splitQualifiedThirds = (
  qualifiedThirds: TeamStanding[], leftGroups: string[], perHalf: number
): { left: TeamStanding[], right: TeamStanding[] } => {
  const preferLeft = qualifiedThirds.filter((t) => !leftGroups.includes(t.group))
  const preferRight = qualifiedThirds.filter((t) => leftGroups.includes(t.group))

  const left: TeamStanding[] = []
  const right: TeamStanding[] = []
  const overflow: TeamStanding[] = []

  for (const third of preferLeft) (left.length < perHalf ? left : overflow).push(third)
  for (const third of preferRight) (right.length < perHalf ? right : overflow).push(third)
  for (const third of overflow) (left.length < perHalf ? left : right).push(third)

  return { left, right }
}

// Sede real del catálogo para la fase indicada
const pickVenue = (stage: string, slot: number): { stadium: string, city: string } => {
  const options = matchVenues.filter((v) => v.stages.includes(stage))
  return options[slot % options.length] ?? options[0] ?? { stadium: 'Por definir', city: 'Por definir' }
}

// Ajusta la fecha de kickoff para que siempre sea en el futuro
const ensureFutureKickoff = (date: Date): Date => {
  const now = new Date()
  if (date.getTime() > now.getTime()) return date

  const oneDayMs = 24 * 60 * 60 * 1000
  const daysToAdd = Math.ceil((now.getTime() - date.getTime()) / oneDayMs) + 1
  const adjusted = new Date(date)
  adjusted.setDate(adjusted.getDate() + daysToAdd)
  return adjusted
}

// Devuelve el ganador y el perdedor de un partido, según el marcador
const winnerOf = (match: Match): string => (match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam)
const loserOf = (match: Match): string => (match.homeScore > match.awayScore ? match.awayTeam : match.homeTeam)


const sameMatchup = (match: Match, teamA: string, teamB: string): boolean =>
  (match.homeTeam === teamA && match.awayTeam === teamB) || (match.homeTeam === teamB && match.awayTeam === teamA)

// Busca un partido en la lista de todos los partidos que coincida con la fase y los equipos indicados  
const findMatch = (
  allMatches: (Match & { id: string })[], stage: string, homeTeam: string, awayTeam: string
): (Match & { id: string }) | undefined => {
  if (!homeTeam || !awayTeam) return undefined
  return allMatches.find((m) => m.stage === stage && sameMatchup(m, homeTeam, awayTeam))
}

// Devuelve los cruces proyectados de la primera ronda eliminatoria, según la tabla de posiciones
const computeFirstRoundFixtures = (
  standings: Record<string, TeamStanding[]>
): { stage: string, fixtures: [string, string][] } | null => {
  // No hay suficientes grupos, o algún grupo no está completo, o algún grupo tiene menos de 2 equipos
  const groupLetters = Object.keys(standings).sort()
  if (groupLetters.length < 2 || groupLetters.length % 2 !== 0) return null
  if (groupLetters.some((letter) => !isGroupComplete(standings[letter]!))) return null
  if (groupLetters.some((letter) => standings[letter]!.length < 2)) return null

  const totalQualifiers = nextPowerOfTwo(groupLetters.length * 2)
  const thirdsNeeded = totalQualifiers - groupLetters.length * 2
  const stage = thirdsNeeded > 0 ? 'Dieciseisavos' : 'Octavos'
  if (thirdsNeeded > 0 && groupLetters.some((letter) => standings[letter]!.length < 3)) return null

  const groupsPerHalf = groupLetters.length / 2
  const leftGroups = groupLetters.slice(0, groupsPerHalf)
  const rightGroups = groupLetters.slice(groupsPerHalf)

  const leftWinners = leftGroups.map((g) => standings[g]![0]!)
  const rightRunnerups = leftGroups.map((g) => standings[g]![1]!)
  const rightWinners = rightGroups.map((g) => standings[g]![0]!)
  const leftRunnerups = rightGroups.map((g) => standings[g]![1]!)

  let leftThirds: TeamStanding[] = []
  let rightThirds: TeamStanding[] = []
  // Si hacen falta terceros, se eligen los mejores terceros y se dividen entre las dos mitades del cuadro
  if (thirdsNeeded > 0) {
    const qualifiedThirds = groupLetters
      .map((letter) => standings[letter]?.[2])
      .filter((standing): standing is TeamStanding => !!standing)
      .sort(bestThirdPlacedComparator)
      .slice(0, thirdsNeeded)

    const split = splitQualifiedThirds(qualifiedThirds, leftGroups, thirdsNeeded / 2)
    leftThirds = split.left
    rightThirds = split.right
  }

  const fixtures: [string, string][] = [
    ...buildHalfFixtures(leftWinners, leftRunnerups, leftThirds),
    ...buildHalfFixtures(rightWinners, rightRunnerups, rightThirds)
  ]

  return { stage, fixtures }
}

// Devuelve la llave proyectada completa, con todos los cruces de todas las fases.
export interface ProjectedSlot {
  homeTeam: string
  awayTeam: string
  match?: Match & { id: string }
}

// Devuelve el nombre del equipo que ganó el partido proyectado
const finishedWinner = (slot: ProjectedSlot): string =>
  slot.match && slot.match.status === 'finished' ? winnerOf(slot.match) : ''

// Devuelve el nombre del equipo que perdió el partido proyectado
const finishedLoser = (slot: ProjectedSlot): string =>
  slot.match && slot.match.status === 'finished' ? loserOf(slot.match) : ''

// Devuelve la llave proyectada completa, con todos los cruces de todas las fases
export const computeProjectedBracket = (
  standings: Record<string, TeamStanding[]>, allMatches: (Match & { id: string })[]
): Record<string, ProjectedSlot[]> => {
  const info = computeFirstRoundFixtures(standings)
  if (!info) return {}

  // Llena la primera ronda con los cruces proyectados según la tabla de posiciones
  const slots: Record<string, ProjectedSlot[]> = {
    [info.stage]: info.fixtures.map(([homeTeam, awayTeam]) => ({
      homeTeam,
      awayTeam,
      match: findMatch(allMatches, info.stage, homeTeam, awayTeam)
    }))
  }

  let fromStage = info.stage
  // Llena las rondas siguientes con los cruces proyectados según los ganadores de la ronda anterior
  while (NEXT_STAGE[fromStage]) {
    const toStage = NEXT_STAGE[fromStage]!
    const fromSlots = slots[fromStage]!
    const toSlots: ProjectedSlot[] = []

    for (let i = 0; i + 1 < fromSlots.length; i += 2) {
      const homeTeam = finishedWinner(fromSlots[i]!)
      const awayTeam = finishedWinner(fromSlots[i + 1]!)
      toSlots.push({ homeTeam, awayTeam, match: findMatch(allMatches, toStage, homeTeam, awayTeam) })
    }

    slots[toStage] = toSlots
    fromStage = toStage
  }

  // Llena el partido de Tercer lugar según los perdedores de la semifinal
  const semiSlots = slots.Semifinal
  if (semiSlots && semiSlots.length >= 2) {
    const homeTeam = finishedLoser(semiSlots[0]!)
    const awayTeam = finishedLoser(semiSlots[1]!)
    slots['Tercer lugar'] = [{ homeTeam, awayTeam, match: findMatch(allMatches, 'Tercer lugar', homeTeam, awayTeam) }]
  }

  return slots
}

// Devuelve la cantidad de equipos que ya están clasificados
export const getQualifiedTeamsCount = (standings: Record<string, TeamStanding[]>): number => {
  const info = computeFirstRoundFixtures(standings)
  return info ? info.fixtures.flat().length : 0
}

// Devuelve la lista de fases eliminatorias que ya se pueden jugar
export const getUnlockedStages = (
  standings: Record<string, TeamStanding[]>,
  matches: (Match & { id: string })[]
): string[] => {
  const info = computeFirstRoundFixtures(standings)
  const unlocked = info ? [] : ['Fase de grupos']
  if (!info) return unlocked
  unlocked.push(info.stage)

  const projected = computeProjectedBracket(standings, matches)
  let fromStage = info.stage
  while (NEXT_STAGE[fromStage]) {
    const toStage = NEXT_STAGE[fromStage]!
    const fromSlots = projected[fromStage] || []
    const roundComplete = fromSlots.length > 0 && fromSlots.every((slot) => slot.match?.status === 'finished')
    if (!roundComplete) break

    unlocked.push(toStage)
    if (fromStage === 'Semifinal') unlocked.push('Tercer lugar')
    fromStage = toStage
  }

  return unlocked
}

// Devuelve true si el equipo todavía puede avanzar en la llave eliminatoria
export const isTeamStillInContention = (
  teamName: string,
  standings: Record<string, TeamStanding[]>,
  matches: (Match & { id: string })[]
): boolean => {
  const info = computeFirstRoundFixtures(standings)
  if (!info) return false

  const qualified = new Set(info.fixtures.flat())
  if (!qualified.has(teamName)) return false

  const projected = computeProjectedBracket(standings, matches)

  let stage: string | undefined = info.stage
  while (stage) {
    const slot = (projected[stage] || []).find((s) => s.homeTeam === teamName || s.awayTeam === teamName)
    if (!slot?.match || slot.match.status !== 'finished') return true

    if (winnerOf(slot.match) === teamName) {
      stage = NEXT_STAGE[stage]
      continue
    }

    // Perder la semifinal no elimina del todo: todavía puede quedar el Tercer lugar
    if (stage === 'Semifinal') {
      const thirdMatch = (projected['Tercer lugar'] || []).find(
        (s) => s.homeTeam === teamName || s.awayTeam === teamName
      )?.match
      return !thirdMatch || thirdMatch.status !== 'finished'
    }

    return false
  }

  return true
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

  // Obtinen los cruces proyectados de todas las fases eliminatorias
  const placeholderSlotMatch = (slot: ProjectedSlot, stage: string, index: number): Match & { id: string } => ({
    id: `preview-${stage}-${index}`,
    homeTeam: slot.homeTeam,
    awayTeam: slot.awayTeam,
    group: '',
    stage,
    stadium: 'Por definir',
    city: 'Por definir',
    kickoff: Timestamp.now(),
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled'
  })

  // Devuelve la llave proyectada completa
  const getBracket = async (): Promise<BracketRound[]> => {
    try {
      const [matches, standings] = await Promise.all([getAll<Match>('matches'), getGroupStandings()])
      const projected = computeProjectedBracket(standings, matches)

      return bracketStages.map((stage) => ({
        stage,
        matches: (projected[stage] || []).map((slot, i) => slot.match ?? placeholderSlotMatch(slot, stage, i))
      }))
    } catch (error) {
      console.error('Error al armar el bracket:', error)
      throw error
    }
  }

  // Genera automáticamente los cruces de la llave eliminatoria 
  const placeholderMatch = (
    homeTeam: string, awayTeam: string, stage: string, kickoff: Date, slot: number
  ): Match => {
    const venue = pickVenue(stage, slot)
    return {
      homeTeam,
      awayTeam,
      group: '',
      stage,
      stadium: venue.stadium,
      city: venue.city,
      kickoff: Timestamp.fromDate(ensureFutureKickoff(kickoff)),
      homeScore: 0,
      awayScore: 0,
      status: 'scheduled'
    }
  }

  // Genera los cruces de la primera ronda eliminatoria según la tabla de posiciones
  const generateFirstRound = async (allMatches: (Match & { id: string })[]): Promise<string[]> => {
    const standings = await getGroupStandings()
    const info = computeFirstRoundFixtures(standings)
    if (!info) return []
    const { stage, fixtures } = info

    const existing = allMatches.filter((m) => m.stage === stage)
    const kickoffBase = new Date()
    kickoffBase.setDate(kickoffBase.getDate() + 7)
    kickoffBase.setHours(16, 0, 0, 0)
    let createdCount = 0

    fixtures.forEach(([homeTeam, awayTeam], slot) => {
      if (existing.some((m) => sameMatchup(m, homeTeam, awayTeam))) return

      const kickoff = new Date(kickoffBase)
      kickoff.setHours(kickoffBase.getHours() + slot * 3)

      createMatch(placeholderMatch(homeTeam, awayTeam, stage, kickoff, slot))
      createdCount++
    })

    return createdCount > 0 ? [`Se generaron los cruces de ${stage}.`] : []
  }

  // Genera los cruces de la siguiente ronda eliminatoria según los resultados de la ronda anterior
  const generateNextRound = async (
    fromStage: string, projected: Record<string, ProjectedSlot[]>, allMatches: (Match & { id: string })[]
  ): Promise<string[]> => {
    const toStage = NEXT_STAGE[fromStage]
    if (!toStage) return []

    const fromSlots = projected[fromStage] || []
    if (fromSlots.length === 0) return []

    const fromKickoffs = fromSlots.map((s) => s.match?.kickoff.toMillis()).filter((n): n is number => n !== undefined)
    const kickoffBase = new Date((fromKickoffs.length ? Math.max(...fromKickoffs) : Date.now()) + 7 * 24 * 60 * 60 * 1000)
    const existingNext = allMatches.filter((m) => m.stage === toStage)
    const existingThird = allMatches.filter((m) => m.stage === 'Tercer lugar')
    let nextCreated = false
    let thirdCreated = false

    for (let i = 0; i + 1 < fromSlots.length; i += 2) {
      const matchA = fromSlots[i]!.match
      const matchB = fromSlots[i + 1]!.match
      if (!matchA || !matchB || matchA.status !== 'finished' || matchB.status !== 'finished') continue

      const slot = i / 2
      const kickoff = new Date(kickoffBase)
      kickoff.setHours(kickoffBase.getHours() + slot * 3)

      const homeTeam = winnerOf(matchA)
      const awayTeam = winnerOf(matchB)

      if (!existingNext.some((m) => sameMatchup(m, homeTeam, awayTeam))) {
        await createMatch(placeholderMatch(homeTeam, awayTeam, toStage, kickoff, slot))
        nextCreated = true
      }

      if (fromStage === 'Semifinal') {
        const thirdHome = loserOf(matchA)
        const thirdAway = loserOf(matchB)
        if (!existingThird.some((m) => sameMatchup(m, thirdHome, thirdAway))) {
          await createMatch(placeholderMatch(thirdHome, thirdAway, 'Tercer lugar', kickoff, slot))
          thirdCreated = true
        }
      }
    }

    const messages: string[] = []
    if (nextCreated) messages.push(`Se generaron los cruces de ${toStage}.`)
    if (thirdCreated) messages.push('Se generó el partido por el Tercer lugar.')
    return messages
  }

  // Genera automáticamente los cruces de la llave eliminatoria según la tabla de posiciones
  const generateBracket = async (): Promise<string[]> => {
    const messages: string[] = []
    let allMatches = await getAll<Match>('matches')

    messages.push(...await generateFirstRound(allMatches))

    for (const stage of ['Dieciseisavos', 'Octavos', 'Cuartos', 'Semifinal']) {
      allMatches = await getAll<Match>('matches')
      const standings = await getGroupStandings()
      const projected = computeProjectedBracket(standings, allMatches)
      messages.push(...await generateNextRound(stage, projected, allMatches))
    }

    return messages
  }

  return { getBracket, generateBracket, bracketStages }
}
