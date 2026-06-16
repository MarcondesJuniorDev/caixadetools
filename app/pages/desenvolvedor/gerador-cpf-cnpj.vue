<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useSeoMeta, useHead, useToast } from '#imports'

useSeoMeta({
  title: 'Gerador e Validador de CPF / CNPJ Online (Padrão Alfanumérico 2026)',
  description: 'Gere e valide CPFs e CNPJs online. Totalmente adaptado para o novo padrão de CNPJ Alfanumérico da Receita Federal (vigente a partir de 2026).'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/desenvolvedor/gerador-cpf-cnpj' }
  ]
})

const toast = useToast()

const activeTab = ref('generator') // 'generator' | 'validator'

// --- Generator State ---
const genSettings = reactive({
  docType: 'cpf', // 'cpf' | 'cnpj'
  formatted: true,
  quantity: 1,
  cpfRegion: 'any', // 'any' | '0'-'9'
  cnpjType: 'alphanumeric' // 'numeric' | 'alphanumeric'
})

const generatedDocs = ref<string[]>([])

// --- Validator State ---
const valInput = ref('')
const valResult = reactive({
  checked: false,
  isValid: false,
  type: '', // 'CPF' | 'CNPJ Numérico' | 'CNPJ Alfanumérico'
  formatted: false,
  region: '', // For CPF
  details: {
    root: '',
    branch: '',
    dv: ''
  }
})

// --- Region list for CPF issuing ---
const regions = [
  { label: 'Qualquer Região', value: 'any' },
  { label: 'RS (0ª Região)', value: '0' },
  { label: 'DF, GO, MS, MT, TO (1ª Região)', value: '1' },
  { label: 'AC, AM, AP, PA, RO, RR (2ª Região)', value: '2' },
  { label: 'CE, MA, PI (3ª Região)', value: '3' },
  { label: 'AL, PB, PE, RN (4ª Região)', value: '4' },
  { label: 'BA, SE (5ª Região)', value: '5' },
  { label: 'MG (6ª Região)', value: '6' },
  { label: 'ES, RJ (7ª Região)', value: '7' },
  { label: 'SP (8ª Região)', value: '8' },
  { label: 'PR, SC (9ª Região)', value: '9' }
]

// --- Helper Math Algorithms ---

// CNPJ DV Calculation (Supports Alphanumeric ASCII-48 rules)
const calculateCNPJDV1 = (base12: string): number => {
  const weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const code = base12.charCodeAt(i)
    const val = code - 48 // ASCII subtraction (IN RFB 2229/2024 rule)
    sum += val * weights[i]
  }
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

const calculateCNPJDV2 = (base13: string): number => {
  const weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 13; i++) {
    const code = base13.charCodeAt(i)
    const val = code - 48 // ASCII subtraction
    sum += val * weights[i]
  }
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

// CPF Issuing Region Lookup
const getCPFIssuingRegion = (cpf: string): string => {
  if (cpf.length !== 11) return ''
  const digit = cpf[8]
  const regionNames: Record<string, string> = {
    '1': 'DF, GO, MS, MT, TO (1ª Região)',
    '2': 'AC, AM, AP, PA, RO, RR (2ª Região)',
    '3': 'CE, MA, PI (3ª Região)',
    '4': 'AL, PB, PE, RN (4ª Região)',
    '5': 'BA, SE (5ª Região)',
    '6': 'MG (6ª Região)',
    '7': 'ES, RJ (7ª Região)',
    '8': 'SP (8ª Região)',
    '9': 'PR, SC (9ª Região)',
    '0': 'RS (0ª Região)'
  }
  return regionNames[digit] || 'Região desconhecida'
}

// --- Generator Functions ---

