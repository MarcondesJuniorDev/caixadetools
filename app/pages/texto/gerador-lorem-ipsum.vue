<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useSeoMeta, useHead, useToast } from '#imports'

useSeoMeta({
  title: 'Gerador de Lorem Ipsum Online - Gerar Textos Fictícios',
  description: 'Gerador de Lorem Ipsum gratuito e fácil. Crie parágrafos, palavras, frases ou listas de texto fictício em latim clássico para preencher seus layouts.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/texto/gerador-lorem-ipsum' }
  ]
})

const toast = useToast()

// --- Generator Config ---
const config = reactive({
  quantity: 5,
  type: 'paragraphs', // 'paragraphs' | 'words' | 'sentences' | 'lists'
  size: 'medium', // 'short' | 'medium' | 'long'
  startWithLorem: true
})

const generatedText = ref('')

// --- Latin Vocabulary Array ---
const latinWords = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'ut',
  'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
  'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in',
  'reprehenderit', 'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
  'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'in',
  'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
  'quisque', 'rutrum', 'aenean', 'imperdiet', 'etiam', 'ultricies', 'nisi', 'vel', 'mauris', 'vestibulum',
  'neque', 'vulputate', 'integer', 'tincidunt', 'suspendisse', 'feugiat', 'lobortis', 'pretium', 'sollicitudin',
  'nullam', 'aliquam', 'sapien', 'convallis', 'placerat', 'habitant', 'morbi', 'tristique', 'senectus', 'netus',
  'fames', 'ac', 'turpis', 'egestas', 'curabitur', 'semper', 'porta', 'congue', 'aenean', 'phasellus'
]

// --- Text Generation Algorithms ---

const generateSentence = (size: string): string => {
  let min = 9, max = 14
  if (size === 'short') { min = 5; max = 8 }
  if (size === 'long') { min = 15; max = 22 }
  
  const numWords = Math.floor(Math.random() * (max - min + 1)) + min
  const sentenceWords = []
  
  for (let i = 0; i < numWords; i++) {
    const word = latinWords[Math.floor(Math.random() * latinWords.length)]
    sentenceWords.push(word)
  }
  
  let sentence = sentenceWords.join(' ')
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)
  
  // Add comma for visual realism in medium/long sentences
  if (numWords > 10 && Math.random() < 0.45) {
    const commaIndex = Math.floor(numWords / 2)
    const arr = sentence.split(' ')
    arr[commaIndex] = arr[commaIndex] + ','
    sentence = arr.join(' ')
  }
  
  return sentence + '.'
}

const generateParagraph = (size: string): string => {
  let minSentences = 4, maxSentences = 7
  if (size === 'short') { minSentences = 2; maxSentences = 3 }
  if (size === 'long') { minSentences = 8; maxSentences = 12 }
  
  const numSentences = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences
  const sentences = []
  for (let i = 0; i < numSentences; i++) {
    sentences.push(generateSentence(size))
  }
  return sentences.join(' ')
}

const handleGenerate = () => {
  const qty = Math.min(Math.max(config.quantity, 1), 100) // Caps at 100 items
  let result = ''
  
  if (config.type === 'paragraphs') {
    const paragraphs = []
    for (let i = 0; i < qty; i++) {
      let p = generateParagraph(config.size)
      if (i === 0 && config.startWithLorem) {
        p = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + p
      }
      paragraphs.push(p)
    }
    result = paragraphs.join('\n\n')
  } else if (config.type === 'words') {
    const wordsList = []
    if (config.startWithLorem) {
      wordsList.push('lorem', 'ipsum', 'dolor', 'sit', 'amet')
    }
    const rem = Math.max(0, qty - wordsList.length)
    for (let i = 0; i < rem; i++) {
      wordsList.push(latinWords[Math.floor(Math.random() * latinWords.length)])
    }
    result = wordsList.slice(0, qty).join(' ')
  } else if (config.type === 'sentences') {
    const sentences = []
    for (let i = 0; i < qty; i++) {
      let s = generateSentence(config.size)
      if (i === 0 && config.startWithLorem) {
        s = "Lorem ipsum dolor sit amet."
      }
      sentences.push(s)
    }
    result = sentences.join(' ')
  } else if (config.type === 'lists') {
    const items = []
    for (let i = 0; i < qty; i++) {
      let item = generateSentence('short').replace('.', '')
      if (i === 0 && config.startWithLorem) {
        item = "Lorem ipsum dolor sit amet"
      }
      items.push(`• ${item}`)
    }
    result = items.join('\n')
  }
  
  generatedText.value = result
}

