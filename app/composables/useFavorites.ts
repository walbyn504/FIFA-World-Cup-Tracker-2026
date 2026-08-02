import { doc, getDoc, updateDoc } from 'firebase/firestore'


export const useFavorites = () => {
  const { $firestore } = useNuxtApp()
  const authStore = useAuthStore()

  const getFavorites = async () => {
    if (!authStore.user) return null

    const userRef = doc($firestore, 'users', authStore.user.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) return null

    return snap.data()
  }

  // Alterna el estado de favorito de un equipo para el usuario autenticado
  const toggleFavoriteTeam = async (teamId: string) => {
    if (!authStore.user) return

    const userRef = doc($firestore, 'users', authStore.user.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) return

    const data = snap.data()

    const favoriteTeams: string[] = data.favoriteTeams ?? []

    const updatedFavorites = favoriteTeams.includes(teamId)
      ? favoriteTeams.filter(id => id !== teamId)
      : [...favoriteTeams, teamId]

    await updateDoc(userRef, {
      favoriteTeams: updatedFavorites
    })

    authStore.setUser({
      ...authStore.user,
      favoriteTeams: updatedFavorites
    })
  }

  //
  const toggleFavoriteMatch = async (matchId: string) => {
    if (!authStore.user) return

    const userRef = doc($firestore, 'users', authStore.user.uid)
    const snap = await getDoc(userRef)

    if (!snap.exists()) return

    const data = snap.data()

    const favoriteMatches: string[] = data.favoriteMatches ?? []

    const updatedFavorites = favoriteMatches.includes(matchId)
      ? favoriteMatches.filter(id => id !== matchId)
      : [...favoriteMatches, matchId]

    await updateDoc(userRef, {
      favoriteMatches: updatedFavorites
    })

    authStore.setUser({
      ...authStore.user,
      favoriteMatches: updatedFavorites
    })
  }

  // Comprueba si un equipo es favorito del usuario autenticado
  const isFavoriteTeam = (teamId: string) => {
    if (!authStore.user) return false

    return authStore.user.favoriteTeams.includes(teamId)
  }

  // Comprueba si un partido es favorito del usuario autenticado
  const isFavoriteMatch = (matchId: string) => {
    if (!authStore.user) return false

    return authStore.user.favoriteMatches.includes(matchId)
  }

  // Devuelve los ids de equipos y partidos favoritos del usuario autenticado
  const favoriteTeamIds = computed(() => authStore.user?.favoriteTeams ?? [])
  const favoriteMatchIds = computed(() => authStore.user?.favoriteMatches ?? [])

  return {
    getFavorites,
    toggleFavoriteTeam,
    toggleFavoriteMatch,
    isFavoriteTeam,
    isFavoriteMatch,
    favoriteTeamIds,
    favoriteMatchIds
  }
}