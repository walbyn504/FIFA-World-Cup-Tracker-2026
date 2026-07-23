<template>
  <button
    class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-b from-[#F2D479] to-[#D4AF37] px-4 py-2 font-semibold text-[#04140D] shadow-[0_4px_14px_rgba(212,175,55,0.35)] transition hover:shadow-[0_6px_18px_rgba(212,175,55,0.5)] hover:brightness-105 active:scale-[0.97]"
    @click="$emit('click')"
  >
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()

defineEmits<{
  click: []
}>()
</script>
