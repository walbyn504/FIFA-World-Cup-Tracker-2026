
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
  // Curazao
  { country: 'Curazao', club: 'Jong Colombia' },
  { country: 'Curazao', club: 'SV Centro Barber' },
  // Haití
  { country: 'Haití', club: 'Racing Club Haïtien' },
  { country: 'Haití', club: 'Violette AC' },
  // Panamá
  { country: 'Panamá', club: 'Tauro FC' },
  { country: 'Panamá', club: 'CD Plaza Amador' },
  { country: 'Panamá', club: 'San Francisco FC' },
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
  // Paraguay
  { country: 'Paraguay', club: 'Club Olimpia' },
  { country: 'Paraguay', club: 'Cerro Porteño' },
  { country: 'Paraguay', club: 'Club Libertad' },
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
  // Austria
  { country: 'Austria', club: 'FC Red Bull Salzburg' },
  { country: 'Austria', club: 'Rapid Wien' },
  { country: 'Austria', club: 'Austria Wien' },
  // Bélgica
  { country: 'Bélgica', club: 'RSC Anderlecht' },
  { country: 'Bélgica', club: 'Club Brugge' },
  { country: 'Bélgica', club: 'KRC Genk' },
  // Bosnia y Herzegovina
  { country: 'Bosnia y Herzegovina', club: 'FK Sarajevo' },
  { country: 'Bosnia y Herzegovina', club: 'FK Zeljeznicar' },
  { country: 'Bosnia y Herzegovina', club: 'FK Borac Banja Luka' },
  // Croacia
  { country: 'Croacia', club: 'Dinamo Zagreb' },
  { country: 'Croacia', club: 'Hajduk Split' },
  { country: 'Croacia', club: 'HNK Rijeka' },
  // Escocia
  { country: 'Escocia', club: 'Celtic FC' },
  { country: 'Escocia', club: 'Rangers FC' },
  { country: 'Escocia', club: 'Aberdeen FC' },
  // Inglaterra
  { country: 'Inglaterra', club: 'Manchester United' },
  { country: 'Inglaterra', club: 'Manchester City' },
  { country: 'Inglaterra', club: 'Liverpool FC' },
  { country: 'Inglaterra', club: 'Chelsea FC' },
  { country: 'Inglaterra', club: 'Arsenal FC' },
  { country: 'Inglaterra', club: 'Tottenham Hotspur' },
  // Noruega
  { country: 'Noruega', club: 'Rosenborg BK' },
  { country: 'Noruega', club: 'Molde FK' },
  { country: 'Noruega', club: 'Bodø/Glimt' },
  // Países Bajos
  { country: 'Países Bajos', club: 'Ajax' },
  { country: 'Países Bajos', club: 'PSV Eindhoven' },
  { country: 'Países Bajos', club: 'Feyenoord' },
  { country: 'Países Bajos', club: 'AZ Alkmaar' },
  // Portugal
  { country: 'Portugal', club: 'SL Benfica' },
  { country: 'Portugal', club: 'FC Porto' },
  { country: 'Portugal', club: 'Sporting CP' },
  { country: 'Portugal', club: 'SC Braga' },
  // República Checa
  { country: 'República Checa', club: 'Slavia Praga' },
  { country: 'República Checa', club: 'Sparta Praga' },
  { country: 'República Checa', club: 'Viktoria Plzeň' },
  // Suecia
  { country: 'Suecia', club: 'Malmö FF' },
  { country: 'Suecia', club: 'AIK' },
  { country: 'Suecia', club: 'IFK Göteborg' },
  // Suiza
  { country: 'Suiza', club: 'FC Basel' },
  { country: 'Suiza', club: 'BSC Young Boys' },
  { country: 'Suiza', club: 'FC Zürich' },
  // Turquía
  { country: 'Turquía', club: 'Galatasaray' },
  { country: 'Turquía', club: 'Fenerbahçe' },
  { country: 'Turquía', club: 'Beşiktaş' },
  { country: 'Turquía', club: 'Trabzonspor' },
  // Argelia
  { country: 'Argelia', club: 'CR Belouizdad' },
  { country: 'Argelia', club: 'ES Sétif' },
  { country: 'Argelia', club: 'USM Alger' },
  // Cabo Verde
  { country: 'Cabo Verde', club: 'Sporting Clube da Praia' },
  { country: 'Cabo Verde', club: 'CD Travadores' },
  // Costa de Marfil
  { country: 'Costa de Marfil', club: 'ASEC Mimosas' },
  { country: 'Costa de Marfil', club: 'Africa Sports' },
  { country: 'Costa de Marfil', club: 'Stade d\'Abidjan' },
  // Egipto
  { country: 'Egipto', club: 'Al Ahly' },
  { country: 'Egipto', club: 'Zamalek SC' },
  { country: 'Egipto', club: 'Pyramids FC' },
  // Ghana
  { country: 'Ghana', club: 'Asante Kotoko' },
  { country: 'Ghana', club: 'Hearts of Oak' },
  { country: 'Ghana', club: 'Aduana Stars' },
  // Marruecos
  { country: 'Marruecos', club: 'Raja Casablanca' },
  { country: 'Marruecos', club: 'Wydad Casablanca' },
  { country: 'Marruecos', club: 'FAR Rabat' },
  // RD del Congo
  { country: 'RD del Congo', club: 'TP Mazembe' },
  { country: 'RD del Congo', club: 'AS Vita Club' },
  { country: 'RD del Congo', club: 'DC Motema Pembe' },
  // Senegal
  { country: 'Senegal', club: 'Génération Foot' },
  { country: 'Senegal', club: 'Casa Sports' },
  { country: 'Senegal', club: 'Jaraaf' },
  // Sudáfrica
  { country: 'Sudáfrica', club: 'Kaizer Chiefs' },
  { country: 'Sudáfrica', club: 'Orlando Pirates' },
  { country: 'Sudáfrica', club: 'Mamelodi Sundowns' },
  // Túnez
  { country: 'Túnez', club: 'Espérance de Tunis' },
  { country: 'Túnez', club: 'Étoile du Sahel' },
  { country: 'Túnez', club: 'Club Africain' },
  // Arabia Saudita
  { country: 'Arabia Saudita', club: 'Al-Hilal' },
  { country: 'Arabia Saudita', club: 'Al-Nassr' },
  { country: 'Arabia Saudita', club: 'Al-Ittihad' },
  { country: 'Arabia Saudita', club: 'Al-Ahli' },
  // Australia
  { country: 'Australia', club: 'Sydney FC' },
  { country: 'Australia', club: 'Melbourne Victory' },
  { country: 'Australia', club: 'Melbourne City' },
  // Catar
  { country: 'Catar', club: 'Al-Sadd' },
  { country: 'Catar', club: 'Al-Duhail' },
  { country: 'Catar', club: 'Al-Rayyan' },
  // Corea del Sur
  { country: 'Corea del Sur', club: 'Jeonbuk Hyundai Motors' },
  { country: 'Corea del Sur', club: 'FC Seoul' },
  { country: 'Corea del Sur', club: 'Ulsan HD' },
  // Irak
  { country: 'Irak', club: 'Al-Quwa Al-Jawiya' },
  { country: 'Irak', club: 'Al-Zawraa' },
  { country: 'Irak', club: 'Al-Shorta' },
  // Irán
  { country: 'Irán', club: 'Persepolis FC' },
  { country: 'Irán', club: 'Esteghlal FC' },
  { country: 'Irán', club: 'Sepahan SC' },
  // Japón
  { country: 'Japón', club: 'Kashima Antlers' },
  { country: 'Japón', club: 'Urawa Red Diamonds' },
  { country: 'Japón', club: 'Yokohama F. Marinos' },
  { country: 'Japón', club: 'Vissel Kobe' },
  // Jordania
  { country: 'Jordania', club: 'Al-Faisaly' },
  { country: 'Jordania', club: 'Al-Wehdat' },
  { country: 'Jordania', club: 'Al-Ramtha' },
  // Uzbekistán
  { country: 'Uzbekistán', club: 'Pakhtakor Tashkent' },
  { country: 'Uzbekistán', club: 'Bunyodkor' },
  { country: 'Uzbekistán', club: 'Nasaf Qarshi' },
  // Nueva Zelanda
  { country: 'Nueva Zelanda', club: 'Auckland City FC' },
  { country: 'Nueva Zelanda', club: 'Wellington Phoenix' },
  { country: 'Nueva Zelanda', club: 'Team Wellington' }
]

export const clubNames: string[] = clubCatalog.map((c) => c.club)