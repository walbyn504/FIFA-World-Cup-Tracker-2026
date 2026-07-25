<template>
  <div
    class="relative min-h-screen bg-cover bg-center px-6 py-10 text-[#F5F0E6]"
    style="background-image: url('/trofeo-mundial.png')"
  >
    <div class="absolute inset-0 bg-black/50" />

    <div class="relative z-10 mx-auto max-w-[1500px]">
      <div class="mb-2 flex items-center justify-between gap-3">
        <h1 class="font-['Bebas_Neue'] text-4xl tracking-wide text-[#F5F0E6]">Llaves eliminatorias</h1>
        <UiRefreshButton :loading="isLoading" @click="loadBracket" />
      </div>
      <p class="mb-8 text-xs text-white/50">
        Dieciseisavos no aplica en este formato de 32 equipos — el primer cruce eliminatorio es Octavos.
      </p>

      <UiGlassCard v-if="isLoading" class="w-full">
        <p class="text-white/60">Cargando llaves...</p>
      </UiGlassCard>

      <UiGlassCard v-else-if="hasError" class="w-full">
        <p class="text-red-300">No se pudo cargar el bracket.</p>
        <button class="mt-3 rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#04140D]" @click="loadBracket">
          Reintentar
        </button>
      </UiGlassCard>

      <div v-else class="overflow-x-auto pb-8">
        <div class="relative" :style="{ width: `${totalWidth}px`, height: `${treeHeight}px`, minWidth: '100%' }">
          <svg
            class="pointer-events-none absolute inset-0"
            :width="totalWidth"
            :height="treeHeight"
          >
            <path
              v-for="(d, idx) in connectorPaths"
              :key="idx"
              :d="d"
              fill="none"
              stroke="#D4AF37"
              stroke-width="2"
              opacity="0.75"
            />
          </svg>

          <div
            v-for="node in matchNodes"
            :key="node.key"
            class="absolute flex flex-col justify-center gap-1 rounded-xl border border-[#D4AF37]/40 bg-[#04140D]/80 px-3 py-2 shadow-lg backdrop-blur-sm"
            :style="{ left: `${node.x}px`, top: `${node.y}px`, width: `${cardWidth}px`, height: `${cardHeight}px` }"
          >
            <span class="absolute -top-4 left-1 text-[9px] uppercase tracking-wide text-[#D4AF37]/70">{{ node.label }}</span>

            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="flex min-w-0 items-center gap-1.5">
                <img v-if="flagOf(node.homeTeam)" :src="flagOf(node.homeTeam)" class="h-3.5 w-5 shrink-0 rounded-sm object-cover" :alt="node.homeTeam ?? ''">
                <span class="truncate" :class="isWinner(node, 'home') ? 'font-semibold text-[#D4AF37]' : 'text-white/85'">
                  {{ node.homeTeam ?? 'Por definir' }}
                </span>
              </span>
              <span v-if="node.status && node.status !== 'scheduled'" class="shrink-0 font-semibold text-white">{{ node.homeScore }}</span>
            </div>

            <div class="flex items-center justify-between gap-2 text-xs">
              <span class="flex min-w-0 items-center gap-1.5">
                <img v-if="flagOf(node.awayTeam)" :src="flagOf(node.awayTeam)" class="h-3.5 w-5 shrink-0 rounded-sm object-cover" :alt="node.awayTeam ?? ''">
                <span class="truncate" :class="isWinner(node, 'away') ? 'font-semibold text-[#D4AF37]' : 'text-white/85'">
                  {{ node.awayTeam ?? 'Por definir' }}
                </span>
              </span>
              <span v-if="node.status && node.status !== 'scheduled'" class="shrink-0 font-semibold text-white">{{ node.awayScore }}</span>
            </div>
          </div>

          <div
            class="absolute flex flex-col items-center gap-3"
            :style="{ left: `${finalX}px`, top: `${finalNodeTop}px`, width: `${finalWidth}px` }"
          >
            <h2 class="font-['Bebas_Neue'] text-2xl tracking-widest text-[#D4AF37]">Final</h2>

            <div
              class="flex w-full flex-col justify-center gap-1.5 rounded-xl border-2 border-[#D4AF37] bg-[#04140D]/90 px-4 py-3 shadow-xl"
            >
              <div class="flex items-center justify-between gap-2 text-sm">
                <span class="flex min-w-0 items-center gap-2">
                  <img v-if="flagOf(finalNode.homeTeam)" :src="flagOf(finalNode.homeTeam)" class="h-4 w-6 shrink-0 rounded-sm object-cover" :alt="finalNode.homeTeam ?? ''">
                  <span class="truncate" :class="isWinner(finalNode, 'home') ? 'font-semibold text-[#D4AF37]' : 'text-white/90'">
                    {{ finalNode.homeTeam ?? 'Por definir' }}
                  </span>
                </span>
                <span v-if="finalNode.status && finalNode.status !== 'scheduled'" class="font-semibold text-white">{{ finalNode.homeScore }}</span>
              </div>
              <div class="flex items-center justify-between gap-2 text-sm">
                <span class="flex min-w-0 items-center gap-2">
                  <img v-if="flagOf(finalNode.awayTeam)" :src="flagOf(finalNode.awayTeam)" class="h-4 w-6 shrink-0 rounded-sm object-cover" :alt="finalNode.awayTeam ?? ''">
                  <span class="truncate" :class="isWinner(finalNode, 'away') ? 'font-semibold text-[#D4AF37]' : 'text-white/90'">
                    {{ finalNode.awayTeam ?? 'Por definir' }}
                  </span>
                </span>
                <span v-if="finalNode.status && finalNode.status !== 'scheduled'" class="font-semibold text-white">{{ finalNode.awayScore }}</span>
              </div>
            </div>

            <div class="mt-4 flex w-full flex-col items-center gap-2">
              <h3 class="text-xs uppercase tracking-widest text-white/50">Tercer lugar</h3>
              <div class="flex w-full flex-col justify-center gap-1 rounded-lg border border-white/15 bg-[#04140D]/70 px-3 py-2 text-xs">
                <div class="flex items-center justify-between gap-2">
                  <span class="flex min-w-0 items-center gap-1.5">
                    <img v-if="flagOf(thirdNode.homeTeam)" :src="flagOf(thirdNode.homeTeam)" class="h-3.5 w-5 shrink-0 rounded-sm object-cover" :alt="thirdNode.homeTeam ?? ''">
                    <span class="truncate text-white/80">{{ thirdNode.homeTeam ?? 'Por definir' }}</span>
                  </span>
                  <span v-if="thirdNode.status && thirdNode.status !== 'scheduled'" class="font-semibold text-white/80">{{ thirdNode.homeScore }}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="flex min-w-0 items-center gap-1.5">
                    <img v-if="flagOf(thirdNode.awayTeam)" :src="flagOf(thirdNode.awayTeam)" class="h-3.5 w-5 shrink-0 rounded-sm object-cover" :alt="thirdNode.awayTeam ?? ''">
                    <span class="truncate text-white/80">{{ thirdNode.awayTeam ?? 'Por definir' }}</span>
                  </span>
                  <span v-if="thirdNode.status && thirdNode.status !== 'scheduled'" class="font-semibold text-white/80">{{ thirdNode.awayScore }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Match } from '~~/shared/types/match'

