<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useSeoMeta, useHead, definePageMeta, useToast } from '#imports'

// Disable sidebar for a wide dual-pane layout
definePageMeta({
  sidebar: false
})

useSeoMeta({
  title: 'Conversor de Desenvolvedor - Base64, URL e Bases Numéricas',
  description: 'Conversor utilitário multiuso. Codifique/decodifique strings e arquivos em Base64, codifique URLs e converta bases numéricas (Hex, Dec, Bin, Oct).'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/desenvolvedor/conversor' }
  ]
})

const toast = useToast()

const activeSubConverter = ref('base64') // 'base64' | 'url' | 'bases'

// ============================================================================
// 1. BASE64 SUB-CONVERTER STATE & LOGIC
// ============================================================================
const base64Mode = ref('text') // 'text' | 'file'
const b64Text = reactive({
  input: '',
  output: '',
  urlSafe: false,
  isDecoding: false
})

const b64File = reactive({
  selectedFile: null as File | null,
  fileBase64: '',
  includePrefix: true,
  decodeBase64: '',
  decodedFileName: 'arquivo_decodificado'
})

// UTF-8 safe encoders
const utf8ToBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str)
  let binString = ''
  bytes.forEach(byte => { binString += String.fromCharCode(byte) })
  return window.btoa(binString)
}

const base64ToUtf8 = (str: string): string => {
  const binString = window.atob(str)
  const bytes = Uint8Array.from(binString, c => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const makeUrlSafe = (base64: string): string => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const restoreStandardBase64 = (base64: string): string => {
  let standard = base64.replace(/-/g, '+').replace(/_/g, '/')
  while (standard.length % 4) { standard += '=' }
  return standard
}

const handleBase64TextConvert = () => {
  const data = b64Text.input.trim()
  if (!data) {
    b64Text.output = ''
    return
  }
  try {
    if (b64Text.isDecoding) {
      let target = data
      if (b64Text.urlSafe) target = restoreStandardBase64(data)
      b64Text.output = base64ToUtf8(target)
    } else {
      let base64 = utf8ToBase64(b64Text.input)
      if (b64Text.urlSafe) base64 = makeUrlSafe(base64)
      b64Text.output = base64
    }
  } catch (err) {
    b64Text.output = ''
  }
}

watch(() => b64Text.input, handleBase64TextConvert)
watch(() => b64Text.urlSafe, handleBase64TextConvert)
watch(() => b64Text.isDecoding, () => {
  const temp = b64Text.input
  b64Text.input = b64Text.output
  b64Text.output = temp
  handleBase64TextConvert()
})

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) processFile(target.files[0])
}

const onFileDrop = (e: DragEvent) => {
  if (e.dataTransfer && e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0])
}

const processFile = (file: File) => {
  b64File.selectedFile = file
  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result as string
    b64File.fileBase64 = b64File.includePrefix ? result : (result.split(',')[1] || '')
    toast.add({ title: 'Arquivo Codificado', description: `"${file.name}" convertido para Base64.`, color: 'success' })
  }
  reader.readAsDataURL(file)
}

watch(() => b64File.includePrefix, () => {
  if (b64File.selectedFile) processFile(b64File.selectedFile)
})

const removeFile = () => {
  b64File.selectedFile = null
  b64File.fileBase64 = ''
}

const downloadDecodedFile = () => {
  let b64 = b64File.decodeBase64.trim()
  if (!b64) return
  try {
    if (!b64.startsWith('data:')) {
      b64 = `data:application/octet-stream;base64,${b64}`
    }
    
    // Parse MIME and Extension
    let mime = 'application/octet-stream'
    let ext = 'bin'
    const match = b64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+);base64,/)
    if (match && match[1]) {
      mime = match[1]
      ext = mime.split('/')[1] || 'bin'
      if (ext === 'jpeg') ext = 'jpg'
      if (ext.includes('document')) ext = 'docx'
      if (ext.includes('sheet')) ext = 'xlsx'
    }

    const byteString = window.atob(b64.split(',')[1])
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i) }
    
    const blob = new Blob([ab], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${b64File.decodedFileName.replace(/\.[^/.]+$/, "")}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.add({ title: 'Sucesso', description: 'Arquivo binário decodificado e baixado.', color: 'success' })
  } catch (err) {
    toast.add({ title: 'Erro de Decodificação', description: 'A string Base64 informada é inválida.', color: 'danger' })
  }
}

