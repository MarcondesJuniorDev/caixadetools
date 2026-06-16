<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  data: {
    type: [Object, Array, String, Number, Boolean, null] as any,
    required: true
  },
  nodeKey: {
    type: [String, Number],
    default: ''
  },
  isLast: {
    type: Boolean,
    default: true
  },
  depth: {
    type: Number,
    default: 0
  }
})

const isOpen = ref(props.depth < 2) // Expand top 2 levels by default

const toggleOpen = () => {
  if (isCollapsible.value) {
    isOpen.value = !isOpen.value
  }
}

const dataType = computed(() => {
  if (props.data === null) return 'null'
  if (Array.isArray(props.data)) return 'array'
  return typeof props.data
})

const isCollapsible = computed(() => {
  return dataType.value === 'object' || dataType.value === 'array'
})

const keys = computed(() => {
  if (dataType.value === 'object') {
    return Object.keys(props.data)
  }
  return []
})

// Format primitive values for display
const formattedValue = computed(() => {
  if (dataType.value === 'string') {
    return `"${props.data}"`
  }
  if (dataType.value === 'null') {
    return 'null'
  }
  return String(props.data)
})

// CSS classes based on the value type
const valueColorClass = computed(() => {
  switch (dataType.value) {
    case 'string':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'number':
      return 'text-blue-600 dark:text-blue-400 font-mono'
    case 'boolean':
      return 'text-amber-600 dark:text-amber-400 font-semibold'
    case 'null':
      return 'text-slate-400 dark:text-slate-500 font-semibold'
    default:
      return 'text-slate-800 dark:text-slate-200'
  }
})
</script>

<template>
  <div class="font-mono text-xs sm:text-sm leading-relaxed select-text">
    <!-- Collapsible Node (Object or Array) -->
    <div v-if="isCollapsible" class="pl-4">
      <div
        class="inline-flex items-center gap-1 cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded px-1 -ml-1 transition-colors"
        @click="toggleOpen"
      >
        <!-- Collapse/Expand Arrow -->
        <UIcon
          name="i-lucide-chevron-right"
          class="size-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200"
          :class="isOpen ? 'rotate-90' : 'rotate-0'"
        />

        <!-- Node Key -->
        <span v-if="nodeKey" class="text-purple-600 dark:text-purple-400 font-semibold">
          "{{ nodeKey }}":
        </span>

        <!-- Node Brackets/Type Summary -->
        <span class="text-slate-500 dark:text-slate-400">
          {{ dataType === 'array' ? '[' : '{' }}
          <span v-if="!isOpen" class="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-500">
            {{ dataType === 'array' ? `${data.length} items` : `${keys.length} keys` }}
          </span>
          <span v-if="!isOpen">{{ dataType === 'array' ? ']' : '}' }}{{ isLast ? '' : ',' }}</span>
        </span>
      </div>

      <!-- Child Nodes -->
      <div v-show="isOpen" class="border-l border-slate-200 dark:border-slate-800 ml-1.5 pl-2">
        <!-- If Array -->
        <template v-if="dataType === 'array'">
          <JsonTreeView
            v-for="(item, index) in data"
            :key="index"
            :data="item"
            :node-key="index"
            :is-last="index === data.length - 1"
            :depth="depth + 1"
          />
        </template>

        <!-- If Object -->
        <template v-else-if="dataType === 'object'">
          <JsonTreeView
            v-for="(key, index) in keys"
            :key="key"
            :data="data[key]"
            :node-key="key"
            :is-last="index === keys.length - 1"
            :depth="depth + 1"
          />
        </template>
      </div>

      <!-- Closing Bracket -->
      <div v-show="isOpen" class="text-slate-500 dark:text-slate-400">
        {{ dataType === 'array' ? ']' : '}' }}{{ isLast ? '' : ',' }}
      </div>
    </div>

    <!-- Leaf Node (Primitive Value) -->
    <div v-else class="pl-8 flex items-start gap-1 flex-wrap">
      <!-- Node Key -->
      <span v-if="nodeKey" class="text-purple-600 dark:text-purple-400 font-semibold">
        "{{ nodeKey }}":
      </span>

      <!-- Value -->
      <span :class="valueColorClass" class="break-all">
        {{ formattedValue }}
      </span>

      <!-- Comma -->
      <span class="text-slate-500 dark:text-slate-400">
        {{ isLast ? '' : ',' }}
      </span>
    </div>
  </div>
</template>
