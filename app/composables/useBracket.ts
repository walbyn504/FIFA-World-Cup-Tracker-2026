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

// Menor potencia de 2 que sea >= n
const nextPowerOfTwo = (n: number): number => {
  let power = 1
  while (power < n) power *= 2
  return power
}

const isGroupComplete = (standings: { played: number }[]): boolean =>
  standings.length > 1 && standings.every((s) => s.played === standings.length - 1)

// Mismo criterio de desempate que useStandings.ts (puntos, diferencia de gol,
// goles a favor), para comparar terceros lugares de distintos grupos entre sí.
const bestThirdPlacedComparator = (a: TeamStanding, b: TeamStanding): number =>
  b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor

// Arma los cruces de Dieciseisavos de UNA mitad del cuadro (16 equipos, 8
// cruces): primero empareja líderes contra terceros (prioridad), los líderes
// que sobran contra segundos lugares, y los segundos lugares que sobran entre
// sí. `thirds` ya viene filtrado para que, en lo posible, ningún tercero
// comparta grupo con los líderes de esta mitad — igual se valida acá por si
// el balanceo entre mitades no lo pudo evitar (grupo con más terceros
// clasificados del lado que le "tocaba" evitar).
const buildHalfFixtures = (
  winners: TeamStanding[], runnerups: TeamStanding[], thirds: TeamStanding[]
): [string, string][] => {
  const usedWinners = new Set<number>()
  const thirdPairs: [string, string][] = thirds.map((third) => {
    const idx = winners.findIndex((w, i) => !usedWinners.has(i) && w.group !== third.group)
    const safeIdx = idx === -1 ? winners.findIndex((_, i) => !usedWinners.has(i)) : idx
    usedWinners.add(safeIdx)
    return [winners[safeIdx]!.teamName, third.teamName]
  })

  const remainingWinners = winners.filter((_, i) => !usedWinners.has(i))
  const winnerRunnerupPairs: [string, string][] = remainingWinners.map((winner, i) => [
    winner.teamName, runnerups[i]!.teamName
  ])

  const remainingRunnerups = runnerups.slice(remainingWinners.length)
  const runnerupPairs: [string, string][] = []
  for (let i = 0; i < remainingRunnerups.length; i += 2) {
    runnerupPairs.push([remainingRunnerups[i]!.teamName, remainingRunnerups[i + 1]!.teamName])
  }

  return [...thirdPairs, ...winnerRunnerupPairs, ...runnerupPairs]
}

// Reparte los mejores terceros entre las dos mitades del cuadro, tratando de
// que cada tercero caiga del lado donde su propio grupo NO tiene al líder
// (para no arriesgar un cruce contra su propio compañero de grupo). Si un
// lado recibe más de los que le tocan, el sobrante pasa al otro lado.
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

// Sede real del catálogo para la fase indicada (en vez de "Por definir").
// Rota entre las sedes disponibles según el slot para no repetir siempre la misma.
const pickVenue = (stage: string, slot: number): { stadium: string, city: string } => {
  const options = matchVenues.filter((v) => v.stages.includes(stage))
  return options[slot % options.length] ?? options[0] ?? { stadium: 'Por definir', city: 'Por definir' }
}

// Un partido recién generado no puede quedar "programado" en el pasado. Si el
// cálculo normal (kickoff base de la ronda anterior + offset) cae antes de
// ahora, se corre hacia adelante conservando la hora del día.
const ensureFutureKickoff = (date: Date): Date => {
  const now = new Date()
  if (date.getTime() > now.getTime()) return date

  const oneDayMs = 24 * 60 * 60 * 1000
  const daysToAdd = Math.ceil((now.getTime() - date.getTime()) / oneDayMs) + 1
  const adjusted = new Date(date)
  adjusted.setDate(adjusted.getDate() + daysToAdd)
  return adjusted
}

const winnerOf = (match: Match): string => (match.homeScore > match.awayScore ? match.homeTeam : match.awayTeam)
const loserOf = (match: Match): string => (match.homeScore > match.awayScore ? match.awayTeam : match.homeTeam)

// Dos partidos "son el mismo cruce" si enfrentan a los mismos dos equipos,
// sin importar el orden (local/visitante). Sirve para no generar de nuevo
// un cruce que ya existe, y para encontrar el partido real que corresponde
// a un casillero ya calculado de la llave.
const sameMatchup = (match: Match, teamA: string, teamB: string): boolean =>
  (match.homeTeam === teamA && match.awayTeam === teamB) || (match.homeTeam === teamB && match.awayTeam === teamA)

const findMatch = (
  allMatches: (Match & { id: string })[], stage: string, homeTeam: string, awayTeam: string
): (Match & { id: string }) | undefined => {
  if (!homeTeam || !awayTeam) return undefined
  return allMatches.find((m) => m.stage === stage && sameMatchup(m, homeTeam, awayTeam))
}

