<template>
  <div
    class="relative h-screen w-screen overflow-hidden p-6 text-[#F5F0E6] select-none flex flex-col justify-between"
    style="background-image: url('/trofeo-mundial.png'); background-size: cover; background-position: center;"
  >
    <div class="absolute inset-0 bg-black/60" />

    <div class="relative z-10 mx-auto w-full h-full flex flex-col">
      <!-- Encabezado compacto -->
      <div class="mb-1 flex shrink-0 items-center justify-between gap-3">
        <h1 class="font-['Bebas_Neue'] text-4xl tracking-wide text-[#F5F0E6]">Llaves eliminatorias</h1>
        <UiRefreshButton :loading="isLoading" @click="loadBracket" />
      </div>

      <UiGlassCard v-if="isLoading" class="w-full flex-1 flex items-center justify-center">
        <p class="text-white/60">Cargando llaves...</p>
      </UiGlassCard>

      <UiGlassCard v-else-if="hasError" class="w-full flex-1 flex flex-col items-center justify-center">
        <p class="text-red-300">No se pudo cargar el bracket.</p>
        <button class="mt-3 rounded-xl bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#04140D]" @click="loadBracket">
          Reintentar
        </button>
      </UiGlassCard>

      <!-- CONTENEDOR CONTRA EL SCROLL -->
      <div v-else class="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <div
          class="origin-center relative shrink-0 transition-transform duration-200"
          :style="{ 
            width: `${totalWidth}px`, 
            height: `${treeHeight}px`,
            transform: `scale(min(calc(96vw / ${totalWidth}), calc(78vh / ${treeHeight})))`
          }"
        >
          <!-- CONECTORES SVG CORREGIDOS -->
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
              stroke-width="1.5"
              opacity="0.5"
            />
          </svg>

          <!-- LLAVES LATERALES -->
          <div
            v-for="node in matchNodes"
            :key="node.key"
            class="absolute flex flex-col justify-center gap-1 rounded-xl border border-[#D4AF37]/30 bg-[#04140D]/85 px-2.5 py-1.5 shadow-lg backdrop-blur-sm overflow-hidden"
            :style="{ left: `${node.x}px`, top: `${node.y}px`, width: `${cardWidth}px`, height: `${cardHeight}px` }"
          >
            <span class="absolute -top-3.5 left-1 text-[8px] uppercase tracking-wider text-white/40">{{ node.label }}</span>

            <!-- Equipo Local -->
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-1.5 min-w-0 pr-1">
                <img v-if="flagOf(node.homeTeam)" :src="flagOf(node.homeTeam)" class="h-3 w-4 shrink-0 rounded-sm object-cover" :alt="node.homeTeam || ''">
                <div v-else class="h-3 w-4 shrink-0 rounded-sm bg-black/45 border border-white/10" />
                <span class="truncate" :class="isWinner(node, 'home') ? 'font-bold text-[#D4AF37]' : 'text-white/85'">
                  {{ node.homeTeam || '' }}
                </span>
              </div>
              <span 
                v-if="node.status === 'finished' && node.homeScore !== undefined" 
                class="shrink-0 text-[11px] font-mono font-bold px-1 text-center min-w-[16px]"
                :class="isWinner(node, 'home') ? 'text-[#D4AF37]' : 'text-white/70'"
              >
                {{ node.homeScore }}
              </span>
            </div>

            <!-- Equipo Visitante -->
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-1.5 min-w-0 pr-1">
                <img v-if="flagOf(node.awayTeam)" :src="flagOf(node.awayTeam)" class="h-3 w-4 shrink-0 rounded-sm object-cover" :alt="node.awayTeam || ''">
                <div v-else class="h-3 w-4 shrink-0 rounded-sm bg-black/45 border border-white/10" />
                <span class="truncate" :class="isWinner(node, 'away') ? 'font-bold text-[#D4AF37]' : 'text-white/85'">
                  {{ node.awayTeam || '' }}
                </span>
              </div>
              <span 
                v-if="node.status === 'finished' && node.awayScore !== undefined" 
                class="shrink-0 text-[11px] font-mono font-bold px-1 text-center min-w-[16px]"
                :class="isWinner(node, 'away') ? 'text-[#D4AF37]' : 'text-white/70'"
              >
                {{ node.awayScore }}
              </span>
            </div>
          </div>

          <!-- BLOQUE CENTRAL: FINAL Y TERCER LUGAR -->
          <div
            class="absolute flex flex-col items-center gap-4 justify-center"
            :style="{ left: `${finalX}px`, top: `${finalNodeTop}px`, width: `${finalWidth}px` }"
          >
            <!-- Final -->
            <div class="flex flex-col items-center gap-1.5 w-full">
              <h2 class="font-['Bebas_Neue'] text-xl tracking-widest text-[#D4AF37] uppercase">Final</h2>
              <div class="flex w-full flex-col justify-center gap-1.5 rounded-xl border-2 border-[#D4AF37] bg-[#04140D]/95 px-3 py-2 shadow-2xl">
                
                <!-- Local Final -->
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2 min-w-0 pr-1">
                    <img v-if="flagOf(finalNode.homeTeam)" :src="flagOf(finalNode.homeTeam)" class="h-3.5 w-5 shrink-0 rounded-sm object-cover" :alt="finalNode.homeTeam || ''">
                    <div v-else class="h-3.5 w-5 shrink-0 rounded-sm bg-black/45 border border-white/10" />
                    <span class="truncate" :class="isWinner(finalNode, 'home') ? 'font-bold text-[#D4AF37]' : 'text-white/90'">
                      {{ finalNode.homeTeam || '' }}
                    </span>
                  </div>
                  <span v-if="finalNode.status === 'finished' && finalNode.homeScore !== undefined" class="font-mono text-xs font-bold text-[#D4AF37]">
                    {{ finalNode.homeScore }}
                  </span>
                </div>

                <!-- Visitante Final -->
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2 min-w-0 pr-1">
                    <img v-if="flagOf(finalNode.awayTeam)" :src="flagOf(finalNode.awayTeam)" class="h-3.5 w-5 shrink-0 rounded-sm object-cover" :alt="finalNode.awayTeam || ''">
                    <div v-else class="h-3.5 w-5 shrink-0 rounded-sm bg-black/45 border border-white/10" />
                    <span class="truncate" :class="isWinner(finalNode, 'away') ? 'font-bold text-[#D4AF37]' : 'text-white/90'">
                      {{ finalNode.awayTeam || '' }}
                    </span>
                  </div>
                  <span v-if="finalNode.status === 'finished' && finalNode.awayScore !== undefined" class="font-mono text-xs font-bold text-[#D4AF37]">
                    {{ finalNode.awayScore }}
                  </span>
                </div>

              </div>
            </div>

            <!-- Tercer lugar -->
            <div class="flex flex-col items-center gap-1.5 w-full">
              <h3 class="text-[10px] uppercase tracking-widest text-white/40">Tercer lugar</h3>
              <div class="flex w-full flex-col justify-center gap-1.5 rounded-lg border border-white/15 bg-[#04140D]/70 px-3 py-2 text-xs">
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 min-w-0 pr-1">
                    <img v-if="flagOf(thirdNode.homeTeam)" :src="flagOf(thirdNode.homeTeam)" class="h-3 w-4 shrink-0 rounded-sm object-cover" :alt="thirdNode.homeTeam || ''">
                    <div v-else class="h-3 w-4 shrink-0 rounded-sm bg-black/45 border border-white/10" />
                    <span class="truncate text-white/80" :class="isWinner(thirdNode, 'home') ? 'font-bold text-[#D4AF37]' : ''">
                      {{ thirdNode.homeTeam || '' }}
                    </span>
                  </div>
                  <span v-if="thirdNode.status === 'finished' && thirdNode.homeScore !== undefined" class="font-mono text-[11px] font-bold text-white/80">
                    {{ thirdNode.homeScore }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 min-w-0 pr-1">
                    <img v-if="flagOf(thirdNode.awayTeam)" :src="flagOf(thirdNode.awayTeam)" class="h-3 w-4 shrink-0 rounded-sm object-cover" :alt="thirdNode.awayTeam || ''">
                    <div v-else class="h-3 w-4 shrink-0 rounded-sm bg-black/45 border border-white/10" />
                    <span class="truncate text-white/80" :class="isWinner(thirdNode, 'away') ? 'font-bold text-[#D4AF37]' : ''">
                      {{ thirdNode.awayTeam || '' }}
                    </span>
                  </div>
                  <span v-if="thirdNode.status === 'finished' && thirdNode.awayScore !== undefined" class="font-mono text-[11px] font-bold text-white/80">
                    {{ thirdNode.awayScore }}
                  </span>
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
import { ref, computed, onMounted } from 'vue'
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

// - Geometría exacta ajustada -
const cardWidth = 140
const cardHeight = 56
const gapV = 24            
const connectorW = 24     
const finalWidth = 170

const SIDE_STAGES = ['Dieciseisavos', 'Octavos', 'Cuartos', 'Semifinal']
const SIDE_COUNTS = [8, 4, 2, 1]

// Alineación precisa del origen relativo de coordenadas
const unit = (round: number) => (cardHeight + gapV) * Math.pow(2, round)
const centerY = (round: number, index: number) => {
  return index * unit(round) + (unit(round) / 2) - (cardHeight / 2)
}

const treeHeight = computed(() => unit(0) * SIDE_COUNTS[0]! - gapV)

const xLeft = (round: number) => round * (cardWidth + connectorW)
const leftEdgeX = computed(() => xLeft(SIDE_STAGES.length - 1) + cardWidth)
const finalX = computed(() => leftEdgeX.value + connectorW)
const rightInnerX = computed(() => finalX.value + finalWidth + connectorW)
const xRight = (round: number) => rightInnerX.value + (SIDE_STAGES.length - 1 - round) * (cardWidth + connectorW)

const totalWidth = computed(() => xRight(0) + cardWidth)

// Posicionamiento balanceado del bloque de la copa
const finalNodeTop = computed(() => {
  const semiY = centerY(SIDE_STAGES.length - 1, 0)
  return semiY - 50 
})

// El orden de `matches` ya viene fijado por useBracket (a partir de la tabla
// de posiciones y los resultados, no de fechas de kickoff), así que cada
// índice del arreglo ES el casillero real de la llave: no hace falta (ni se
// debe) reordenar ni compactar acá.
const fillSlots = (matches: (Match & { id: string })[], count: number): (Match & { id: string } | null)[] =>
  Array.from({ length: count }, (_, i) => matches[i] || null)

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
    const slots = fillSlots(matchesByStage.value[stage] || [], total)
    const half = side === 'left' ? slots.slice(0, total / 2) : slots.slice(total / 2, total)

    half.forEach((match, i) => {
      nodes.push({
        key: `${side}-${stage}-${i}`,
        label: stage,
        x: xOf(round),
        y: centerY(round, i),
        homeTeam: match?.homeTeam || null,
        awayTeam: match?.awayTeam || null,
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
  const [match] = fillSlots(matchesByStage.value.Final || [], 1)
  return match || emptySlot()
})

const thirdNode = computed<SlotMatch>(() => {
  const [match] = fillSlots(matchesByStage.value['Tercer lugar'] || [], 1)
  return match || emptySlot()
})

const buildSideConnectors = (side: 'left' | 'right'): string[] => {
  const xOf = side === 'left' ? xLeft : xRight
  const mirrored = side === 'right'
  const paths: string[] = []

  for (let round = 0; round < SIDE_COUNTS.length - 1; round++) {
    const count = SIDE_COUNTS[round]!
    for (let i = 0; i < count; i += 2) {
      const y1 = centerY(round, i) + (cardHeight / 2)
      const y2 = centerY(round, i + 1) + (cardHeight / 2)
      const yMid = centerY(round + 1, i / 2) + (cardHeight / 2)
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
  const lastRound = SIDE_STAGES.length - 1
  const y = centerY(lastRound, 0) + (cardHeight / 2)
  const leftStart = xLeft(lastRound) + cardWidth
  const rightStart = xRight(lastRound)

  return [
    `M ${leftStart} ${y} H ${finalX.value}`,
    `M ${rightStart} ${y} H ${finalX.value + finalWidth}`
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