interface SlotMatch {
  homeTeam: string | null
  awayTeam: string | null
  homeScore?: number
  awayScore?: number
  status?: Match['status']
}

interface MatchNode extends SlotMatch {
  key: string
  label: string
  x: number
  y: number
}

const { getBracket, generateBracket } = useBracket()
const { getAllTeams } = useTeams()
const { success } = useNotify()

const isLoading = ref(true)
const hasError = ref(false)
const flagByName = ref<Record<string, string>>({})
const rawRounds = ref<{ stage: string, matches: (Match & { id: string })[] }[]>([])

// --- Geometría del árbol de llaves (todo en píxeles, calculado en runtime) ---
const cardWidth = 190
const cardHeight = 60
const gapV = 18
const connectorW = 36
const finalWidth = 220

const SIDE_STAGES = ['Octavos', 'Cuartos', 'Semifinal']
const SIDE_COUNTS = [4, 2, 1]

const unit = (round: number) => (cardHeight + gapV) * 2 ** round
const centerY = (round: number, index: number) => index * unit(round) + unit(round) / 2

const treeHeight = computed(() => unit(0) * SIDE_COUNTS[0]!)

const xLeft = (round: number) => round * (cardWidth + connectorW)
const leftEdgeX = xLeft(SIDE_COUNTS.length - 1) + cardWidth
const finalX = computed(() => leftEdgeX + connectorW)
const rightInnerX = computed(() => finalX.value + finalWidth + connectorW)
const xRight = (round: number) => rightInnerX.value + (SIDE_COUNTS.length - 1 - round) * (cardWidth + connectorW)

const totalWidth = computed(() => xRight(0) + cardWidth)
const finalNodeTop = computed(() => centerY(SIDE_COUNTS.length - 1, 0) - 20)

