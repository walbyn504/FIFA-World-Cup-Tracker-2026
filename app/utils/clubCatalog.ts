// Catálogo de clubes conocidos por país (de las selecciones que ya maneja la app, ver worldCupTeams.ts).
// Se usa para sugerir clubes en el autocomplete del formulario de jugadores.
export interface ClubCatalogEntry {
  country: string
  club: string
}

export const clubCatalog: ClubCatalogEntry[] = [
  // Canadá
  { country: 'Canadá', club: 'Toronto FC' },
  { country: 'Canadá', club: 'Vancouver Whitecaps' },
  { country: 'Canadá', club: 'CF Montréal' },
  // México
  { country: 'México', club: 'Club América' },
  { country: 'México', club: 'Chivas Guadalajara' },
  { country: 'México', club: 'Cruz Azul' },
  { country: 'México', club: 'Tigres UANL' },
  { country: 'México', club: 'Rayados de Monterrey' },
  // Estados Unidos
  { country: 'Estados Unidos', club: 'LA Galaxy' },
  { country: 'Estados Unidos', club: 'Seattle Sounders' },
  { country: 'Estados Unidos', club: 'Inter Miami' },
  { country: 'Estados Unidos', club: 'LAFC' },
  { country: 'Estados Unidos', club: 'Atlanta United' },
  // Costa Rica
  { country: 'Costa Rica', club: 'Deportivo Saprissa' },
  { country: 'Costa Rica', club: 'LD Alajuelense' },
  { country: 'Costa Rica', club: 'CS Herediano' },
  { country: 'Costa Rica', club: 'San Carlos' },
  { country: 'Costa Rica', club: 'Liberia' },
  { country: 'Costa Rica', club: 'CS Cartagines' },
  // Argentina
  { country: 'Argentina', club: 'Boca Juniors' },
  { country: 'Argentina', club: 'River Plate' },
  { country: 'Argentina', club: 'Racing Club' },
  { country: 'Argentina', club: 'San Lorenzo' },
  { country: 'Argentina', club: 'Independiente' },
  // Brasil
  { country: 'Brasil', club: 'Flamengo' },
  { country: 'Brasil', club: 'Palmeiras' },
  { country: 'Brasil', club: 'São Paulo' },
  { country: 'Brasil', club: 'Corinthians' },
  { country: 'Brasil', club: 'Santos' },
  // Uruguay
  { country: 'Uruguay', club: 'Peñarol' },
  { country: 'Uruguay', club: 'Nacional' },
  { country: 'Uruguay', club: 'Defensor Sporting' },
  // Colombia
  { country: 'Colombia', club: 'Millonarios' },
  { country: 'Colombia', club: 'Atlético Nacional' },
  { country: 'Colombia', club: 'América de Cali' },
  { country: 'Colombia', club: 'Independiente Santa Fe' },
  // Ecuador
  { country: 'Ecuador', club: 'Barcelona SC' },
  { country: 'Ecuador', club: 'Club Sport Emelec' },
  { country: 'Ecuador', club: 'LDU Quito' },
  // España
  { country: 'España', club: 'Real Madrid' },
  { country: 'España', club: 'FC Barcelona' },
  { country: 'España', club: 'Atlético de Madrid' },
  { country: 'España', club: 'Sevilla FC' },
  { country: 'España', club: 'Valencia CF' },
  // Francia
  { country: 'Francia', club: 'Paris Saint-Germain' },
  { country: 'Francia', club: 'Olympique de Marsella' },
  { country: 'Francia', club: 'Olympique de Lyon' },
  { country: 'Francia', club: 'AS Mónaco' },
  { country: 'Francia', club: 'LOSC Lille' },
  // Alemania
  { country: 'Alemania', club: 'Bayern Múnich' },
  { country: 'Alemania', club: 'Borussia Dortmund' },
  { country: 'Alemania', club: 'RB Leipzig' },
  { country: 'Alemania', club: 'Bayer Leverkusen' },
  // Inglaterra
  { country: 'Inglaterra', club: 'Manchester United' },
  { country: 'Inglaterra', club: 'Manchester City' },
  { country: 'Inglaterra', club: 'Liverpool FC' },
  { country: 'Inglaterra', club: 'Chelsea FC' },
  { country: 'Inglaterra', club: 'Arsenal FC' },
  { country: 'Inglaterra', club: 'Tottenham Hotspur' },
  // Portugal
  { country: 'Portugal', club: 'SL Benfica' },
  { country: 'Portugal', club: 'FC Porto' },
  { country: 'Portugal', club: 'Sporting CP' },
  { country: 'Portugal', club: 'SC Braga' },
  // Países Bajos
  { country: 'Países Bajos', club: 'Ajax' },
  { country: 'Países Bajos', club: 'PSV Eindhoven' },
  { country: 'Países Bajos', club: 'Feyenoord' },
  { country: 'Países Bajos', club: 'AZ Alkmaar' },
  // Bélgica
  { country: 'Bélgica', club: 'RSC Anderlecht' },
  { country: 'Bélgica', club: 'Club Brugge' },
  { country: 'Bélgica', club: 'KRC Genk' },
  // Italia
  { country: 'Italia', club: 'Juventus' },
  { country: 'Italia', club: 'Inter de Milán' },
  { country: 'Italia', club: 'AC Milan' },
  { country: 'Italia', club: 'Napoli' },
  { country: 'Italia', club: 'AS Roma' },
  // Croacia
  { country: 'Croacia', club: 'Dinamo Zagreb' },
  { country: 'Croacia', club: 'Hajduk Split' },
  { country: 'Croacia', club: 'HNK Rijeka' },
  // Japón
  { country: 'Japón', club: 'Kashima Antlers' },
  { country: 'Japón', club: 'Urawa Red Diamonds' },
  { country: 'Japón', club: 'Yokohama F. Marinos' },
  { country: 'Japón', club: 'Vissel Kobe' },
  // Corea del Sur
  { country: 'Corea del Sur', club: 'Jeonbuk Hyundai Motors' },
  { country: 'Corea del Sur', club: 'FC Seoul' },
  { country: 'Corea del Sur', club: 'Ulsan HD' },
  // Irán
  { country: 'Irán', club: 'Persepolis FC' },
  { country: 'Irán', club: 'Esteghlal FC' },
  { country: 'Irán', club: 'Sepahan SC' },
  // Arabia Saudita
  { country: 'Arabia Saudita', club: 'Al-Hilal' },
  { country: 'Arabia Saudita', club: 'Al-Nassr' },
  { country: 'Arabia Saudita', club: 'Al-Ittihad' },
  { country: 'Arabia Saudita', club: 'Al-Ahli' },
  // Australia
  { country: 'Australia', club: 'Sydney FC' },
  { country: 'Australia', club: 'Melbourne Victory' },
  { country: 'Australia', club: 'Melbourne City' },
  // Marruecos
  { country: 'Marruecos', club: 'Raja Casablanca' },
  { country: 'Marruecos', club: 'Wydad Casablanca' },
  { country: 'Marruecos', club: 'FAR Rabat' },
  // Senegal
  { country: 'Senegal', club: 'Génération Foot' },
  { country: 'Senegal', club: 'Casa Sports' },
  { country: 'Senegal', club: 'Jaraaf' },
  // Nigeria
  { country: 'Nigeria', club: 'Enyimba FC' },
  { country: 'Nigeria', club: 'Kano Pillars' },
  { country: 'Nigeria', club: 'Rangers International' },
  // Egipto
  { country: 'Egipto', club: 'Al Ahly' },
  { country: 'Egipto', club: 'Zamalek SC' },
  { country: 'Egipto', club: 'Pyramids FC' },
  // Ghana
  { country: 'Ghana', club: 'Asante Kotoko' },
  { country: 'Ghana', club: 'Hearts of Oak' },
  { country: 'Ghana', club: 'Aduana Stars' },
  // Nueva Zelanda
  { country: 'Nueva Zelanda', club: 'Auckland City FC' },
  { country: 'Nueva Zelanda', club: 'Wellington Phoenix' },
  { country: 'Nueva Zelanda', club: 'Team Wellington' }
]

export const clubNames: string[] = clubCatalog.map((c) => c.club)
