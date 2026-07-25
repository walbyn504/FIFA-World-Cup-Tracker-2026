// Script de carga inicial de datos (equipos, jugadores y partidos de fase de grupos)
// directo a Firestore, usando Firebase Admin SDK (no pasa por la interfaz ni por las
// reglas de seguridad del SDK cliente).
//
// Requisitos antes de correrlo:
//   1. Descargar una clave de servicio desde Firebase Console
//      (Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada)
//      y guardarla como scripts/serviceAccountKey.json (ya está en .gitignore).
//   2. npm run seed
//
// Nota: el grupo, entrenador ("coach") y ranking FIFA de cada selección son valores
// de referencia para poder probar la app (no están verificados contra datos oficiales
// actuales). Los nombres de jugadores también son genéricos, no roster reales.

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { worldCupTeams } from '../app/utils/worldCupTeams'
import { clubCatalog } from '../app/utils/clubCatalog'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// Asignación de grupos (A-H, 4 equipos cada uno = 32 en total) para que el
// primer cruce eliminatorio (Dieciseisavos, top 2 de cada grupo) dé un bracket
// parejo: 16 -> Octavos (8) -> Cuartos (4) -> Semifinal (2) -> Final.
const groupAssignments: Record<string, string> = {
  'Canadá': 'A', 'México': 'A', 'Estados Unidos': 'A', 'Costa Rica': 'A',
  'Argentina': 'B', 'Brasil': 'B', 'Uruguay': 'B', 'Colombia': 'B',
  'Ecuador': 'C', 'España': 'C', 'Francia': 'C', 'Alemania': 'C',
  'Inglaterra': 'D', 'Portugal': 'D', 'Países Bajos': 'D', 'Bélgica': 'D',
  'Italia': 'E', 'Croacia': 'E', 'Suiza': 'E', 'Polonia': 'E',
  'Serbia': 'F', 'Japón': 'F', 'Corea del Sur': 'F', 'Irán': 'F',
  'Arabia Saudita': 'G', 'Australia': 'G', 'Marruecos': 'G', 'Senegal': 'G',
  'Nigeria': 'H', 'Egipto': 'H', 'Ghana': 'H', 'Nueva Zelanda': 'H'
}

// Sedes reales del Mundial 2026 (Canadá, México, Estados Unidos)
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

// Plantilla de 23 jugadores: 3 porteros, 8 defensas, 8 mediocampistas, 4 delanteros
const squadPositions = [
  ...Array(3).fill('Portero'),
  ...Array(8).fill('Defensa'),
  ...Array(8).fill('Mediocampista'),
  ...Array(4).fill('Delantero')
]

function roundRobin(teams: string[]): [string, string][] {
  const pairs: [string, string][] = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      pairs.push([teams[i], teams[j]])
    }
  }
  return pairs
}

// Genera un marcador reproducible (0-3) a partir de un índice, sin azar real
function deterministicScore(seed: number): number {
  return seed % 4
}

async function seedTeams() {
  console.log('Creando equipos...')
  const teamIdByName = new Map<string, string>()
  let ranking = 1

  for (const preset of worldCupTeams) {
    const group = groupAssignments[preset.name]
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

async function seedPlayers(teamIdByName: Map<string, string>) {
  console.log('Creando jugadores (23 por equipo)...')

  for (const preset of worldCupTeams) {
    const teamId = teamIdByName.get(preset.name)!
    const clubs = clubCatalog.filter((c) => c.country === preset.name).map((c) => c.club)
    const batch = db.batch()

    squadPositions.forEach((position, i) => {
      const playerRef = db.collection('players').doc()
      batch.set(playerRef, {
        teamId,
        name: `Jugador ${i + 1} - ${preset.name}`,
        number: i + 1,
        position,
        club: clubs.length ? clubs[i % clubs.length] : 'Independiente',
        isStarter: i < 11
      })
    })

    await batch.commit()
  }
}

async function seedGroupStageMatches() {
  console.log('Creando partidos de fase de grupos...')

  const teamsByGroup = new Map<string, string[]>()
  for (const [name, group] of Object.entries(groupAssignments)) {
    if (!teamsByGroup.has(group)) teamsByGroup.set(group, [])
    teamsByGroup.get(group)!.push(name)
  }

  const baseDate = new Date('2026-06-11T16:00:00-05:00')
  let matchIndex = 0

  for (const [group, teams] of teamsByGroup.entries()) {
    for (const [homeTeam, awayTeam] of roundRobin(teams)) {
      const venue = venues[matchIndex % venues.length]
      const kickoff = new Date(baseDate)
      kickoff.setDate(baseDate.getDate() + Math.floor(matchIndex / 4))

      await db.collection('matches').add({
        homeTeam,
        awayTeam,
        group,
        stage: 'Fase de grupos',
        stadium: venue.stadium,
        city: venue.city,
        kickoff: Timestamp.fromDate(kickoff),
        homeScore: deterministicScore(matchIndex * 7 + 3),
        awayScore: deterministicScore(matchIndex * 5 + 1),
        status: 'finished'
      })

      matchIndex++
    }
  }

  return matchIndex
}

async function seed() {
  const teamIdByName = await seedTeams()
  await seedPlayers(teamIdByName)
  const matchCount = await seedGroupStageMatches()

  console.log(`\nListo: ${teamIdByName.size} equipos, ${teamIdByName.size * squadPositions.length} jugadores, ${matchCount} partidos de fase de grupos.`)
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error en el seed:', err)
    process.exit(1)
  })
