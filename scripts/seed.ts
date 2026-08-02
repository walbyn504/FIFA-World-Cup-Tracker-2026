// Carga inicial de datos (equipos, jugadores, partidos de fase de grupos) directo a
// Firestore con Firebase Admin SDK.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { worldCupTeams, type WorldCupTeamPreset } from '../app/utils/worldCupTeams'
import { clubCatalog } from '../app/utils/clubCatalog'
import { realSquads } from './realSquads'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const venues = [
  { stadium: 'Estadio Azteca', city: 'Ciudad de México' },
  { stadium: 'Estadio Akron', city: 'Guadalajara' },
  { stadium: 'Estadio BBVA', city: 'Monterrey' },
  { stadium: 'BMO Field', city: 'Toronto' },
  { stadium: 'BC Place', city: 'Vancouver' },
  { stadium: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  { stadium: 'Gillette Stadium', city: 'Boston' },
  { stadium: 'AT&T Stadium', city: 'Dallas' },
  { stadium: 'NRG Stadium', city: 'Houston' },
  { stadium: 'Arrowhead Stadium', city: 'Kansas City' },
  { stadium: 'SoFi Stadium', city: 'Los Ángeles' },
  { stadium: 'Hard Rock Stadium', city: 'Miami' },
  { stadium: 'MetLife Stadium', city: 'Nueva York/Nueva Jersey' },
  { stadium: 'Lincoln Financial Field', city: 'Filadelfia' },
  { stadium: 'Levi\'s Stadium', city: 'San Francisco' },
  { stadium: 'Lumen Field', city: 'Seattle' }
]

// Fallback para selecciones sin convocatoria real: 3 porteros, 8 defensas,
// 8 mediocampistas, 4 delanteros.
const squadPositions = [
  ...Array(3).fill('Portero'),
  ...Array(8).fill('Defensa'),
  ...Array(8).fill('Mediocampista'),
  ...Array(4).fill('Delantero')
]

// Once titular 4-4-2 sobre squadPositions. No son "los primeros 11 por
// índice" porque ahí caerían los 3 porteros a la vez (máximo 1 titular).
const starterIndexes = new Set([0, 3, 4, 5, 6, 11, 12, 13, 14, 19, 20])

function roundRobin(teams: string[]): [string, string][] {
  const pairs: [string, string][] = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push([teams[i]!, teams[j]!])
    }
  }
  return pairs
}

function deterministicScore(homeTeam: string, awayTeam: string, salt: number): number {
  let hash = salt
  for (const char of `${homeTeam}|${awayTeam}`) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997
  }
  return hash % 5
}

// Crea un objeto TeamStanding vacío para un equipo dado.
function assignGroups(teams: WorldCupTeamPreset[]): Map<string, string> {
  const byConfederation = new Map<string, WorldCupTeamPreset[]>()
  for (const team of teams) {
    const bucket = byConfederation.get(team.confederation) ?? []
    bucket.push(team)
    byConfederation.set(team.confederation, bucket)
  }
  const buckets = [...byConfederation.values()]

  const interleaved: WorldCupTeamPreset[] = []
  for (let round = 0; interleaved.length < teams.length; round++) {
    for (const bucket of buckets) {
      const team = bucket[round]
      if (team) interleaved.push(team)
    }
  }

  if (interleaved.length % 4 !== 0) {
    throw new Error(`worldCupTeams tiene ${interleaved.length} selecciones; debe ser múltiplo de 4 para armar grupos parejos.`)
  }

  const assignment = new Map<string, string>()
  interleaved.forEach((team, i) => {
    const letter = String.fromCharCode('A'.charCodeAt(0) + Math.floor(i / 4))
    assignment.set(team.name, letter)
  })
  return assignment
}

const groupAssignments = assignGroups(worldCupTeams)

async function seedTeams() {
  console.log('Creando equipos...')
  const teamIdByName = new Map<string, string>()
  let ranking = 1

  for (const preset of worldCupTeams) {
    const group = groupAssignments.get(preset.name)!
    const ref = await db.collection('teams').add({
      name: preset.name,
      group,
      flag: preset.flag,
      coach: 'Por definir',
      confederation: preset.confederation,
      fifaRanking: ranking++
    })
    teamIdByName.set(preset.name, ref.id)
    console.log(`  ${preset.name} (grupo ${group}) -> ${ref.id}`)
  }

  return teamIdByName
}

interface SeededPlayer {
  id: string
  name: string
  position: string
}

