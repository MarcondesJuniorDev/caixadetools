<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useSeoMeta, useHead, useToast } from '#imports'
import QRCode from 'qrcode'

useSeoMeta({
  title: 'Simulador de Pix e Gerador de QR Code Estático Online',
  description: 'Gere QR Codes Pix estáticos "Copia e Cola" gratuitamente. Simule como os dados aparecerão no aplicativo do banco pagador com segurança.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/financas/simulador-pix' }
  ]
})

const toast = useToast()

// --- Pix Generator Inputs ---
const inputs = reactive({
  keyType: 'cpf', // 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  keyValue: '',
  name: '',
  city: '',
  amount: undefined as number | undefined,
  description: '',
  txid: '***'
})

const qrCodeDataUrl = ref('')
const pixCopiaCola = ref('')

// --- TLV & CRC16 Formatting Helpers ---

const cleanString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^A-Za-z0-9\s]/g, '') // Remove special characters
    .toUpperCase()
}

const formatTLV = (id: string, value: string): string => {
  const len = String(value.length).padStart(2, '0')
  return `${id}${len}${value}`
}

const calculateCRC16 = (str: string): string => {
  let crc = 0xFFFF
  const polynomial = 0x1021
  
  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8)
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF
      } else {
        crc = (crc << 1) & 0xFFFF
      }
    }
  }
  
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

// --- Payload Builder ---
const generatePix = () => {
  if (!inputs.keyValue || !inputs.name || !inputs.city) {
    pixCopiaCola.value = ''
    qrCodeDataUrl.value = ''
    return
  }

  try {
    let cleanKey = inputs.keyValue.trim()
    if (inputs.keyType === 'cpf' || inputs.keyType === 'cnpj') {
      cleanKey = cleanKey.replace(/\D/g, '') // Digits only
    } else if (inputs.keyType === 'phone') {
      cleanKey = cleanKey.replace(/[^\d+]/g, '') // Keep + and digits
      if (!cleanKey.startsWith('+')) {
        cleanKey = '+55' + cleanKey // Fallback to Brazil code
      }
    }

    const cleanName = cleanString(inputs.name).slice(0, 25).trim()
    const cleanCity = cleanString(inputs.city).slice(0, 15).trim()
    const cleanTxid = (inputs.txid || '***').replace(/\s/g, '').slice(0, 25).trim()

    let payload = ''

    // 00: Payload Format Indicator
    payload += formatTLV('00', '01')

    // 26: Merchant Account Information
    let merchantInfo = formatTLV('00', 'br.gov.bcb.pix')
    merchantInfo += formatTLV('01', cleanKey)
    if (inputs.description.trim()) {
      const cleanDesc = cleanString(inputs.description).slice(0, 25).trim()
      merchantInfo += formatTLV('02', cleanDesc)
    }
    payload += formatTLV('26', merchantInfo)

    // 52: Merchant Category Code (Default: 0000)
    payload += formatTLV('52', '0000')

    // 53: Transaction Currency (BRL: 986)
    payload += formatTLV('53', '986')

    // 54: Transaction Amount
    if (inputs.amount && inputs.amount > 0) {
      payload += formatTLV('54', inputs.amount.toFixed(2))
    }

    // 58: Country Code (BR)
    payload += formatTLV('58', 'BR')

    // 59: Merchant Name
    payload += formatTLV('59', cleanName)

    // 60: Merchant City
    payload += formatTLV('60', cleanCity)

    // 62: Additional Data Field Template (TxID)
    const additionalData = formatTLV('05', cleanTxid)
    payload += formatTLV('62', additionalData)

    // 63: CRC16
    payload += '6304'
    const crc = calculateCRC16(payload)
    pixCopiaCola.value = payload + crc

    // Generate QR Code on client side
    if (import.meta.client) {
      QRCode.toDataURL(pixCopiaCola.value, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff'
        }
      })
      .then(url => {
        qrCodeDataUrl.value = url
      })
      .catch(err => {
        console.error('QR Code error:', err)
      })
    }
  } catch (err) {
    console.error('Pix generation error:', err)
  }
}

// Watch inputs to generate QR Code reactively
watch(inputs, () => {
  generatePix()
}, { deep: true })

