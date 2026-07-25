export interface WorldCupTeamPreset {
  name: string
  confederation: string
  flag: string
}

export const worldCupTeams: WorldCupTeamPreset[] = [
  // CONMEBOL (6)
  { name: 'Argentina', confederation: 'CONMEBOL', flag: 'https://flagcdn.com/w320/ar.png' },
  { name: 'Brasil', confederation: 'CONMEBOL', flag: 'https://flagcdn.com/w320/br.png' },
  { name: 'Colombia', confederation: 'CONMEBOL', flag: 'https://flagcdn.com/w320/co.png' },
  { name: 'Ecuador', confederation: 'CONMEBOL', flag: 'https://flagcdn.com/w320/ec.png' },
  { name: 'Paraguay', confederation: 'CONMEBOL', flag: 'https://flagcdn.com/w320/py.png' },
  { name: 'Uruguay', confederation: 'CONMEBOL', flag: 'https://flagcdn.com/w320/uy.png' },

  // UEFA (16)
  { name: 'Alemania', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/de.png' },
  { name: 'Austria', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/at.png' },
  { name: 'Bélgica', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/be.png' },
  { name: 'Bosnia y Herzegovina', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/ba.png' },
  { name: 'Croacia', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/hr.png' },
  { name: 'España', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/es.png' },
  { name: 'Escocia', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/gb-sct.png' },
  { name: 'Francia', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/fr.png' },
  { name: 'Países Bajos', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/nl.png' },
  { name: 'Noruega', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/no.png' },
  { name: 'Portugal', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/pt.png' },
  { name: 'República Checa', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/cz.png' },
  { name: 'Suecia', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/se.png' },
  { name: 'Suiza', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/ch.png' },
  { name: 'Turquía', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/tr.png' },
  { name: 'Inglaterra', confederation: 'UEFA', flag: 'https://flagcdn.com/w320/gb-eng.png' },

  // CAF (10)
  { name: 'Argelia', confederation: 'CAF', flag: 'https://flagcdn.com/w320/dz.png' },
  { name: 'Cabo Verde', confederation: 'CAF', flag: 'https://flagcdn.com/w320/cv.png' },
  { name: 'Costa de Marfil', confederation: 'CAF', flag: 'https://flagcdn.com/w320/ci.png' },
  { name: 'Egipto', confederation: 'CAF', flag: 'https://flagcdn.com/w320/eg.png' },
  { name: 'Ghana', confederation: 'CAF', flag: 'https://flagcdn.com/w320/gh.png' },
  { name: 'Marruecos', confederation: 'CAF', flag: 'https://flagcdn.com/w320/ma.png' },
  { name: 'RD del Congo', confederation: 'CAF', flag: 'https://flagcdn.com/w320/cd.png' },
  { name: 'Senegal', confederation: 'CAF', flag: 'https://flagcdn.com/w320/sn.png' },
  { name: 'Sudáfrica', confederation: 'CAF', flag: 'https://flagcdn.com/w320/za.png' },
  { name: 'Túnez', confederation: 'CAF', flag: 'https://flagcdn.com/w320/tn.png' },

  // AFC (9)
  { name: 'Arabia Saudita', confederation: 'AFC', flag: 'https://flagcdn.com/w320/sa.png' },
  { name: 'Australia', confederation: 'AFC', flag: 'https://flagcdn.com/w320/au.png' },
  { name: 'Catar', confederation: 'AFC', flag: 'https://flagcdn.com/w320/qa.png' },
  { name: 'Corea del Sur', confederation: 'AFC', flag: 'https://flagcdn.com/w320/kr.png' },
  { name: 'Irak', confederation: 'AFC', flag: 'https://flagcdn.com/w320/iq.png' },
  { name: 'Irán', confederation: 'AFC', flag: 'https://flagcdn.com/w320/ir.png' },
  { name: 'Japón', confederation: 'AFC', flag: 'https://flagcdn.com/w320/jp.png' },
  { name: 'Jordania', confederation: 'AFC', flag: 'https://flagcdn.com/w320/jo.png' },
  { name: 'Uzbekistán', confederation: 'AFC', flag: 'https://flagcdn.com/w320/uz.png' },

  // CONCACAF (6, incluye anfitriones)
  { name: 'Canadá', confederation: 'CONCACAF', flag: 'https://flagcdn.com/w320/ca.png' },
  { name: 'Curazao', confederation: 'CONCACAF', flag: 'https://flagcdn.com/w320/cw.png' },
  { name: 'Estados Unidos', confederation: 'CONCACAF', flag: 'https://flagcdn.com/w320/us.png' },
  { name: 'Haití', confederation: 'CONCACAF', flag: 'https://flagcdn.com/w320/ht.png' },
  { name: 'México', confederation: 'CONCACAF', flag: 'https://flagcdn.com/w320/mx.png' },
  { name: 'Panamá', confederation: 'CONCACAF', flag: 'https://flagcdn.com/w320/pa.png' },

  // OFC (1)
  { name: 'Nueva Zelanda', confederation: 'OFC', flag: 'https://flagcdn.com/w320/nz.png' }
]