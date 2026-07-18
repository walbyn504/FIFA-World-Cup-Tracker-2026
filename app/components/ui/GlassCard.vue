<template>
  <div class="glass-card relative w-full max-w-md overflow-hidden bg-gradient-to-b from-white/20 via-white/10 to-white/5 px-8 py-10 backdrop-blur-xl backdrop-saturate-125">
    <div class="glass-sheen pointer-events-none absolute" />
    <div class="relative z-10 flex flex-col items-center gap-6 text-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.glass-card {
  border-radius: 32px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.45),
    0 2px 8px rgba(0, 0, 0, 0.25),
    inset 0 -1px 12px rgba(0, 0, 0, 0.12);
}

/* Borde con degradé: simula el reflejo especular del vidrio (mas brillante arriba) */
.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.85) 0%,
    rgba(255, 255, 255, 0.25) 25%,
    rgba(255, 255, 255, 0.05) 55%,
    rgba(255, 255, 255, 0.2) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Barrido de brillo tipo "cristal líquido" */
.glass-sheen {
  top: -60%;
  left: -60%;
  width: 60%;
  height: 220%;
  background: linear-gradient(
    115deg,
    transparent 30%,
    rgba(255, 255, 255, 0.35) 48%,
    rgba(255, 255, 255, 0.05) 55%,
    transparent 70%
  );
  transform: rotate(20deg);
  animation: sheen-sweep 6s ease-in-out infinite;
}

@keyframes sheen-sweep {
  0%   { left: -60%; }
  45%  { left: 130%; }
  100% { left: 130%; }
}
</style>
