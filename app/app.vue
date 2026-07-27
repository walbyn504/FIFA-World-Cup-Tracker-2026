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

// Avisa de partidos programados que arrancan en menos de 2 horas y todavía no
// tienen predicción propia. Se repite en cada chequeo (no queda guardado como
// "ya avisado") para no depender de que se vea el toast justo en el momento
// en que aparece.
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
    // Es un aviso secundario: si falla, no debería interrumpir el resto de la app
  }
}

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