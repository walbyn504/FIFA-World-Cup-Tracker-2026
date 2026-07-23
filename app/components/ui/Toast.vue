<template>
  <div class="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col-reverse items-end gap-3">
    <TransitionGroup name="toast">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl bg-[#0F1F17] px-4 py-3.5 shadow-xl ring-1 ring-white/10"
      >
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          :class="{
            'bg-emerald-500': n.type === 'success',
            'bg-red-500': n.type === 'error',
            'bg-amber-500': n.type === 'warning'
          }"
        >
          <svg v-if="n.type === 'success'" class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg v-else class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>

        <div class="flex-1 pt-0.5">
          <p class="text-sm font-medium text-white">{{ n.title }}</p>
          <p class="mt-0.5 text-xs text-white/60">{{ n.message }}</p>
        </div>

        <button class="shrink-0 text-white/40 hover:text-white/80" @click="dismiss(n.id)" aria-label="Cerrar">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div
          class="absolute bottom-0 left-0 h-[3px] animate-toast-progress"
          :class="{
            'bg-emerald-500': n.type === 'success',
            'bg-red-500': n.type === 'error',
            'bg-amber-500': n.type === 'warning'
          }"
          :style="{ animationDuration: `${n.duration}ms` }"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { notifications, dismiss } = useNotify()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
.toast-move {
  transition: transform 0.25s ease;
}

@keyframes toast-progress {
  from { width: 100%; }
  to { width: 0%; }
}
.animate-toast-progress {
  animation-name: toast-progress;
  animation-timing-function: linear;
}
</style>