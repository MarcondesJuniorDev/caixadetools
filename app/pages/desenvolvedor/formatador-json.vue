<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSeoMeta, useHead, definePageMeta, useToast } from '#imports'

// Disable default layout sidebar for full screen editing canvas
definePageMeta({
  sidebar: false
})

useSeoMeta({
  title: 'Formatador de JSON Online - Validar, Minificar e Visualizar JSON',
  description: 'Formatador e validador de JSON gratuito. Limpe, formate, minifique e explore dados JSON em árvore interativa de forma 100% segura no seu navegador.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/desenvolvedor/formatador-json' }
  ]
})

const toast = useToast()

const rawInput = ref('')
const indentSize = ref('2') // '2', '4', 'tab'
const outputMode = ref('text') // 'text' | 'tree'

const parsedJson = ref<any>(null)
const formatError = ref<string | null>(null)
const isValid = ref<boolean | null>(null)
const formattedOutput = ref('')

// Watch for indent adjustments to automatically reformat if we have valid input
watch(indentSize, () => {
  if (rawInput.value.trim() && isValid.value) {
    handleFormat()
  }
})

const handleFormat = () => {
  if (!rawInput.value.trim()) {
    clearAll()
    return
  }
  
  try {
    const parsed = JSON.parse(rawInput.value)
    parsedJson.value = parsed
    
    let spacer: string | number = 2
    if (indentSize.value === '4') spacer = 4
    if (indentSize.value === 'tab') spacer = '\t'
    
    formattedOutput.value = JSON.stringify(parsed, null, spacer)
    formatError.value = null
    isValid.value = true
    
    toast.add({
      title: 'Sucesso',
      description: 'JSON formatado com sucesso.',
      color: 'success'
    })
  } catch (err: any) {
    isValid.value = false
    formatError.value = err.message
    formattedOutput.value = ''
    parsedJson.value = null
    
    toast.add({
      title: 'Erro de Sintaxe',
      description: 'JSON inválido. Verifique os erros apontados.',
      color: 'danger'
    })
  }
}

const handleMinify = () => {
  if (!rawInput.value.trim()) {
    toast.add({
      title: 'Aviso',
      description: 'Insira um JSON para minificar.',
      color: 'warning'
    })
    return
  }
  
  try {
    const parsed = JSON.parse(rawInput.value)
    parsedJson.value = parsed
    formattedOutput.value = JSON.stringify(parsed)
    formatError.value = null
    isValid.value = true
    
    toast.add({
      title: 'Sucesso',
      description: 'JSON minificado com sucesso.',
      color: 'success'
    })
  } catch (err: any) {
    isValid.value = false
    formatError.value = err.message
    formattedOutput.value = ''
    parsedJson.value = null
    
    toast.add({
      title: 'Erro ao Minificar',
      description: 'O JSON inserido é inválido.',
      color: 'danger'
    })
  }
}

const loadSample = () => {
  rawInput.value = JSON.stringify({
    nome: "Caixa de Tools",
    url: "https://caixadetools.com",
    descricao: "Portal multiferramentas e simuladores utilitários",
    ativo: true,
    versao: 4.0,
    tags: ["desenvolvimento", "finanças", "produtividade"],
    tecnologias: {
      framework: "Nuxt 4",
      estilizacao: "Tailwind CSS + Nuxt UI",
      ssr: true
    }
  }, null, 2)
  handleFormat()
}

const clearAll = () => {
  rawInput.value = ''
  formattedOutput.value = ''
  parsedJson.value = null
  formatError.value = null
  isValid.value = null
}

const copyToClipboard = async (text: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.add({
      title: 'Copiado!',
      description: 'Copiado para a área de transferência.',
      color: 'success'
    })
  } catch (err) {
    toast.add({
      title: 'Erro ao copiar',
      description: 'Não foi possível copiar para a área de transferência.',
      color: 'danger'
    })
  }
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    rawInput.value = text
    handleFormat()
    toast.add({
      title: 'Colado!',
      description: 'JSON colado e validado.',
      color: 'success'
    })
  } catch (err) {
    toast.add({
      title: 'Permissão Negada',
      description: 'Não foi possível ler da área de transferência. Use Ctrl+V.',
      color: 'warning'
    })
  }
}