const generateCPF = (region: string = 'any'): string => {
  let base9 = ''
  for (let i = 0; i < 8; i++) {
    base9 += Math.floor(Math.random() * 10)
  }
  base9 += region === 'any' ? Math.floor(Math.random() * 10) : region

  // 1st DV
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number(base9[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  const dv1 = (remainder === 10 || remainder === 11) ? 0 : remainder

  // 2nd DV
  const base10 = base9 + dv1
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number(base10[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  const dv2 = (remainder === 10 || remainder === 11) ? 0 : remainder

  return base10 + dv2
}

const generateCNPJ = (alphanumeric: boolean = false): string => {
  let base12 = ''
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'

  for (let i = 0; i < 12; i++) {
    if (alphanumeric) {
      // Create a balanced mix containing some letters for realistic testing
      const useLetter = Math.random() < 0.25 // 25% chance of letter
      if (useLetter && i < 8) { // Prefer letters in the root
        // Letters are from A-Z (ASCII 65-90)
        const letterIndex = 10 + Math.floor(Math.random() * 26) // A is at index 10 in chars
        base12 += chars[letterIndex]
      } else {
        base12 += digits[Math.floor(Math.random() * 10)]
      }
    } else {
      base12 += digits[Math.floor(Math.random() * 10)]
    }
  }

  const dv1 = calculateCNPJDV1(base12)
  const dv2 = calculateCNPJDV2(base12 + dv1)

  return base12 + dv1 + dv2
}

// Formatting functions
const formatCPF = (cpf: string): string => {
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`
}

const formatCNPJ = (cnpj: string): string => {
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`
}

const handleGenerate = () => {
  const docs: string[] = []
  const count = Math.min(Math.max(genSettings.quantity, 1), 20) // Limit to 20

  for (let i = 0; i < count; i++) {
    let doc = ''
    if (genSettings.docType === 'cpf') {
      doc = generateCPF(genSettings.cpfRegion)
      if (genSettings.formatted) doc = formatCPF(doc)
    } else {
      doc = generateCNPJ(genSettings.cnpjType === 'alphanumeric')
      if (genSettings.formatted) doc = formatCNPJ(doc)
    }
    docs.push(doc)
  }

  generatedDocs.value = docs
  toast.add({
    title: 'Gerado com sucesso',
    description: `${count} documento(s) gerado(s).`,
    color: 'success'
  })
}

// --- Validation Functions ---

const handleValidate = () => {
  const raw = valInput.value.trim()
  if (!raw) {
    valResult.checked = false
    return
  }

  const hasFormatting = /[\.\-\/]/.test(raw)
  valResult.formatted = hasFormatting

  // Clean raw inputs
  const clean = raw.replace(/[^\dA-Za-z]/g, '').toUpperCase()

  // 1. Check CPF
  if (clean.length === 11) {
    const isAllDigitsSame = /^(\d)\1{10}$/.test(clean)
    if (isAllDigitsSame) {
      setInvalidValidation('CPF')
      return
    }

    // Calculate DVs
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += Number(clean[i]) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    let dv1 = (remainder === 10 || remainder === 11) ? 0 : remainder

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += Number(clean[i]) * (11 - i)
    }
    remainder = (sum * 10) % 11
    let dv2 = (remainder === 10 || remainder === 11) ? 0 : remainder

    const calculatedValid = Number(clean[9]) === dv1 && Number(clean[10]) === dv2

    if (calculatedValid) {
      valResult.checked = true
      valResult.isValid = true
      valResult.type = 'CPF'
      valResult.region = getCPFIssuingRegion(clean)
      valResult.details = {
        root: formatCPF(clean).slice(0, 11),
        branch: '',
        dv: clean.slice(9)
      }
    } else {
      setInvalidValidation('CPF')
    }
  } 
  // 2. Check CNPJ
  else if (clean.length === 14) {
    const isAlphanumeric = /[A-Z]/.test(clean.slice(0, 12))
    
    // Check characters pattern
    const regexValid = /^[A-Z0-9]{12}\d{2}$/.test(clean)
    if (!regexValid) {
      setInvalidValidation(isAlphanumeric ? 'CNPJ Alfanumérico' : 'CNPJ Numérico')
      return
    }

    const dv1 = calculateCNPJDV1(clean.slice(0, 12))
    const dv2 = calculateCNPJDV2(clean.slice(0, 13))

    const calculatedValid = Number(clean[12]) === dv1 && Number(clean[13]) === dv2

    if (calculatedValid) {
      valResult.checked = true
      valResult.isValid = true
      valResult.type = isAlphanumeric ? 'CNPJ Alfanumérico (Novo padrão 2026)' : 'CNPJ Numérico (Clássico)'
      valResult.region = ''
      valResult.details = {
        root: clean.slice(0, 8),
        branch: clean.slice(8, 12),
        dv: clean.slice(12)
      }
    } else {
      setInvalidValidation(isAlphanumeric ? 'CNPJ Alfanumérico' : 'CNPJ Numérico')
    }
  } 
  // 3. Size mismatch
  else {
    valResult.checked = true
    valResult.isValid = false
    valResult.type = 'Inválido'
    valResult.region = ''
    valResult.details = { root: '', branch: '', dv: '' }
  }
}

const setInvalidValidation = (type: string) => {
  valResult.checked = true
  valResult.isValid = false
  valResult.type = type
  valResult.region = ''
  valResult.details = { root: '', branch: '', dv: '' }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({
      title: 'Copiado!',
      description: 'Documento copiado com sucesso.',
      color: 'success'
    })
  } catch (err) {
    toast.add({
      title: 'Erro ao copiar',
      description: 'Falha ao copiar para clipboard.',
      color: 'danger'
    })
  }
}

const copyAll = async () => {
  if (generatedDocs.value.length === 0) return
  const text = generatedDocs.value.join('\n')
  await copyToClipboard(text)
  toast.add({
    title: 'Copiado tudo!',
    description: 'Todos os documentos copiados para clipboard.',
    color: 'success'
  })
}

// Watchers
watch(valInput, () => {
  if (!valInput.value) {
    valResult.checked = false
  } else {
    handleValidate()
  }
})

// Auto-run first generation on load
handleGenerate()
</script>

<template>
  <div class="space-y-6 py-4">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Gerador & Validador de CPF / CNPJ
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Gere e valide documentos de teste para desenvolvimento. Totalmente atualizado com o padrão de <strong>CNPJ Alfanumérico de 2026</strong>.
      </p>
    </div>

    <!-- Mode Selector Tabs -->
    <div class="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl w-fit">
      <button
        :class="activeTab === 'generator' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950'"
        class="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
        @click="activeTab = 'generator'"
      >
        Gerar Documentos
      </button>
      <button
        :class="activeTab === 'validator' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950'"
        class="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
        @click="activeTab = 'validator'"
      >
        Validar Documento
      </button>
    </div>

    <!-- Active Panels Grid -->
    <div class="grid grid-cols-1 gap-6">
      
      <!-- 1. Generator Panel -->
      <div v-if="activeTab === 'generator'" class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        <!-- Generation Controls Card -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-5">
          <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UIcon name="i-lucide-wrench" class="text-emerald-500 size-4" />
            <span>Configurações do Gerador</span>
          </h2>

          <div class="space-y-4">
            <!-- Doc Type -->
            <UFormField label="Tipo de Documento">
              <div class="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full">
                <button
                  type="button"
                  :class="genSettings.docType === 'cpf' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
                  class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
                  @click="genSettings.docType = 'cpf'"
                >
                  CPF
                </button>
                <button
                  type="button"
                  :class="genSettings.docType === 'cnpj' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'"
                  class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
                  @click="genSettings.docType = 'cnpj'"
                >
                  CNPJ
                </button>
              </div>
            </UFormField>

            <!-- Format toggle -->
            <UFormField label="Formatação">
              <div class="flex items-center gap-4">
                <label class="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    v-model="genSettings.formatted"
                    class="sr-only peer"
                  />
                  <div class="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                  <span class="ms-3 text-xs font-medium text-slate-600 dark:text-slate-400">Pontuação (Ex: 00.000.000/0001-00)</span>
                </label>
              </div>
            </UFormField>

            <!-- CPF-specific: region -->
            <UFormField v-if="genSettings.docType === 'cpf'" label="Região Fiscal de Emissão (UF)">
              <select
                v-model="genSettings.cpfRegion"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
              >
                <option v-for="reg in regions" :key="reg.value" :value="reg.value">
                  {{ reg.label }}
                </option>
              </select>
            </UFormField>

            <!-- CNPJ-specific: format type -->
            <UFormField v-if="genSettings.docType === 'cnpj'" label="Tipo de CNPJ">
              <div class="flex flex-col gap-2">
                <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="radio"
                    value="alphanumeric"
                    v-model="genSettings.cnpjType"
                    class="text-emerald-500 focus:ring-emerald-500 bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                  <span class="font-semibold text-slate-800 dark:text-slate-200">Alfanumérico (Padrão 2026 - Recomendado)</span>
                </label>
                <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="radio"
                    value="numeric"
                    v-model="genSettings.cnpjType"
                    class="text-emerald-500 focus:ring-emerald-500 bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  />
                  <span>Numérico (Clássico - Apenas dígitos)</span>
                </label>
              </div>
            </UFormField>

            <!-- Quantity -->
            <UFormField label="Quantidade a gerar">
              <div class="flex items-center gap-3">
                <input
                  type="range"
                  v-model.number="genSettings.quantity"
                  min="1"
                  max="20"
                  class="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span class="text-xs font-mono font-bold w-6 text-right">{{ genSettings.quantity }}</span>
              </div>
            </UFormField>
          </div>

          <div class="pt-2">
            <UButton
              label="Gerar Documentos"
              icon="i-lucide-wrench"
              color="primary"
              class="w-full rounded-xl font-semibold justify-center py-2.5 shadow-lg shadow-emerald-500/10"
              @click="handleGenerate"
            />
          </div>
        </div>

        <!-- Output Display Card -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span class="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span>Documentos Gerados</span>
            </h2>
            <UButton
              v-if="generatedDocs.length > 1"
              icon="i-lucide-copy"
              label="Copiar Tudo"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-lg"
              @click="copyAll"
            />
          </div>

          <!-- Document list layout -->
          <div class="space-y-2 max-h-[300px] overflow-auto pr-1">
            <div
              v-for="(doc, idx) in generatedDocs"
              :key="idx"
              class="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:border-emerald-500/35 transition-colors group"
            >
              <span class="font-mono text-sm tracking-wide text-slate-800 dark:text-slate-200 select-all">
                {{ doc }}
              </span>
              <UButton
                icon="i-lucide-copy"
                color="neutral"
                variant="ghost"
                size="xs"
                class="rounded-lg opacity-60 group-hover:opacity-100 hover:text-emerald-500 transition-opacity"
                @click="copyToClipboard(doc)"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- 2. Validator Panel -->
      <div v-else class="max-w-xl mx-auto w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6">
        <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <UIcon name="i-lucide-user-check" class="text-emerald-500 size-4" />
          <span>Validar Documento Existente</span>
        </h2>

        <!-- Input Box -->
        <UFormField label="Insira o CPF ou CNPJ">
          <UInput
            v-model="valInput"
            placeholder="Digite com ou sem pontuação para validar..."
            class="w-full text-lg font-mono tracking-wide"
            autofocus
          />
        </UFormField>

        <!-- Validation Result Card -->
        <div v-if="valResult.checked" class="transition-all duration-300">
          <!-- Valid -->
          <div
            v-if="valResult.isValid"
            class="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4"
          >
            <div class="flex items-start gap-3 text-emerald-800 dark:text-emerald-300">
              <UIcon name="i-lucide-check-circle" class="size-6 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 class="font-bold text-base">Documento Válido!</h3>
                <p class="text-xs mt-0.5 opacity-90">O cálculo do dígito verificador confere com as regras fiscais.</p>
              </div>
            </div>

            <div class="border-t border-emerald-200/50 dark:border-emerald-800/30 pt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span class="text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider text-[10px]">Tipo</span>
                <p class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{{ valResult.type }}</p>
              </div>
              <div v-if="valResult.region">
                <span class="text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider text-[10px]">Origem Fiscal</span>
                <p class="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{{ valResult.region }}</p>
              </div>
              <div class="col-span-2">
                <span class="text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider text-[10px]">Partição Estrutural</span>
                <p class="font-mono text-slate-700 dark:text-slate-300 mt-1 flex flex-wrap gap-2">
                  <span v-if="valResult.details.root" class="bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded" title="Raiz (Primeiros 8 caracteres)">
                    Raiz: {{ valResult.details.root }}
                  </span>
                  <span v-if="valResult.details.branch" class="bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded" title="Ordem/Estabelecimento (Filiais)">
                    Ordem: {{ valResult.details.branch }}
                  </span>
                  <span class="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-bold" title="Dígito Verificador">
                    DV: {{ valResult.details.dv }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- Invalid -->
          <div
            v-else
            class="p-5 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20 flex items-start gap-3 text-rose-800 dark:text-rose-300"
          >
            <UIcon name="i-lucide-alert-circle" class="size-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-bold text-base">Documento Inválido!</h3>
              <p class="text-xs mt-1 leading-relaxed">
                O formato ou o dígito verificador recalculado não correspondem ao padrão oficial do <strong>{{ valResult.type }}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Instructions / Info block on CNPJ Alfanumérico -->
    <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-4">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <UIcon name="i-lucide-info" class="text-emerald-500 size-4" />
        <span>Sobre a mudança do CNPJ Alfanumérico (2026)</span>
      </h3>
      <div class="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
        <p>
          Definido pela <strong>Instrução Normativa RFB nº 2.229/2024</strong>, a partir de <strong>julho de 2026</strong>, a Receita Federal do Brasil começará a emitir CNPJs alfanuméricos. 
        </p>
        <p>
          O CNPJ continuará a ter 14 posições (com a mesma máscara de pontuação `XX.XXX.XXX/XXXX-XX`). No entanto, os primeiros 12 dígitos (raiz + ordem de estabelecimento) poderão conter letras maiúsculas (de A a Z) e números (de 0 a 9). Os últimos 2 dígitos continuam sendo obrigatoriamente numéricos e calculados utilizando o algoritmo **Módulo 11**, convertendo as letras para os seus respectivos valores ASCII menos 48 (ex: A = 17, B = 18, Z = 42).
        </p>
        <p class="font-semibold text-emerald-600 dark:text-emerald-400">
          Nota: CNPJs numéricos emitidos anteriormente a julho de 2026 continuarão válidos e sem alterações!
        </p>
      </div>
    </div>
  </div>
</template>
