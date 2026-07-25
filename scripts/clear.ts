// Borra los datos sembrados por scripts/seed.ts (equipos, jugadores y partidos)
// para poder volver a correr el seed sin duplicar documentos.
// No toca 'users' ni 'predictions' porque no son datos de seed.
//
// Requiere la misma clave de servicio que seed.ts (scripts/serviceAccountKey.json).
// Uso: npm run seed:clear

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const seedCollections = ['teams', 'players', 'matches']

async function clearCollection(name: string) {
  const snapshot = await db.collection(name).get()

  if (snapshot.empty) {
    console.log(`  ${name}: ya estaba vacía`)
    return
  }

  const docs = snapshot.docs
  const batchSize = 400

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch()
    docs.slice(i, i + batchSize).forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
  }

  console.log(`  ${name}: ${docs.length} documentos borrados`)
}

async function clear() {
  console.log('Borrando datos sembrados (teams, players, matches)...')
  for (const name of seedCollections) {
    await clearCollection(name)
  }
  console.log('\nListo. Ya podés correr "npm run seed" de nuevo.')
}

clear()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error al borrar los datos:', err)
    process.exit(1)
  })