async function seedPlayers(teamIdByName: Map<string, string>) {
  console.log('Creando jugadores...')
  let playerCount = 0

  // Map de nombre de equipo a lista de jugadores (solo id, nombre y posición) para
  // poder asignar goleadores a los partidos de fase de grupos.
  const squadsByTeam = new Map<string, SeededPlayer[]>()

  for (const preset of worldCupTeams) {
    const teamId = teamIdByName.get(preset.name)!
    const clubs = clubCatalog.filter((c) => c.country === preset.name).map((c) => c.club)
    const realSquad = realSquads[preset.name]
    const batch = db.batch()
    const squad: SeededPlayer[] = []
    playerCount += realSquad ? realSquad.length : squadPositions.length

    if (realSquad) {
      // Los dorsales 1-11 son el once titular por convención del fútbol.
      realSquad.forEach((player) => {
        const playerRef = db.collection('players').doc()
        batch.set(playerRef, {
          teamId,
          name: player.name,
          number: player.number,
          position: player.position,
          club: clubs.length ? clubs[player.number % clubs.length] : 'Independiente',
          isStarter: player.number <= 11
        })
        squad.push({ id: playerRef.id, name: player.name, position: player.position })
      })
    } else {
      squadPositions.forEach((position, i) => {
        const playerRef = db.collection('players').doc()
        const name = `Jugador ${i + 1} - ${preset.name}`
        batch.set(playerRef, {
          teamId,
          name,
          number: i + 1,
          position,
          club: clubs.length ? clubs[i % clubs.length] : 'Independiente',
          isStarter: starterIndexes.has(i)
        })
        squad.push({ id: playerRef.id, name, position })
      })
    }

    await batch.commit()
    squadsByTeam.set(preset.name, squad)
  }

  return { playerCount, squadsByTeam }
}


function pickScorer(teamName: string, squad: SeededPlayer[], goalIndex: number): SeededPlayer | null {
  if (squad.length === 0) return null
  const attackers = squad.filter((p) => p.position === 'Delantero' || p.position === 'Mediocampista')
  const pool = attackers.length > 0 ? attackers : squad

  let hash = 7
  for (const char of `${teamName}|${goalIndex}`) {
    hash = (hash * 31 + char.charCodeAt(0)) % 997
  }
  return pool[hash % pool.length]!
}

async function seedGroupStageMatches(squadsByTeam: Map<string, SeededPlayer[]>) {
  console.log('Creando partidos de fase de grupos...')

  const teamsByGroup = new Map<string, string[]>()
  for (const [name, group] of groupAssignments.entries()) {
    if (!teamsByGroup.has(group)) teamsByGroup.set(group, [])
    teamsByGroup.get(group)!.push(name)
  }

  const baseDate = new Date('2026-06-11T16:00:00-05:00')
  let matchIndex = 0

  for (const [group, teams] of teamsByGroup.entries()) {
    for (const [homeTeam, awayTeam] of roundRobin(teams)) {
      const venue = venues[matchIndex % venues.length]!
      const kickoff = new Date(baseDate)
      kickoff.setDate(baseDate.getDate() + Math.floor(matchIndex / 4))

      const homeScore = deterministicScore(homeTeam, awayTeam, 1)
      const awayScore = deterministicScore(homeTeam, awayTeam, 2)
      const homeSquad = squadsByTeam.get(homeTeam) ?? []
      const awaySquad = squadsByTeam.get(awayTeam) ?? []

      const scorers: { playerId: string, playerName: string, team: 'home' | 'away' }[] = []
      for (let i = 0; i < homeScore; i++) {
        const scorer = pickScorer(homeTeam, homeSquad, i)
        if (scorer) scorers.push({ playerId: scorer.id, playerName: scorer.name, team: 'home' })
      }
      for (let i = 0; i < awayScore; i++) {
        const scorer = pickScorer(awayTeam, awaySquad, i)
        if (scorer) scorers.push({ playerId: scorer.id, playerName: scorer.name, team: 'away' })
      }

      await db.collection('matches').add({
        homeTeam,
        awayTeam,
        group,
        stage: 'Fase de grupos',
        stadium: venue.stadium,
        city: venue.city,
        kickoff: Timestamp.fromDate(kickoff),
        homeScore,
        awayScore,
        status: 'finished',
        scorers
      })

      matchIndex++
    }
  }

  return matchIndex
}

async function seed() {
  const teamIdByName = await seedTeams()
  const { playerCount, squadsByTeam } = await seedPlayers(teamIdByName)
  const matchCount = await seedGroupStageMatches(squadsByTeam)

  console.log(`\nListo: ${teamIdByName.size} equipos, ${playerCount} jugadores, ${matchCount} partidos de fase de grupos.`)
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error en el seed:', err)
    process.exit(1)
  })
