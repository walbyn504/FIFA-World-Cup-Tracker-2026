import type { Team } from '~~/shared/types/team'
import type { Match } from '~~/shared/types/match'

export interface TopScorer {
  playerId: string
  playerName: string
  teamName: string
  flag: string
  goals: number
}

export interface TeamStanding {
  teamId: string
  teamName: string
  flag: string
  group: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export const useStandings = () => {
  const { getAll } = useFirestore()

  const emptyStanding = (team: Team & { id: string }): TeamStanding => ({
    teamId: team.id,
    teamName: team.name,
    flag: team.flag,
    group: team.group,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  })

  // Calcula la tabla de posiciones de fase de grupos, agrupada por grupo.
  // Solo cuentan los partidos de "Fase de grupos" ya finalizados.
    const getGroupStandings = async (): Promise<Record<string, TeamStanding[]>> => {
    try {
        const [teams, matches] = await Promise.all([
        getAll<Team>('teams'),
        getAll<Match>('matches')
        ])

        const standingsByTeamName = new Map<string, TeamStanding>()
        for (const team of teams) {
        standingsByTeamName.set(team.name, emptyStanding(team))
        }

        const groupStageMatches = matches.filter(
        (match) => match.stage === 'Fase de grupos' && match.status === 'finished'
        )

        for (const match of groupStageMatches) {
        const home = standingsByTeamName.get(match.homeTeam)
        const away = standingsByTeamName.get(match.awayTeam)
        if (!home || !away) continue

        home.played++
        away.played++
        home.goalsFor += match.homeScore
        home.goalsAgainst += match.awayScore
        away.goalsFor += match.awayScore
        away.goalsAgainst += match.homeScore

        if (match.homeScore > match.awayScore) {
            home.won++
            home.points += 3
            away.lost++
        } else if (match.homeScore < match.awayScore) {
            away.won++
            away.points += 3
            home.lost++
        } else {
            home.drawn++
            away.drawn++
            home.points += 1
            away.points += 1
        }
        }

        const byGroup: Record<string, TeamStanding[]> = {}
        for (const standing of standingsByTeamName.values()) {
        standing.goalDifference = standing.goalsFor - standing.goalsAgainst
        const group = byGroup[standing.group] ?? (byGroup[standing.group] = [])
        group.push(standing)
        }

        for (const group of Object.values(byGroup)) {
        group.sort(
            (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
        )
        }

        return byGroup
    } catch (error) {
        console.error('Error al calcular la tabla de posiciones:', error)
        throw error
    }
    }

  // Estadísticas por selección considerando TODOS los partidos finalizados,
  // sin importar la fase (a diferencia de getGroupStandings, que solo mira fase de grupos).
  const getOverallTeamStats = async (): Promise<TeamStanding[]> => {
    try {
      const [teams, matches] = await Promise.all([
        getAll<Team>('teams'),
        getAll<Match>('matches')
      ])

      const standingsByTeamName = new Map<string, TeamStanding>()
      for (const team of teams) {
        standingsByTeamName.set(team.name, emptyStanding(team))
      }

      const finishedMatches = matches.filter((match) => match.status === 'finished')

      for (const match of finishedMatches) {
        const home = standingsByTeamName.get(match.homeTeam)
        const away = standingsByTeamName.get(match.awayTeam)
        if (!home || !away) continue

        home.played++
        away.played++
        home.goalsFor += match.homeScore
        home.goalsAgainst += match.awayScore
        away.goalsFor += match.awayScore
        away.goalsAgainst += match.homeScore

        if (match.homeScore > match.awayScore) {
          home.won++
          away.lost++
        } else if (match.homeScore < match.awayScore) {
          away.won++
          home.lost++
        } else {
          home.drawn++
          away.drawn++
        }
      }

      const standings = Array.from(standingsByTeamName.values())
      for (const standing of standings) {
        standing.goalDifference = standing.goalsFor - standing.goalsAgainst
      }

      return standings
    } catch (error) {
      console.error('Error al calcular las estadísticas generales:', error)
      throw error
    }
  }

  // Jugador(es) con más goles anotados, contando todos los partidos finalizados.
  // Devuelve una lista porque puede haber más de un goleador empatado en la punta.
  const getTopScorers = async (): Promise<TopScorer[]> => {
    try {
      const [teams, matches] = await Promise.all([
        getAll<Team>('teams'),
        getAll<Match>('matches')
      ])

      const flagByTeamName = new Map(teams.map((t) => [t.name, t.flag]))
      const finishedMatches = matches.filter((match) => match.status === 'finished')

      const tally = new Map<string, TopScorer>()
      for (const match of finishedMatches) {
        for (const goal of match.scorers ?? []) {
          const teamName = goal.team === 'home' ? match.homeTeam : match.awayTeam
          const existing = tally.get(goal.playerId)
          if (existing) {
            existing.goals++
          } else {
            tally.set(goal.playerId, {
              playerId: goal.playerId,
              playerName: goal.playerName,
              teamName,
              flag: flagByTeamName.get(teamName) ?? '',
              goals: 1
            })
          }
        }
      }

      const maxGoals = Math.max(0, ...Array.from(tally.values(), (s) => s.goals))
      if (maxGoals === 0) return []
      return Array.from(tally.values()).filter((s) => s.goals === maxGoals)
    } catch (error) {
      console.error('Error al calcular el goleador del torneo:', error)
      throw error
    }
  }

  return { getGroupStandings, getOverallTeamStats, getTopScorers }
}