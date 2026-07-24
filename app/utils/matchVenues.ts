// Catálogo de sedes del Mundial 2026 (USA/México/Canadá), agrupadas por las fases
// que jugaron en cada una. Los nombres de fase coinciden con `matchStages` (matchOptions.ts).
export interface MatchVenue {
  city: string
  stadium: string
  stages: string[]
}

export const matchVenues: MatchVenue[] = [
  { city: 'Ciudad de México', stadium: 'Estadio Azteca', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos'] },
  { city: 'Guadalajara', stadium: 'Estadio Akron', stages: ['Fase de grupos'] },
  { city: 'Monterrey', stadium: 'Estadio BBVA', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos'] },
  { city: 'Toronto', stadium: 'BMO Field', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos'] },
  { city: 'Vancouver', stadium: 'BC Place', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos'] },
  { city: 'Nueva York/Nueva Jersey', stadium: 'MetLife Stadium', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos', 'Final'] },
  { city: 'Los Ángeles', stadium: 'SoFi Stadium', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos', 'Cuartos'] },
  { city: 'Dallas', stadium: 'AT&T Stadium', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos', 'Semifinal'] },
  { city: 'Miami', stadium: 'Hard Rock Stadium', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos', 'Cuartos', 'Tercer lugar'] },
  { city: 'Atlanta', stadium: 'Mercedes-Benz Stadium', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos', 'Semifinal'] },
  { city: 'Seattle', stadium: 'Lumen Field', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos'] },
  { city: 'San Francisco', stadium: 'Levi\'s Stadium', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos'] },
  { city: 'Houston', stadium: 'NRG Stadium', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos'] },
  { city: 'Kansas City', stadium: 'Arrowhead Stadium', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos', 'Cuartos'] },
  { city: 'Boston', stadium: 'Gillette Stadium', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos', 'Cuartos'] },
  { city: 'Filadelfia', stadium: 'Lincoln Financial Field', stages: ['Fase de grupos', 'Dieciseisavos', 'Octavos'] }
]