// Arma la lista canónica (fija, sin depender de Firestore) de cruces del
// primer cruce eliminatorio, una vez que TODOS los grupos ya terminaron su
// fase de grupos (a diferencia de las rondas siguientes, acá no se puede
// generar por par de grupos suelto: para saber qué terceros clasifican, y de
// qué lado del cuadro cae cada uno, hace falta comparar contra los terceros
// de TODOS los grupos).
//
// El cuadro se arma en dos mitades de 16 (Izquierda/Derecha): cada grupo
// manda su líder a una mitad y su segundo lugar a la otra, así solo pueden
// reencontrarse en la Final o en el partido por el Tercer lugar (ambos salen
// de un cruce entre el ganador/perdedor de cada mitad). Dentro de cada mitad,
// los líderes cruzan primero contra los mejores terceros (prioridad); los
// líderes que sobran cruzan contra segundos lugares, y los segundos lugares
// que sobran cruzan entre sí. El ORDEN del arreglo devuelto (mitad
// izquierda..., mitad derecha...) es el que define la posición de cada
// cruce en la llave para siempre: las rondas siguientes solo emparejan
// índices consecutivos (2i, 2i+1) de esta lista, nunca dependen de fechas.
//
// La cantidad de grupos define el formato: con 8 grupos de 4 (32 equipos) el
// 1ro y 2do de cada grupo ya son 16 clasificados exactos y el cruce va
// directo a "Octavos" sin terceros; con 12 grupos de 4 (48 equipos, formato
// real del Mundial 2026) son 24 clasificados + los 8 mejores terceros = 32 y
// el cruce es "Dieciseisavos". Se calcula así (en vez de asumir un número
// fijo de grupos) para que esto no se rompa si el catálogo de selecciones
// vuelve a cambiar de tamaño.
const computeFirstRoundFixtures = (
  standings: Record<string, TeamStanding[]>
): { stage: string, fixtures: [string, string][] } | null => {
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

export interface ProjectedSlot {
  homeTeam: string
  awayTeam: string
  match?: Match & { id: string }
}

// Devuelve el ganador de un casillero solo si su partido real ya terminó;
// si el casillero todavía no tiene partido, o el partido no terminó, el
// casillero de la siguiente ronda queda con ese lado en blanco ("Por definir").
const finishedWinner = (slot: ProjectedSlot): string =>
  slot.match && slot.match.status === 'finished' ? winnerOf(slot.match) : ''

const finishedLoser = (slot: ProjectedSlot): string =>
  slot.match && slot.match.status === 'finished' ? loserOf(slot.match) : ''

// Reconstruye TODA la llave (un arreglo de casilleros por fase, en el orden
// exacto en que se dibujan) a partir únicamente de la tabla de posiciones y
// de los resultados ya cargados — nunca del orden en que los documentos de
// Firestore fueron creados ni de sus fechas de kickoff (que el usuario puede
// editar libremente al marcar un partido como finalizado, por ejemplo). Así
// la posición de cada cruce en el cuadro es siempre la misma, sin importar
// en qué orden se resuelvan los partidos.
export const computeProjectedBracket = (
  standings: Record<string, TeamStanding[]>, allMatches: (Match & { id: string })[]
): Record<string, ProjectedSlot[]> => {
  const info = computeFirstRoundFixtures(standings)
  if (!info) return {}

  const slots: Record<string, ProjectedSlot[]> = {
    [info.stage]: info.fixtures.map(([homeTeam, awayTeam]) => ({
      homeTeam,
      awayTeam,
      match: findMatch(allMatches, info.stage, homeTeam, awayTeam)
    }))
  }

  let fromStage = info.stage
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

  const semiSlots = slots.Semifinal
  if (semiSlots && semiSlots.length >= 2) {
    const homeTeam = finishedLoser(semiSlots[0]!)
    const awayTeam = finishedLoser(semiSlots[1]!)
    slots['Tercer lugar'] = [{ homeTeam, awayTeam, match: findMatch(allMatches, 'Tercer lugar', homeTeam, awayTeam) }]
  }

  return slots
}

// Fases que ya se le pueden asignar a un partido NUEVO en este momento:
// "Fase de grupos" solo mientras los grupos no hayan terminado (una vez
// completos, ya no tiene sentido cargar más partidos de grupos a mano), y
// cada fase eliminatoria solo una vez que la anterior esté completa (mismo
// criterio que generateNextRound: todos sus cruces proyectados ya existen
// como partido real y están finalizados). Sirve para que el formulario de
// partidos no ofrezca fases que todavía no correspondan, ya que esas se
// generan solas desde la llave. (Un partido de grupos ya existente se puede
// seguir editando aunque los grupos hayan terminado: el formulario agrega la
// fase propia del partido a esta lista si hace falta.)
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

// Un equipo "sigue en competencia" si todavía puede necesitar su plantilla
// completa más adelante, aunque en este momento no tenga ningún partido real
// "scheduled"/"live" (por ejemplo, mientras espera a que se resuelva el cruce
// de su rival en la ronda anterior y el partido siguiente todavía no se generó).
// Devuelve false mientras la fase de grupos no haya terminado: ahí ya alcanza
// con la regla simple de "tiene un partido pendiente".
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

  // Casillero todavía sin partido real (o cuyo cruce ya se conoce pero el
  // partido no fue creado): se muestra igual, con los equipos que ya se
  // saben y el resto en blanco, sin persistirse en Firestore.
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

  // Genera el partido de la siguiente ronda para cada par de "fromStage" en
  // cuanto ESE par en particular ya tiene los dos partidos finalizados — no
  // hace falta esperar a que toda la ronda termine. En semifinales, también
  // arma el partido de Tercer lugar con los perdedores de ese mismo par.
  // El emparejamiento usa `projected` (calculado a partir de la tabla de
  // posiciones y los resultados, nunca de fechas de kickoff) para que el
  // cruce que se genera sea siempre el estructuralmente correcto, sin
  // importar en qué orden ni con qué fecha se haya marcado cada partido
  // como finalizado.
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

  // Recorre toda la llave y genera automáticamente cualquier cruce que ya
  // esté listo (según los resultados registrados) pero todavía no exista,
  // sin esperar a que una ronda completa termine.
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
