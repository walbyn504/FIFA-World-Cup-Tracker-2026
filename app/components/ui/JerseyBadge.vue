<template>
  <svg viewBox="0 0 100 100" class="drop-shadow-[0_3px_5px_rgba(0,0,0,0.55)]">
    <defs>
      <clipPath :id="clipId">
        <path :d="shirtPath" />
      </clipPath>
      <!-- Mismo degradé "vidrio" que UiGlassCard: brillo de arriba hacia abajo -->
      <linearGradient :id="glassId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.32" />
        <stop offset="45%" stop-color="#ffffff" stop-opacity="0.14" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04" />
      </linearGradient>
      <!-- Barrido diagonal que imita el .glass-sheen de las cards -->
      <linearGradient :id="sheenId" x1="0" y1="0" x2="1" y2="1">
        <stop offset="30%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="48%" stop-color="#ffffff" stop-opacity="0.45" />
        <stop offset="60%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
    </defs>

    <path
      :d="shirtPath"
      fill="rgba(255,255,255,0.10)"
      stroke="rgba(255,255,255,0.55)"
      stroke-width="2.5"
      stroke-linejoin="round"
    />

    <g :clip-path="`url(#${clipId})`">
      <rect x="0" y="0" width="100" height="100" :fill="`url(#${glassId})`" />
      <rect x="0" y="0" width="100" height="100" :fill="`url(#${sheenId})`" />
    </g>

    <text
      x="50"
      y="60"
      text-anchor="middle"
      font-size="30"
      font-weight="800"
      fill="#ffffff"
      style="paint-order: stroke; stroke: rgba(0,0,0,0.35); stroke-width: 1px;"
    >{{ number }}</text>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  number: number | string
}>()

const shirtPath = 'M30,8 L8,22 L18,42 L28,26 L28,92 L72,92 L72,26 L82,42 L92,22 L70,8 L58,16 Q50,24 42,16 Z'

// IDs únicos por instancia para que el clip/degradé no choque cuando hay varias camisetas en pantalla
const uid = useId()
const clipId = `jersey-clip-${uid}`
const glassId = `jersey-glass-${uid}`
const sheenId = `jersey-sheen-${uid}`
</script>
