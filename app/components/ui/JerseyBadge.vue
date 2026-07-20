<template>
  <svg viewBox="0 0 100 100" class="drop-shadow-[0_3px_5px_rgba(0,0,0,0.55)]">
    <path
      d="M30,8 L8,22 L18,42 L28,26 L28,92 L72,92 L72,26 L82,42 L92,22 L70,8 L58,16 Q50,24 42,16 Z"
      :fill="color"
      stroke="rgba(255,255,255,0.55)"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
    <text
      x="50"
      y="60"
      text-anchor="middle"
      font-size="30"
      font-weight="700"
      fill="#ffffff"
      style="paint-order: stroke; stroke: rgba(0,0,0,0.4); stroke-width: 2px;"
    >{{ number }}</text>
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    number: number | string
    color?: string
  }>(),
  {
    color: '#D4AF37'
  }
)
</script>
