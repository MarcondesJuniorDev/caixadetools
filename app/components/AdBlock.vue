<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  // 'leaderboard' (horizontal banner), 'sidebar' (vertical block), 'rectangle' (square/in-content)
  type: {
    type: String,
    default: 'rectangle',
    validator: (value: string) => ['leaderboard', 'sidebar', 'rectangle'].includes(value)
  },
  id: {
    type: String,
    required: true
  }
})

// Define classes to reserve exact heights to prevent Cumulative Layout Shift (CLS)
const wrapperClasses = computed(() => {
  switch (props.type) {
    case 'leaderboard':
      return 'w-full min-h-[90px] md:min-h-[100px] flex items-center justify-center my-6'
    case 'sidebar':
      return 'w-full md:w-[300px] min-h-[250px] md:min-h-[600px] flex items-center justify-center my-4 mx-auto'
    case 'rectangle':
    default:
      return 'w-full min-h-[250px] flex items-center justify-center my-6'
  }
})

const innerClasses = computed(() => {
  switch (props.type) {
    case 'leaderboard':
      return 'w-full max-w-[728px] h-[90px] md:h-[100px]'
    case 'sidebar':
      return 'w-[300px] h-[250px] md:h-[600px]'
    case 'rectangle':
    default:
      return 'w-full max-w-[336px] h-[280px]'
  }
})
</script>

<template>
  <div :class="wrapperClasses" class="transition-all duration-300">
    <div
      :id="id"
      :class="innerClasses"
      class="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/30 overflow-hidden group hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-colors duration-300"
    >
      <!-- Subtle Decorative Background Gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <!-- Label / Info for Developer and AdSense Slot -->
      <div class="z-10 flex flex-col items-center gap-1 text-center p-4 select-none">
        <span class="text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-600 uppercase">
          Anúncio / Publicidade
        </span>
        <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <UIcon name="i-lucide-layout-grid" class="size-4 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
          <span>{{ type === 'leaderboard' ? 'Horizontal Banner' : type === 'sidebar' ? 'Lateral Widget' : 'Bloco Conteúdo' }}</span>
        </div>
        <span class="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-1 opacity-70">
          Slot: {{ id }}
        </span>
      </div>

      <!-- Real AdSense Tag integration placeholder -->
      <!-- In production, standard AdSense ins tag will go here or be injected via script -->
      <slot>
        <!-- <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" ... /> -->
      </slot>
    </div>
  </div>
</template>