const loadSample = () => {
  inputs.keyType = 'cpf'
  inputs.keyValue = '123.456.789-00'
  inputs.name = 'JOAO SILVA MEDEIROS'
  inputs.city = 'SAO PAULO'
  inputs.amount = 150.00
  inputs.description = 'Aporte Caixa de Tools'
  inputs.txid = 'LOJA001'
  generatePix()
  toast.add({
    title: 'Exemplo Carregado',
    description: 'Os campos foram preenchidos com dados fictícios de teste.',
    color: 'success'
  })
}

const copyCopiaCola = async () => {
  if (!pixCopiaCola.value) return
  try {
    await navigator.clipboard.writeText(pixCopiaCola.value)
    toast.add({
      title: 'Copiado!',
      description: 'Código Pix Copia e Cola copiado para a área de transferência.',
      color: 'success'
    })
  } catch (err) {
    toast.add({
      title: 'Erro ao copiar',
      description: 'Falha ao copiar para o clipboard.',
      color: 'danger'
    })
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

onMounted(() => {
  loadSample() // Pre-load details
})
</script>

<template>
  <div class="space-y-6 py-4">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Simulador de Pix & BR Code
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Gere códigos Pix estáticos "Copia e Cola" e QR Codes de recebimento de forma instantânea e totalmente privada.
        </p>
      </div>
      <UButton
        label="Carregar Dados de Exemplo"
        icon="i-lucide-file-text"
        color="neutral"
        variant="subtle"
        size="sm"
        class="w-fit rounded-lg"
        @click="loadSample"
      />
    </div>

    <!-- Simulator Layout Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Inputs (Left - 6 Cols) -->
      <div class="lg:col-span-6 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <UIcon name="i-lucide-wrench" class="text-emerald-500 size-4" />
          <span>Configurar Recebimento</span>
        </h2>

        <div class="space-y-4">
          <!-- Key Type -->
          <UFormField label="Tipo de Chave Pix">
            <select
              v-model="inputs.keyType"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="phone">Telefone Celular</option>
              <option value="random">Chave Aleatória (EVP)</option>
            </select>
          </UFormField>

          <!-- Key Value -->
          <UFormField label="Chave Pix">
            <UInput
              v-model="inputs.keyValue"
              :placeholder="
                inputs.keyType === 'cpf' ? '000.000.000-00' :
                inputs.keyType === 'cnpj' ? '00.000.000/0000-00' :
                inputs.keyType === 'phone' ? '+55 (11) 99999-9999' :
                inputs.keyType === 'email' ? 'recebedor@exemplo.com' :
                'Chave com letras e traços'
              "
              class="w-full font-mono"
            />
            <span class="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
              {{
                inputs.keyType === 'phone' ? 'Utilize o DDI (+55) seguido do DDD e número de celular.' :
                'Certifique-se de usar a chave exatamente como cadastrada no seu banco.'
              }}
            </span>
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Merchant Name -->
            <UFormField label="Nome do Beneficiário" required>
              <UInput
                v-model="inputs.name"
                placeholder="Ex: JOAO S MEDEIROS"
                class="w-full"
                maxlength="25"
              />
            </UFormField>

            <!-- Merchant City -->
            <UFormField label="Cidade do Beneficiário" required>
              <UInput
                v-model="inputs.city"
                placeholder="Ex: SAO PAULO"
                class="w-full"
                maxlength="15"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Amount -->
            <UFormField label="Valor da Cobrança (Opcional)">
              <div class="relative">
                <span class="absolute inset-y-0 start-0 flex items-center ps-3 text-xs text-slate-400 font-semibold">R$</span>
                <input
                  type="number"
                  v-model.number="inputs.amount"
                  step="0.01"
                  placeholder="0,00"
                  class="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
                  min="0"
                />
              </div>
            </UFormField>

            <!-- TxID -->
            <UFormField label="Identificador da Transação (TxID)">
              <UInput
                v-model="inputs.txid"
                placeholder="Ex: *** ou LOJA01"
                class="w-full font-mono"
                maxlength="25"
              />
            </UFormField>
          </div>

          <!-- Description -->
          <UFormField label="Descrição / Mensagem (Opcional)">
            <UInput
              v-model="inputs.description"
              placeholder="Ex: Servico Web"
              class="w-full"
              maxlength="25"
            />
          </UFormField>
        </div>
      </div>

      <!-- Preview Mockup (Right - 6 Cols) -->
      <div class="lg:col-span-6 space-y-6">
        
        <!-- Interactive Preview -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider self-start">
            QR Code Gerado
          </h3>

          <div v-if="qrCodeDataUrl" class="bg-white p-4 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 flex items-center justify-center">
            <img :src="qrCodeDataUrl" alt="QR Code Pix" class="size-52 sm:size-60 select-none" />
          </div>
          <div v-else class="h-52 sm:size-60 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs p-6 bg-slate-50/50 dark:bg-slate-950/20">
            <UIcon name="i-lucide-qr-code" class="size-10 text-slate-300 dark:text-slate-700 mb-2" />
            <span>Preencha a Chave, Nome e Cidade para renderizar o QR Code.</span>
          </div>

          <!-- Pix Copia e Cola String Box -->
          <div v-if="pixCopiaCola" class="w-full space-y-2 text-left">
            <div class="flex items-center justify-between">
              <label class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pix Copia e Cola</label>
              <UButton
                icon="i-lucide-copy"
                label="Copiar Código"
                color="primary"
                variant="subtle"
                size="xs"
                class="rounded-lg"
                @click="copyCopiaCola"
              />
            </div>
            <textarea
              :value="pixCopiaCola"
              readonly
              class="w-full h-20 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400 font-mono text-[10px] sm:text-xs focus:outline-none overflow-auto resize-none select-all"
            ></textarea>
          </div>
        </div>

        <!-- Receipt Simulation Card (Smartphone layout preview) -->
        <div v-if="pixCopiaCola" class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <UIcon name="i-lucide-info" class="text-emerald-500 size-4" />
            <span>Simulador de Tela do Pagador (App do Banco)</span>
          </h3>

          <div class="max-w-[280px] mx-auto p-5 rounded-3xl border-4 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-md font-sans text-xs space-y-4">
            <!-- Simulated Bank Header -->
            <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span class="font-bold text-slate-800 dark:text-white">Confirmar Pix</span>
              <span class="text-[9px] text-emerald-500 font-bold">BR Code Estático</span>
            </div>

            <!-- Value Row -->
            <div class="text-center py-2">
              <span class="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Valor a Pagar</span>
              <h4 class="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">
                {{ inputs.amount && inputs.amount > 0 ? formatCurrency(inputs.amount) : 'R$ (Inserido pelo Pagador)' }}
              </h4>
            </div>

            <!-- Info Rows -->
            <div class="space-y-2.5 text-[10px] border-t border-slate-200/50 dark:border-slate-800/50 pt-3 text-slate-600 dark:text-slate-400">
              <div>
                <span class="text-slate-400 font-semibold block uppercase text-[8px] tracking-wider">Beneficiário</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 block text-xs">{{ inputs.name.toUpperCase() }}</span>
              </div>
              <div>
                <span class="text-slate-400 font-semibold block uppercase text-[8px] tracking-wider">Chave Pix</span>
                <span class="font-mono text-slate-700 dark:text-slate-300 block break-all">{{ inputs.keyValue }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="text-slate-400 font-semibold block uppercase text-[8px] tracking-wider">Cidade</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200 block">{{ inputs.city.toUpperCase() }}</span>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block uppercase text-[8px] tracking-wider">TxID</span>
                  <span class="font-mono text-slate-700 dark:text-slate-300 block">{{ inputs.txid }}</span>
                </div>
              </div>
              <div v-if="inputs.description">
                <span class="text-slate-400 font-semibold block uppercase text-[8px] tracking-wider">Descrição</span>
                <span class="text-slate-800 dark:text-slate-200 block italic">"{{ inputs.description }}"</span>
              </div>
            </div>

            <!-- Fake Action button -->
            <button disabled class="w-full py-2 bg-emerald-500 text-white font-bold rounded-xl text-center select-none opacity-90 mt-2">
              Confirmar Pagamento
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Educational Block -->
    <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-4">
      <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <UIcon name="i-lucide-info" class="text-emerald-500 size-4" />
        <span>Como funciona o Pix Estático?</span>
      </h3>
      <div class="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
        <p>
          O Pix Estático é baseado no padrão **BR Code** (derivado do padrão internacional EMV Co) e é ideal para cobranças rápidas ou fixas. Ele armazena as informações básicas da transação (como a sua chave Pix, o nome do beneficiário, a cidade e um valor opcional) estruturadas em campos TLV (Tag, Length, Value). 
        </p>
        <p>
          O código termina com uma assinatura matemática de verificação chamada **CRC16 (Cyclic Redundancy Check)** de padrão CCITT-FALSE. É esse checksum que garante ao aplicativo do banco que o código gerado é autêntico e não foi corrompido ou alterado maliciosamente.
        </p>
      </div>
    </div>
  </div>
</template>