// Recorta/rellena una lista de partidos a un tamaño fijo de slots (null = todavía sin definir)
const fillSlots = (matches: (Match & { id: string })[], count: number): (Match & { id: string } | null)[] => {
  const sorted = [...matches].sort((a, b) => a.kickoff.toMillis() - b.kickoff.toMillis())
  return Array.from({ length: count }, (_, i) => sorted[i] ?? null)
}

const matchesByStage = computed(() => {
  const map: Record<string, (Match & { id: string })[]> = {}
  for (const round of rawRounds.value) map[round.stage] = round.matches
  return map
})

const buildSideNodes = (side: 'left' | 'right'): MatchNode[] => {
  const xOf = side === 'left' ? xLeft : xRight
  const nodes: MatchNode[] = []

  SIDE_STAGES.forEach((stage, round) => {
    const total = SIDE_COUNTS[round]! * 2
    const slots = fillSlots(matchesByStage.value[stage] ?? [], total)
    const half = side === 'left' ? slots.slice(0, total / 2) : slots.slice(total / 2, total)

    half.forEach((match, i) => {
      nodes.push({
        key: `${side}-${stage}-${i}`,
        label: stage,
        x: xOf(round),
        y: centerY(round, i),
        homeTeam: match?.homeTeam ?? null,
        awayTeam: match?.awayTeam ?? null,
        homeScore: match?.homeScore,
        awayScore: match?.awayScore,
        status: match?.status
      })
    })
  })

  return nodes
}

const matchNodes = computed<MatchNode[]>(() => [...buildSideNodes('left'), ...buildSideNodes('right')])

const emptySlot = (): SlotMatch => ({ homeTeam: null, awayTeam: null })

const finalNode = computed<SlotMatch>(() => {
  const [match] = fillSlots(matchesByStage.value.Final ?? [], 1)
  return match ?? emptySlot()
})

const thirdNode = computed<SlotMatch>(() => {
  const [match] = fillSlots(matchesByStage.value['Tercer lugar'] ?? [], 1)
  return match ?? emptySlot()
})

// Conecta cada par de partidos de una ronda con el partido que generan en la siguiente
const buildSideConnectors = (side: 'left' | 'right'): string[] => {
  const xOf = side === 'left' ? xLeft : xRight
  const mirrored = side === 'right'
  const paths: string[] = []

  for (let round = 0; round < SIDE_COUNTS.length - 1; round++) {
    const count = SIDE_COUNTS[round]! * 2
    for (let i = 0; i < count; i += 2) {
      const y1 = centerY(round, i)
      const y2 = centerY(round, i + 1)
      const yMid = centerY(round + 1, i / 2)
      const xCard = xOf(round)
      const xNext = xOf(round + 1)

      const xStart = mirrored ? xCard : xCard + cardWidth
      const xMid = mirrored ? xCard - connectorW / 2 : xCard + cardWidth + connectorW / 2
      const xEnd = mirrored ? xNext + cardWidth : xNext

      paths.push(`M ${xStart} ${y1} H ${xMid} V ${y2} H ${xStart}`)
      paths.push(`M ${xMid} ${yMid} H ${xEnd}`)
    }
  }

  return paths
}

const buildFinalConnectors = (): string[] => {
  const lastRound = SIDE_COUNTS.length - 1
  const y = centerY(lastRound, 0)
  const leftStart = xLeft(lastRound) + cardWidth
  const rightStart = xRight(lastRound)
  const finalY = finalNodeTop.value + 20

  return [
    `M ${leftStart} ${y} H ${finalX.value} V ${finalY}`,
    `M ${rightStart} ${y} H ${finalX.value + finalWidth} V ${finalY}`
  ]
}

const connectorPaths = computed(() => [
  ...buildSideConnectors('left'),
  ...buildSideConnectors('right'),
  ...buildFinalConnectors()
])

const flagOf = (teamName: string | null | undefined): string | undefined => {
  if (!teamName) return undefined
  return flagByName.value[teamName]
}

const isWinner = (match: SlotMatch, side: 'home' | 'away'): boolean => {
  if (match.status !== 'finished' || match.homeScore === undefined || match.awayScore === undefined) return false
  return side === 'home' ? match.homeScore > match.awayScore : match.awayScore > match.homeScore
}

const loadBracket = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    const messages = await generateBracket()
    const relevant = messages.filter((m) => m && !m.includes('ya estaba generado'))
    if (relevant.length > 0) success(relevant.join(' '))

    const [rounds, teams] = await Promise.all([getBracket(), getAllTeams()])
    rawRounds.value = rounds
    flagByName.value = Object.fromEntries(teams.map((t) => [t.name, t.flag]))
  } catch (error) {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(loadBracket)
</script>
