import type { Timestamp } from 'firebase/firestore'

export interface MatchGoal {
  playerId: string
  playerName: string
  team: 'home' | 'away'
}

export interface Match {
  homeTeam: string
  awayTeam: string
  group: string
  stage: string
  stadium: string
  city: string
  kickoff: Timestamp
  homeScore: number
  awayScore: number
  status: MatchStatus
  scorers?: MatchGoal[]
}


export type MatchStatus = 'scheduled' | 'live' | 'finished'

