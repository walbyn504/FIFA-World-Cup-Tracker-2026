<template>
  <div
    class="relative min-h-screen bg-cover bg-center"
    style="background-image: url('/fondo-mundial.jpg')"
  >
    <div class="absolute inset-0 bg-black/25" />
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>