// --- Action Methods ---

const copyText = async () => {
  if (!generatedText.value) return
  try {
    await navigator.clipboard.writeText(generatedText.value)
    toast.add({
      title: 'Copiado!',
      description: 'Texto fictício copiado para o clipboard.',
      color: 'success'
    })
  } catch (err) {
    toast.add({
      title: 'Erro ao copiar',
      description: 'Não foi possível copiar o texto.',
      color: 'danger'
    })
  }
}

const downloadTxt = () => {
  if (!generatedText.value) return
  const blob = new Blob([generatedText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `caixadetools-lorem-ipsum-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  toast.add({
    title: 'Download Iniciado',
    description: 'O arquivo .txt foi gerado com sucesso.',
    color: 'success'
  })
}

// Watch inputs to regenerate automatically
watch(config, () => {
  handleGenerate()
}, { deep: true })

onMounted(() => {
  handleGenerate()
})
</script>

<template>
  <div class="space-y-6 py-4">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Gerador de Lorem Ipsum
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gere textos fictícios e trechos de preenchimento para layouts e protótipos de design.
        </p>
      </div>
      <UButton
        label="Gerar Novo Texto"
        icon="i-lucide-rotate-ccw"
        color="primary"
        size="sm"
        class="w-fit rounded-lg shadow-sm shadow-emerald-500/10"
        @click="handleGenerate"
      />
    </div>

    <!-- Simulator Layout Workspace -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      
      <!-- Controls Panel (Left - 5 Cols) -->
      <div class="md:col-span-5 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <UIcon name="i-lucide-wrench" class="text-emerald-500 size-4" />
          <span>Configuração do Lorem</span>
        </h2>

        <div class="space-y-4">
          <!-- Type Select -->
          <UFormField label="O que você deseja gerar?">
            <select
              v-model="config.type"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
            >
              <option value="paragraphs">Parágrafos</option>
              <option value="words">Palavras</option>
              <option value="sentences">Frases</option>
              <option value="lists">Itens de Lista (Balas)</option>
            </select>
          </UFormField>

          <!-- Quantity slider -->
          <UFormField label="Quantidade">
            <div class="flex items-center gap-3">
              <input
                type="range"
                v-model.number="config.quantity"
                min="1"
                max="50"
                class="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span class="text-xs font-mono font-bold w-6 text-right">{{ config.quantity }}</span>
            </div>
          </UFormField>

          <!-- Size (only relevant for sentences/paragraphs) -->
          <UFormField v-if="config.type === 'paragraphs' || config.type === 'sentences'" label="Tamanho do Bloco">
            <div class="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full">
              <button
                type="button"
                :class="config.size === 'short' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
                class="flex-1 py-1 text-xs font-semibold rounded-lg transition-all"
                @click="config.size = 'short'"
              >
                Curto
              </button>
              <button
                type="button"
                :class="config.size === 'medium' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
                class="flex-1 py-1 text-xs font-semibold rounded-lg transition-all"
                @click="config.size = 'medium'"
              >
                Médio
              </button>
              <button
                type="button"
                :class="config.size === 'long' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
                class="flex-1 py-1 text-xs font-semibold rounded-lg transition-all"
                @click="config.size = 'long'"
              >
                Longo
              </button>
            </div>
          </UFormField>

          <!-- Start with Lorem Ipsum -->
          <UFormField label="Prefixo Clássico">
            <label class="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="config.startWithLorem"
                class="sr-only peer"
              />
              <div class="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              <span class="ms-3 text-xs font-medium text-slate-600 dark:text-slate-400">Começar com "Lorem ipsum..."</span>
            </label>
          </UFormField>
        </div>
      </div>

      <!-- Preview Output Panel (Right - 7 Cols) -->
      <div class="md:col-span-7 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span>Texto Fictício Gerado</span>
          </h2>
          <div class="flex items-center gap-1">
            <UButton
              icon="i-lucide-copy"
              label="Copiar"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-lg"
              :disabled="!generatedText"
              @click="copyText"
            />
            <UButton
              icon="i-lucide-download"
              label="TXT"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-lg"
              :disabled="!generatedText"
              @click="downloadTxt"
            />
          </div>
        </div>

        <textarea
          :value="generatedText"
          readonly
          class="w-full h-[320px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 font-sans text-xs sm:text-sm focus:outline-none overflow-auto resize-none select-all leading-relaxed"
        ></textarea>
      </div>

    </div>

    <!-- AdSense Slot below Generator -->
    <AdBlock id="adsense-lorem-footer" type="leaderboard" />
  </div>
</template>