// ============================================================================
// 2. URL ENCODER SUB-CONVERTER STATE & LOGIC
// ============================================================================
const urlState = reactive({
  input: '',
  output: '',
  isDecoding: false
})

const handleUrlConvert = () => {
  const data = urlState.input.trim()
  if (!data) {
    urlState.output = ''
    return
  }
  try {
    if (urlState.isDecoding) {
      urlState.output = decodeURIComponent(urlState.input)
    } else {
      urlState.output = encodeURIComponent(urlState.input)
    }
  } catch (err) {
    urlState.output = ''
  }
}

watch(() => urlState.input, handleUrlConvert)
watch(() => urlState.isDecoding, () => {
  const temp = urlState.input
  urlState.input = urlState.output
  urlState.output = temp
  handleUrlConvert()
})

// ============================================================================
// 3. NUMERIC BASES SUB-CONVERTER STATE & LOGIC
// ============================================================================
const bases = reactive({
  dec: '',
  hex: '',
  bin: '',
  oct: ''
})

const updateFromDecimal = (valStr: string) => {
  if (!valStr) { clearBases(); return }
  const num = parseInt(valStr, 10)
  if (isNaN(num)) return
  bases.dec = valStr
  bases.hex = num.toString(16).toUpperCase()
  bases.bin = num.toString(2)
  bases.oct = num.toString(8)
}

const updateFromHex = (valStr: string) => {
  const cleaned = valStr.replace(/[^0-9a-fA-F]/g, '')
  if (!cleaned) { clearBases(); return }
  const num = parseInt(cleaned, 16)
  if (isNaN(num)) return
  bases.dec = num.toString(10)
  bases.hex = cleaned.toUpperCase()
  bases.bin = num.toString(2)
  bases.oct = num.toString(8)
}

const updateFromBinary = (valStr: string) => {
  const cleaned = valStr.replace(/[^01]/g, '')
  if (!cleaned) { clearBases(); return }
  const num = parseInt(cleaned, 2)
  if (isNaN(num)) return
  bases.dec = num.toString(10)
  bases.hex = num.toString(16).toUpperCase()
  bases.bin = cleaned
  bases.oct = num.toString(8)
}

const updateFromOctal = (valStr: string) => {
  const cleaned = valStr.replace(/[^0-7]/g, '')
  if (!cleaned) { clearBases(); return }
  const num = parseInt(cleaned, 8)
  if (isNaN(num)) return
  bases.dec = num.toString(10)
  bases.hex = num.toString(16).toUpperCase()
  bases.bin = num.toString(2)
  bases.oct = cleaned
}

const clearBases = () => {
  bases.dec = ''
  bases.hex = ''
  bases.bin = ''
  bases.oct = ''
}

// --- Global Clipboard Helper ---
const copyText = async (text: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: 'Copiado!', description: 'Copiado para a área de transferência.', color: 'success' })
  } catch (err) {
    toast.add({ title: 'Erro ao copiar', description: 'Falha ao copiar para clipboard.', color: 'danger' })
  }
}

const pasteToInput = async (callback: (text: string) => void) => {
  try {
    const text = await navigator.clipboard.readText()
    callback(text)
    toast.add({ title: 'Colado!', description: 'Texto colado do clipboard.', color: 'success' })
  } catch (err) {
    toast.add({ title: 'Permissão Negada', description: 'Use Ctrl+V para colar.', color: 'warning' })
  }
}
</script>

