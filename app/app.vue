<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const { getAllMatches } = useMatches()
const { getPredictionsByUser } = usePredictions()
const { warning } = useNotify()

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

// Verifica si hay partidos próximos a iniciar sin predicción del usuario
const checkUpcomingMatches = async () => {
  if (!authStore.user) return

  try {
    const [matches, predictions] = await Promise.all([
      getAllMatches(),
      getPredictionsByUser(authStore.user.uid)
    ])

    const predictedMatchIds = new Set(predictions.map((p) => p.matchId))
    const now = Date.now()

    for (const match of matches) {
      const msUntilKickoff = match.kickoff.toMillis() - now
      if (
        match.status === 'scheduled' &&
        msUntilKickoff > 0 &&
        msUntilKickoff <= TWO_HOURS_MS &&
        !predictedMatchIds.has(match.id)
      ) {
        warning(
          `${match.homeTeam} vs ${match.awayTeam} empieza en menos de 2 horas y todavía no hiciste tu predicción.`,
          '¡Hacé tu predicción!',
          8000
        )
      }
    }
  } catch {
    warning('No se pudieron verificar los partidos próximos.')
  }
}

// Intervalo para verificar partidos próximos cada 5 minutos
let checkInterval: ReturnType<typeof setInterval> | undefined

watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) checkUpcomingMatches()
}, { immediate: true })

onMounted(() => {
  checkInterval = setInterval(() => {
    if (authStore.isLoggedIn) checkUpcomingMatches()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (checkInterval) clearInterval(checkInterval)
})
</script>