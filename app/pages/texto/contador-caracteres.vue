<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSeoMeta, useHead, useToast } from '#imports'

useSeoMeta({
  title: 'Contador de Caracteres e Palavras Online - Análise de Texto',
  description: 'Conte caracteres, palavras, linhas e parágrafos em tempo real. Faça análise de densidade de palavras-chave para SEO e estime o tempo de leitura.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/texto/contador-caracteres' }
  ]
})

const toast = useToast()

const rawText = ref('')

// --- Analytical Calculations ---

const charCountWithSpaces = computed(() => rawText.value.length)

const charCountWithoutSpaces = computed(() => rawText.value.replace(/\s/g, '').length)

const wordCount = computed(() => {
  const text = rawText.value.trim()
  if (!text) return 0
  return text.split(/\s+/).filter(w => w.length > 0).length
})

const paragraphCount = computed(() => {
  const text = rawText.value.trim()
  if (!text) return 0
  return text.split(/\n+/).filter(p => p.trim().length > 0).length
})

const lineCount = computed(() => {
  if (!rawText.value) return 0
  return rawText.value.split('\n').length
})

// Estimates based on standard reading speeds (200 wpm) and speaking speeds (130 wpm)
const readingTime = computed(() => {
  const words = wordCount.value
  if (words === 0) return '0s'
  const seconds = Math.ceil((words / 200) * 60)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
})

const speakingTime = computed(() => {
  const words = wordCount.value
  if (words === 0) return '0s'
  const seconds = Math.ceil((words / 130) * 60)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
})

// --- Word Density / Keyword stuffing check (excluding Portuguese Stopwords) ---
const stopwords = new Set([
  'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'com', 'na', 'no', 'uma', 'os', 'as', 'dos', 'das',
  'se', 'por', 'ao', 'aos', 'como', 'mais', 'mas', 'ou', 'de', 'esta', 'este', 'isso', 'aquilo',
  'ele', 'ela', 'eles', 'elas', 'meu', 'seu', 'teu', 'nos', 'vos', 'sua', 'suas', 'meus', 'seus',
  'um', 'uns', 'uma', 'umas', 'pelo', 'pela', 'pelos', 'pelas', 'num', 'numa', 'neste', 'nesta', 'nesse', 'nessa'
])