const downloadJson = () => {
  if (!formattedOutput.value) return
  const blob = new Blob([formattedOutput.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `caixadetools-formatado-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast.add({
    title: 'Download Iniciado',
    description: 'O arquivo JSON foi baixado.',
    color: 'success'
  })
}
</script>

<template>
  <div class="space-y-6 py-4">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Formatador & Validador de JSON
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Formate, valide, organize e minifique seu JSON instantaneamente. Seus dados são processados localmente.
        </p>
      </div>
      
      <!-- General Page Controls -->
      <div class="flex flex-wrap gap-2">
        <UButton
          label="Carregar Exemplo"
          icon="i-lucide-file-text"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg"
          @click="loadSample"
        />
        <UButton
          label="Limpar Tudo"
          icon="i-lucide-trash"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          @click="clearAll"
        />
      </div>
    </div>

    <!-- Validation Alerts -->
    <div v-if="isValid !== null" class="transition-all duration-300">
      <div
        v-if="isValid"
        class="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300"
      >
        <UIcon name="i-lucide-check-circle" class="size-5 text-emerald-500 mt-0.5 flex-shrink-0" />
        <div>
          <span class="font-bold text-sm">JSON Válido!</span>
          <p class="text-xs mt-0.5 opacity-90">Os dados foram estruturados e validados de acordo com o padrão JSON.</p>
        </div>
      </div>
      <div
        v-else
        class="flex items-start gap-3 p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300"
      >
        <UIcon name="i-lucide-alert-circle" class="size-5 text-rose-500 mt-0.5 flex-shrink-0" />
        <div>
          <span class="font-bold text-sm">JSON Inválido!</span>
          <p class="text-xs mt-0.5 font-mono bg-rose-100/50 dark:bg-rose-950/30 p-2 rounded border border-rose-200/50 dark:border-rose-800/50 mt-1 select-all">
            {{ formatError }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Workspace (Dual Pane Grid) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Input Panel -->
      <div class="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span>JSON Bruto (Entrada)</span>
          </h2>
          <div class="flex items-center gap-1.5">
            <UButton
              icon="i-lucide-clipboard"
              label="Colar"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-lg"
              title="Colar da Área de Transferência"
              @click="pasteFromClipboard"
            />
            <UButton
              icon="i-lucide-copy"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-lg"
              title="Copiar JSON de Entrada"
              @click="copyToClipboard(rawInput)"
            />
          </div>
        </div>

        <textarea
          v-model="rawInput"
          placeholder="Cole seu JSON bruto aqui para formatá-lo..."
          class="w-full h-[400px] md:h-[500px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all overflow-auto resize-none"
        ></textarea>

        <!-- Input Panel Action Buttons -->
        <div class="grid grid-cols-2 gap-3 pt-2">
          <UButton
            label="Formatar"
            icon="i-lucide-braces"
            color="primary"
            class="rounded-xl font-semibold justify-center py-2.5 shadow-lg shadow-emerald-500/10"
            @click="handleFormat"
          />
          <UButton
            label="Minificar"
            icon="i-lucide-binary"
            color="neutral"
            variant="subtle"
            class="rounded-xl font-semibold justify-center py-2.5"
            @click="handleMinify"
          />
        </div>
      </div>

      <!-- Output Panel -->
      <div class="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <!-- Mode Tabs -->
          <div class="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-fit">
            <button
              :class="outputMode === 'text' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all"
              @click="outputMode = 'text'"
            >
              Texto Formatado
            </button>
            <button
              :class="outputMode === 'tree' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'"
              class="px-3 py-1 text-xs font-semibold rounded-lg transition-all"
              :disabled="!parsedJson"
              @click="outputMode = 'tree'"
            >
              Árvore Interativa
            </button>
          </div>

          <!-- Spacing Controls & Output Options -->
          <div class="flex items-center gap-2">
            <div v-if="outputMode === 'text'" class="flex items-center gap-1">
              <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recuo:</label>
              <select
                v-model="indentSize"
                class="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white transition-all"
              >
                <option value="2">2 Espaços</option>
                <option value="4">4 Espaços</option>
                <option value="tab">Tabulações</option>
              </select>
            </div>
            
            <div class="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
              <UButton
                icon="i-lucide-copy"
                color="neutral"
                variant="ghost"
                size="xs"
                class="rounded-lg"
                title="Copiar JSON Formatado"
                :disabled="!formattedOutput"
                @click="copyToClipboard(formattedOutput)"
              />
              <UButton
                icon="i-lucide-download"
                color="neutral"
                variant="ghost"
                size="xs"
                class="rounded-lg"
                title="Baixar JSON"
                :disabled="!formattedOutput"
                @click="downloadJson"
              />
            </div>
          </div>
        </div>

        <!-- Output Display Area -->
        <div class="flex-grow">
          <!-- Text Mode Output -->
          <textarea
            v-if="outputMode === 'text'"
            :value="formattedOutput"
            readonly
            placeholder="O JSON formatado aparecerá aqui..."
            class="w-full h-[400px] md:h-[500px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-xs sm:text-sm focus:outline-none overflow-auto resize-none select-all"
          ></textarea>

          <!-- Tree Mode Output -->
          <div
            v-else
            class="w-full h-[400px] md:h-[500px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 overflow-auto"
          >
            <JsonTreeView v-if="parsedJson" :data="parsedJson" />
            <div v-else class="h-full flex items-center justify-center text-xs text-slate-400">
              Formate um JSON válido para habilitar a árvore interativa.
            </div>
          </div>
        </div>
      </div>
      
    </div>

    <!-- AdSense Banner below Workspace (Evita CLS) -->
    <AdBlock id="adsense-json-footer" type="leaderboard" />
  </div>
</template>