<template>
  <div class="space-y-6 py-4">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Conversor de Desenvolvedor
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Central de conversões: codifique textos e arquivos em Base64, formate URLs ou converta bases numéricas em tempo real.
      </p>
    </div>

    <!-- Main Navigation Sub-Converter Tabs -->
    <div class="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
      <button
        :class="activeSubConverter === 'base64' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold border-b-2' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
        class="px-4 py-2 text-sm font-semibold transition-all"
        @click="activeSubConverter = 'base64'"
      >
        Base64 (Texto & Arquivo)
      </button>
      <button
        :class="activeSubConverter === 'url' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold border-b-2' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
        class="px-4 py-2 text-sm font-semibold transition-all"
        @click="activeSubConverter = 'url'"
      >
        URL Encode / Decode
      </button>
      <button
        :class="activeSubConverter === 'bases' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold border-b-2' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
        class="px-4 py-2 text-sm font-semibold transition-all"
        @click="activeSubConverter = 'bases'"
      >
        Bases Numéricas
      </button>
    </div>

    <!-- Sub-Converter Workspaces -->
    <div class="grid grid-cols-1 gap-6">

      <!-- =====================================================================
           SUB-CONVERTER 1: BASE64
           ===================================================================== -->
      <div v-if="activeSubConverter === 'base64'" class="space-y-6">
        <!-- Sub Mode selector: Text vs File -->
        <div class="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-fit">
          <button
            :class="base64Mode === 'text' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500'"
            class="px-4 py-1 text-xs font-semibold rounded-lg transition-all"
            @click="base64Mode = 'text'"
          >
            Texto
          </button>
          <button
            :class="base64Mode === 'file' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500'"
            class="px-4 py-1 text-xs font-semibold rounded-lg transition-all"
            @click="base64Mode = 'file'"
          >
            Arquivo Binário
          </button>
        </div>

        <!-- Base64 TEXT layout -->
        <div v-if="base64Mode === 'text'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <!-- Input -->
          <div class="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg w-fit text-[11px] font-bold">
                <button
                  type="button"
                  :class="!b64Text.isDecoding ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-505'"
                  class="px-2.5 py-1 rounded-md transition-all"
                  @click="b64Text.isDecoding = false"
                >
                  Codificar
                </button>
                <button
                  type="button"
                  :class="b64Text.isDecoding ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-550'"
                  class="px-2.5 py-1 rounded-md transition-all"
                  @click="b64Text.isDecoding = true"
                >
                  Decodificar
                </button>
              </div>
              <div class="flex items-center gap-1.5">
                <UButton
                  icon="i-lucide-clipboard"
                  label="Colar"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  class="rounded-lg"
                  @click="pasteToInput(t => b64Text.input = t)"
                />
                <UButton
                  icon="i-lucide-trash"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  class="rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  @click="b64Text.input = ''"
                />
              </div>
            </div>
            <textarea
              v-model="b64Text.input"
              :placeholder="b64Text.isDecoding ? 'Cole a string Base64 aqui para decodificar...' : 'Digite seu texto normal aqui para codificar...'"
              class="w-full h-[320px] md:h-[380px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 overflow-auto resize-none"
            ></textarea>
            <div class="flex items-center justify-between pt-2">
              <label class="relative inline-flex items-center cursor-pointer select-none">
                <input type="checkbox" v-model="b64Text.urlSafe" class="sr-only peer" />
                <div class="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                <span class="ms-3 text-xs font-semibold text-slate-600 dark:text-slate-400">URL-Safe (RFC 4648)</span>
              </label>
            </div>
          </div>

          <!-- Output -->
          <div class="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{{ b64Text.isDecoding ? 'Texto Decodificado' : 'Resultado Base64' }}</span>
              </h2>
              <UButton
                icon="i-lucide-copy"
                label="Copiar"
                color="neutral"
                variant="ghost"
                size="xs"
                class="rounded-lg"
                :disabled="!b64Text.output"
                @click="copyText(b64Text.output)"
              />
            </div>
            <textarea
              :value="b64Text.output"
              readonly
              placeholder="O resultado aparecerá automaticamente aqui..."
              class="w-full h-[320px] md:h-[380px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-xs sm:text-sm focus:outline-none overflow-auto resize-none select-all"
            ></textarea>
            <div class="pt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              Tamanho: {{ b64Text.output.length }} caracteres
            </div>
          </div>
        </div>

        <!-- Base64 FILE layout -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <!-- File Encoder -->
          <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4 flex flex-col justify-between">
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Arquivo para Base64</h3>
              <div
                @dragover.prevent
                @drop.prevent="onFileDrop"
                class="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-950/10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer relative group"
              >
                <input type="file" @change="onFileChange" class="absolute inset-0 opacity-0 cursor-pointer" />
                <div v-if="!b64File.selectedFile" class="flex flex-col items-center justify-center">
                  <UIcon name="i-lucide-download" class="size-8 text-slate-400 group-hover:text-emerald-500 mb-2" />
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">Arraste ou escolha um arquivo</span>
                  <span class="text-[10px] text-slate-400 mt-1">Imagens, PDFs, áudios (Max: 10MB)</span>
                </div>
                <div v-else class="flex flex-col items-center justify-center">
                  <UIcon name="i-lucide-file" class="size-8 text-emerald-500 mb-2" />
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">{{ b64File.selectedFile.name }}</span>
                  <span class="text-[10px] text-slate-400 mt-1">{{ (b64File.selectedFile.size / 1024).toFixed(1) }} KB</span>
                  <button type="button" @click.stop="removeFile" class="mt-3 text-[10px] font-bold text-rose-500 hover:underline">Remover</button>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer select-none">
                <input type="checkbox" v-model="b64File.includePrefix" class="sr-only peer" />
                <div class="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                <span class="ms-3 text-xs font-semibold text-slate-600 dark:text-slate-400">Incluir prefixo Data URL</span>
              </label>
            </div>
            <div v-if="b64File.fileBase64" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">String Base64</label>
                <UButton icon="i-lucide-copy" label="Copiar" color="primary" variant="subtle" size="xs" @click="copyText(b64File.fileBase64)" />
              </div>
              <textarea :value="b64File.fileBase64" readonly class="w-full h-32 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 font-mono text-[10px] overflow-auto resize-none select-all"></textarea>
            </div>
          </div>

          <!-- File Decoder -->
          <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4 flex flex-col justify-between">
            <div class="space-y-4">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Base64 para Arquivo</h3>
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-700 dark:text-slate-300">Cole a String Base64</span>
                  <UButton icon="i-lucide-clipboard" label="Colar" color="neutral" variant="ghost" size="xs" @click="pasteToInput(t => b64File.decodeBase64 = t)" />
                </div>
                <textarea v-model="b64File.decodeBase64" placeholder="Cole a string completa para recuperar o arquivo..." class="w-full h-32 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[10px] font-mono overflow-auto resize-none"></textarea>
              </div>
              <UFormField label="Nome do Arquivo de Saída">
                <UInput v-model="b64File.decodedFileName" placeholder="Ex: foto_recuperada" class="w-full" />
              </UFormField>
            </div>
            <UButton label="Decodificar e Baixar Arquivo" icon="i-lucide-download" color="primary" class="w-full rounded-xl font-semibold py-2.5 shadow-lg shadow-emerald-500/10" :disabled="!b64File.decodeBase64" @click="downloadDecodedFile" />
          </div>
        </div>
      </div>

      <!-- =====================================================================
           SUB-CONVERTER 2: URL ENCODE/DECODE
           ===================================================================== -->
      <div v-if="activeSubConverter === 'url'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <!-- Input -->
        <div class="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg w-fit text-[11px] font-bold">
              <button
                type="button"
                :class="!urlState.isDecoding ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'"
                class="px-2.5 py-1 rounded-md transition-all"
                @click="urlState.isDecoding = false"
              >
                URL Encode
              </button>
              <button
                type="button"
                :class="urlState.isDecoding ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'"
                class="px-2.5 py-1 rounded-md transition-all"
                @click="urlState.isDecoding = true"
              >
                URL Decode
              </button>
            </div>
            <div class="flex items-center gap-1.5">
              <UButton icon="i-lucide-clipboard" label="Colar" color="neutral" variant="ghost" size="xs" @click="pasteToInput(t => urlState.input = t)" />
              <UButton icon="i-lucide-trash" color="neutral" variant="ghost" size="xs" class="rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20" @click="urlState.input = ''" />
            </div>
          </div>
          <textarea
            v-model="urlState.input"
            :placeholder="urlState.isDecoding ? 'Cole a string codificada para decodificar (ex: texto%20exemplo)...' : 'Cole ou digite o texto normal para codificar...'"
            class="w-full h-[320px] md:h-[380px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 overflow-auto resize-none"
          ></textarea>
        </div>

        <!-- Output -->
        <div class="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{{ urlState.isDecoding ? 'URL Decodificada' : 'URL Codificada' }}</span>
            </h2>
            <UButton icon="i-lucide-copy" label="Copiar" color="neutral" variant="ghost" size="xs" :disabled="!urlState.output" @click="copyText(urlState.output)" />
          </div>
          <textarea
            :value="urlState.output"
            readonly
            placeholder="O resultado aparecerá automaticamente aqui..."
            class="w-full h-[320px] md:h-[380px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-xs sm:text-sm focus:outline-none overflow-auto resize-none select-all"
          ></textarea>
        </div>
      </div>

      <!-- =====================================================================
           SUB-CONVERTER 3: NUMERIC BASES
           ===================================================================== -->
      <div v-if="activeSubConverter === 'bases'" class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 max-w-2xl mx-auto w-full">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UIcon name="i-lucide-binary" class="text-emerald-500 size-4" />
            <span>Conversor de Bases Numéricas</span>
          </h2>
          <UButton label="Limpar Bases" icon="i-lucide-trash" color="neutral" variant="subtle" size="xs" class="text-rose-500" @click="clearBases" />
        </div>

        <div class="space-y-4">
          <!-- Decimal -->
          <UFormField label="Decimal (Base 10)">
            <div class="flex gap-2">
              <UInput
                :value="bases.dec"
                @input="e => updateFromDecimal((e.target as HTMLInputElement).value)"
                placeholder="Ex: 255"
                class="flex-1 font-mono"
              />
              <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="sm" :disabled="!bases.dec" @click="copyText(bases.dec)" />
            </div>
          </UFormField>

          <!-- Hexadecimal -->
          <UFormField label="Hexadecimal (Base 16)">
            <div class="flex gap-2">
              <UInput
                :value="bases.hex"
                @input="e => updateFromHex((e.target as HTMLInputElement).value)"
                placeholder="Ex: FF"
                class="flex-1 font-mono"
              />
              <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="sm" :disabled="!bases.hex" @click="copyText(bases.hex)" />
            </div>
          </UFormField>

          <!-- Binary -->
          <UFormField label="Binário (Base 2)">
            <div class="flex gap-2">
              <UInput
                :value="bases.bin"
                @input="e => updateFromBinary((e.target as HTMLInputElement).value)"
                placeholder="Ex: 11111111"
                class="flex-1 font-mono"
              />
              <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="sm" :disabled="!bases.bin" @click="copyText(bases.bin)" />
            </div>
          </UFormField>

          <!-- Octal -->
          <UFormField label="Octal (Base 8)">
            <div class="flex gap-2">
              <UInput
                :value="bases.oct"
                @input="e => updateFromOctal((e.target as HTMLInputElement).value)"
                placeholder="Ex: 377"
                class="flex-1 font-mono"
              />
              <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="sm" :disabled="!bases.oct" @click="copyText(bases.oct)" />
            </div>
          </UFormField>
        </div>
      </div>

    </div>

    <!-- Educational AdSense Placeholder -->
    <AdBlock id="adsense-conversor-footer" type="leaderboard" />
  </div>
</template>