const wordDensity = computed(() => {
  const text = rawText.value.trim().toLowerCase()
  if (!text) return []

  // Extract words containing letters (including Portuguese accents) of length >= 3
  const words = text
    .replace(/[^\w\s\u00C0-\u00FF]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w))

  if (words.length === 0) return []

  const freqMap: Record<string, number> = {}
  words.forEach(w => {
    freqMap[w] = (freqMap[w] || 0) + 1
  })

  return Object.entries(freqMap)
    .map(([word, count]) => ({
      word,
      count,
      percentage: (count / words.length) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // Top 5 keywords
})

// --- Text Transformations ---

const convertToUpperCase = () => {
  if (!rawText.value) return
  rawText.value = rawText.value.toUpperCase()
  toast.add({ title: 'Texto Convertido', description: 'Todo o texto foi convertido para MAIÚSCULAS.', color: 'success' })
}

const convertToLowerCase = () => {
  if (!rawText.value) return
  rawText.value = rawText.value.toLowerCase()
  toast.add({ title: 'Texto Convertido', description: 'Todo o texto foi convertido para minúsculas.', color: 'success' })
}

const convertToTitleCase = () => {
  if (!rawText.value) return
  rawText.value = rawText.value.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
  toast.add({ title: 'Texto Convertido', description: 'Iniciais convertidas para Maiúsculas.', color: 'success' })
}

const convertToSentenceCase = () => {
  if (!rawText.value) return
  rawText.value = rawText.value.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, c => c.toUpperCase())
  toast.add({ title: 'Texto Convertido', description: 'Primeira letra de cada frase capitalizada.', color: 'success' })
}

// --- Clipboard Actions ---

const clearText = () => {
  rawText.value = ''
  toast.add({ title: 'Texto Limpo', description: 'A caixa de texto foi esvaziada.', color: 'neutral' })
}

const copyText = async () => {
  if (!rawText.value) return
  try {
    await navigator.clipboard.writeText(rawText.value)
    toast.add({ title: 'Copiado!', description: 'Texto copiado para a área de transferência.', color: 'success' })
  } catch (err) {
    toast.add({ title: 'Erro ao copiar', description: 'Falha ao copiar para o clipboard.', color: 'danger' })
  }
}

const pasteText = async () => {
  try {
    const text = await navigator.clipboard.readText()
    rawText.value = text
    toast.add({ title: 'Colado!', description: 'Texto colado com sucesso.', color: 'success' })
  } catch (err) {
    toast.add({ title: 'Permissão Negada', description: 'Não foi possível acessar a área de transferência. Use Ctrl+V.', color: 'warning' })
  }
}
</script>

<template>
  <div class="space-y-6 py-4">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Contador de Caracteres e Palavras
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Analise o comprimento, estrutura e densidade de palavras-chave de seus textos em tempo real.
      </p>
    </div>

    <!-- Main Workspace (Editor Cards) -->
    <div class="grid grid-cols-1 gap-6">
      
      <!-- Editor Container Card -->
      <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        
        <!-- Action Buttons Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            <UButton
              label="MAIÚSCULAS"
              color="neutral"
              variant="subtle"
              size="xs"
              class="rounded-lg"
              :disabled="!rawText"
              @click="convertToUpperCase"
            />
            <UButton
              label="minúsculas"
              color="neutral"
              variant="subtle"
              size="xs"
              class="rounded-lg"
              :disabled="!rawText"
              @click="convertToLowerCase"
            />
            <UButton
              label="Capitalizar Palavras"
              color="neutral"
              variant="subtle"
              size="xs"
              class="rounded-lg"
              :disabled="!rawText"
              @click="convertToTitleCase"
            />
            <UButton
              label="Capitalizar Frases"
              color="neutral"
              variant="subtle"
              size="xs"
              class="rounded-lg"
              :disabled="!rawText"
              @click="convertToSentenceCase"
            />
          </div>

          <div class="flex items-center gap-1.5 ml-auto">
            <UButton
              icon="i-lucide-clipboard"
              label="Colar"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-lg"
              @click="pasteText"
            />
            <UButton
              icon="i-lucide-copy"
              label="Copiar"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-lg"
              :disabled="!rawText"
              @click="copyText"
            />
            <UButton
              icon="i-lucide-trash"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              :disabled="!rawText"
              @click="clearText"
            />
          </div>
        </div>

        <!-- Textarea input -->
        <textarea
          v-model="rawText"
          placeholder="Comece a digitar ou cole seu texto aqui para analisá-lo..."
          class="w-full h-[300px] md:h-[350px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all overflow-auto resize-none"
        ></textarea>
      </div>

      <!-- Live Counters Dashboard Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <!-- Characters (with spaces) -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center">
          <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Caracteres</span>
          <p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1 font-mono">
            {{ charCountWithSpaces }}
          </p>
        </div>
        <!-- Characters (no spaces) -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center">
          <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sem Espaços</span>
          <p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1 font-mono">
            {{ charCountWithoutSpaces }}
          </p>
        </div>
        <!-- Words -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center">
          <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Palavras</span>
          <p class="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {{ wordCount }}
          </p>
        </div>
        <!-- Paragraphs -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center">
          <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Parágrafos</span>
          <p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1 font-mono">
            {{ paragraphCount }}
          </p>
        </div>
        <!-- Lines -->
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center">
          <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Linhas</span>
          <p class="text-xl font-extrabold text-slate-800 dark:text-white mt-1 font-mono">
            {{ lineCount }}
          </p>
        </div>
      </div>

      <!-- Time and Word Density Analysis Details (2 Columns) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Column 1: Time estimates -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <h3 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UIcon name="i-lucide-clock" class="text-emerald-500 size-4" />
            <span>Estimativas de Tempo</span>
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-center">
              <span class="text-[10px] text-slate-400 font-semibold uppercase">Tempo de Leitura</span>
              <p class="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{{ readingTime }}</p>
              <span class="text-[9px] text-slate-400 block mt-1">(Base: 200 palavras/min)</span>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-center">
              <span class="text-[10px] text-slate-400 font-semibold uppercase">Tempo de Fala</span>
              <p class="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{{ speakingTime }}</p>
              <span class="text-[9px] text-slate-400 block mt-1">(Base: 130 palavras/min)</span>
            </div>
          </div>
        </div>

        <!-- Column 2: Word Density Progress Bars -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <h3 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UIcon name="i-lucide-hash" class="text-emerald-500 size-4" />
            <span>Densidade de Palavras-Chave (SEO)</span>
          </h3>

          <div v-if="wordDensity.length > 0" class="space-y-3">
            <div v-for="item in wordDensity" :key="item.word" class="space-y-1">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-slate-800 dark:text-slate-200 font-mono">"{{ item.word }}"</span>
                <span class="text-slate-500 font-mono">{{ item.count }}x ({{ item.percentage.toFixed(1) }}%)</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2">
                <div
                  class="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${item.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="h-28 flex items-center justify-center text-xs text-slate-400">
            Digite pelo menos 3 palavras no campo para iniciar a análise de densidade.
          </div>
        </div>

      </div>

    </div>

    <!-- Educational AdSense Placeholder -->
    <AdBlock id="adsense-counter-footer" type="leaderboard" />
  </div>
</template>
