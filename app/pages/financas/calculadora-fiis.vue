<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useSeoMeta, useHead, useToast } from '#imports'

useSeoMeta({
  title: 'Calculadora de FIIs Online - Simular Efeito Bola de Neve',
  description: 'Descubra quantas cotas você precisa para criar uma bola de neve financeira, onde os dividendos compram novas cotas de Fundos Imobiliários automaticamente.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/financas/calculadora-fiis' }
  ]
})

const toast = useToast()

// --- State ---
const ticker = ref('MXRF11')
const price = ref(10.05)
const dividend = ref(0.09)
const currentShares = ref(10)
const monthlyContribution = ref(200)

const loading = ref(false)
const error = ref<string | null>(null)
const isDemoData = ref(false)
const userToken = ref('')
const showToken = ref(false)
const isSettingsOpen = ref(false)
const history = ref<Array<{ symbol: string; name: string; price: number; dividend: number; timestamp: number }>>([])
const isCopied = ref(false)
const openFaqIndex = ref<number | null>(null)

// --- Popular FIIs ---
const popularFiis = [
  { symbol: 'MXRF11', name: 'Maxi Renda FII', price: 10.05, dividend: 0.09, type: 'Papel' },
  { symbol: 'HGLG11', name: 'CGG Logística FII', price: 163.50, dividend: 1.10, type: 'Tijolo (Galpões)' },
  { symbol: 'XPML11', name: 'XP Malls FII', price: 112.20, dividend: 0.92, type: 'Tijolo (Shoppings)' },
  { symbol: 'CPTS11', name: 'Capitânia Securities II', price: 8.10, dividend: 0.07, type: 'Papel' },
  { symbol: 'KNIP11', name: 'Kinea Índices de Preços', price: 95.80, dividend: 0.80, type: 'Papel' },
  { symbol: 'VISC11', name: 'Vinci Shopping Centers', price: 115.40, dividend: 0.85, type: 'Tijolo (Shoppings)' },
  { symbol: 'BTLG11', name: 'BTG Pactual Logística', price: 102.50, dividend: 0.78, type: 'Tijolo (Galpões)' }
]

// --- Calculations ---
const magicNumber = computed(() => {
  const priceVal = Number(price.value) || 0
  const divVal = Number(dividend.value) || 0
  if (priceVal <= 0 || divVal <= 0) return 0
  return Math.ceil(priceVal / divVal)
})

const totalInvestedNeeded = computed(() => {
  const priceVal = Number(price.value) || 0
  return magicNumber.value * priceVal
})

const monthlyIncomeAtMagic = computed(() => {
  const divVal = Number(dividend.value) || 0
  return magicNumber.value * divVal
})

const yieldOnCost = computed(() => {
  const priceVal = Number(price.value) || 0
  const divVal = Number(dividend.value) || 0
  if (priceVal <= 0) return 0
  return (divVal / priceVal) * 100
})

const monthsToMagicNumber = computed(() => {
  const priceVal = Number(price.value) || 0
  const divVal = Number(dividend.value) || 0
  const sharesVal = Number(currentShares.value) || 0
  const contribVal = Number(monthlyContribution.value) || 0
  const target = magicNumber.value

  if (priceVal <= 0 || divVal <= 0) return 0
  if (target <= 0) return 0
  if (sharesVal >= target) return 0

  let cotas = sharesVal
  let cash = 0
  let months = 0

  // Simulate month by month
  while (cotas < target && months < 1200) {
    months++
    // Receive dividend
    cash += cotas * divVal
    // Add contribution
    cash += contribVal
    // Buy new cotas
    const newCotas = Math.floor(cash / priceVal)
    cotas += newCotas
    cash -= newCotas * priceVal
  }

  return months
})

const formattedEstimation = computed(() => {
  const totalMonths = monthsToMagicNumber.value
  if (totalMonths === 0) return 'Meta Atingida! 🎉'
  if (totalMonths >= 1200) return 'Tempo muito longo.'

  const years = Math.floor(totalMonths / 12)
  const remainingMonths = totalMonths % 12

  let result = ''
  if (years > 0) {
    result += `${years} ${years === 1 ? 'ano' : 'anos'}`
  }
  if (remainingMonths > 0) {
    if (result) result += ' e '
    result += `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
  }
  return result
})

const milestones = computed(() => {
  const div = Number(dividend.value) || 0.01
  const priceVal = Number(price.value) || 10
  const shares = Number(currentShares.value) || 0
  const list = [
    { name: 'Bronze (Cafezinho/Passagem)', targetIncome: 10, color: 'from-amber-600 to-amber-700 font-bold' },
    { name: 'Prata (Streaming/Netflix)', targetIncome: 50, color: 'from-slate-400 to-slate-500 font-bold' },
    { name: 'Ouro (Conta de Luz/Internet)', targetIncome: 150, color: 'from-yellow-500 to-amber-500 font-bold' },
    { name: 'Platina (Rancho de Mês)', targetIncome: 500, color: 'from-teal-400 to-emerald-500 font-bold' },
    { name: 'Número Mágico (1 Cota Grátis)', targetIncome: priceVal, color: 'from-indigo-500 to-purple-500 font-bold' }
  ]

  return list.map((m) => {
    const required = Math.ceil(m.targetIncome / div) || 1
    const progress = shares >= required ? 100 : Math.round((shares / required) * 100)
    const isCompleted = shares >= required

    return {
      ...m,
      required,
      progress,
      isCompleted
    }
  })
})

const simulationPoints = computed(() => {
  const priceVal = Number(price.value) || 0
  const divVal = Number(dividend.value) || 0
  const sharesVal = Number(currentShares.value) || 0
  const contribVal = Number(monthlyContribution.value) || 0

  if (priceVal <= 0 || divVal <= 0) return []

  let cotas = sharesVal
  let cash = 0
  const points = []
  let totalUserInvested = sharesVal * priceVal

  // Initial state (Month 0)
  points.push({
    month: 0,
    cotas,
    cash,
    equity: cotas * priceVal,
    income: cotas * divVal,
    invested: totalUserInvested,
    dividendsReceived: 0,
    cotasBought: 0
  })

  for (let m = 1; m <= 120; m++) {
    // Receive dividends
    const divReceived = cotas * divVal
    cash += divReceived
    
    // Add contribution
    cash += contribVal
    totalUserInvested += contribVal

    // Buy new cotas
    const newCotas = Math.floor(cash / priceVal)
    cotas += newCotas
    cash -= newCotas * priceVal

    points.push({
      month: m,
      cotas,
      cash,
      equity: cotas * priceVal + cash,
      income: cotas * divVal,
      invested: totalUserInvested,
      dividendsReceived: divReceived,
      cotasBought: newCotas
    })
  }

  return points
})

const projectionData = computed(() => {
  const points = simulationPoints.value
  if (points.length === 0) return []

  const targets = [
    { label: '1 Ano', month: 12 },
    { label: '3 Anos', month: 36 },
    { label: '5 Anos', month: 60 },
    { label: '10 Anos', month: 120 }
  ]

  return targets.map((t) => {
    const p = points[t.month]
    return {
      label: t.label,
      cotas: p?.cotas || 0,
      totalInvested: p?.invested || 0,
      totalEquity: p?.equity || 0,
      monthlyIncome: p?.income || 0
    }
  })
})

// --- SVG Chart Calculations ---
const maxEquity = computed(() => {
  const pts = simulationPoints.value
  if (pts.length === 0) return 1
  return Math.max(...pts.map((p) => p.equity)) || 1
})

const width = 500
const height = 180
const padding = { top: 20, right: 20, bottom: 30, left: 10 }

const chartWidth = width - padding.left - padding.right
const chartHeight = height - padding.top - padding.bottom

const svgPoints = computed(() => {
  const pts = simulationPoints.value
  if (pts.length === 0) return []

  return pts.map((p) => {
    const x = padding.left + (p.month / 120) * chartWidth
    const y = padding.top + chartHeight - (p.equity / maxEquity.value) * chartHeight
    return { x, y, ...p }
  })
})

const linePath = computed(() => {
  const pts = svgPoints.value
  if (pts.length === 0) return ''
  return pts
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
})

const areaPath = computed(() => {
  const path = linePath.value
  if (!path) return ''
  const startX = svgPoints.value[0].x
  const endX = svgPoints.value[svgPoints.value.length - 1].x
  const bottomY = padding.top + chartHeight
  return `${path} L ${endX.toFixed(1)} ${bottomY} L ${startX.toFixed(1)} ${bottomY} Z`
})

const milestoneDots = computed(() => {
  const pts = svgPoints.value
  if (pts.length === 0) return []

  const indices = [12, 36, 60, 120]
  return indices
    .map((idx) => {
      const p = pts[idx]
      if (!p) return null
      return {
        label: idx === 12 ? '1a' : idx === 36 ? '3a' : idx === 60 ? '5a' : '10a',
        ...p
      }
    })
    .filter(Boolean)
})

// --- Formatting Helpers ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatCurrencyCompact = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
}

// --- History Methods ---
const addToHistory = (symbol: string, lastPrice: number, lastDividend: number, name = '') => {
  const uppercaseSymbol = symbol.toUpperCase()
  history.value = history.value.filter((item) => item.symbol !== uppercaseSymbol)

  history.value.unshift({
    symbol: uppercaseSymbol,
    name: name || `${uppercaseSymbol} FII`,
    price: lastPrice,
    dividend: lastDividend,
    timestamp: Date.now()
  })

  if (history.value.length > 5) {
    history.value.pop()
  }
  localStorage.setItem('fii_history', JSON.stringify(history.value))
}

const clearHistory = () => {
  history.value = []
  localStorage.removeItem('fii_history')
}

// --- Search Action ---
const searchTicker = async (tickerSymbol: string) => {
  if (!tickerSymbol) return

  const cleanSymbol = tickerSymbol.trim().toUpperCase()
  ticker.value = cleanSymbol
  loading.value = true
  error.value = null
  isDemoData.value = false

  const tokenToUse = userToken.value

  if (!tokenToUse) {
    const popular = popularFiis.find((f) => f.symbol === cleanSymbol)
    if (popular) {
      price.value = popular.price
      dividend.value = popular.dividend
      isDemoData.value = true
      addToHistory(popular.symbol, popular.price, popular.dividend, popular.name)
      loading.value = false
      error.value =
        'Demonstração: Usando dados simulados para este ticker popular. Insira seu Token Brapi gratuito nas configurações para cotações reais.'
      return
    }

    const isTestTicker = ['PETR4', 'MGLU3', 'VALE3', 'ITUB4'].includes(cleanSymbol)
    if (!isTestTicker) {
      loading.value = false
      error.value =
        'Token Brapi ausente. Insira o token gratuito nas configurações para buscar qualquer ativo em tempo real, ou digite os valores manualmente abaixo.'
      return
    }
  }

  try {
    let fetchedPrice = 0
    let fetchedDividend = 0
    let name = ''
    let isFreePlan = false

    const tokenParam = tokenToUse ? `&token=${tokenToUse}` : ''
    const quoteUrl = `https://brapi.dev/api/quote/${cleanSymbol}?dividends=true${tokenParam}`

    let res = await fetch(quoteUrl)
    let data

    if (!res.ok) {
      const fallbackUrl = `https://brapi.dev/api/quote/${cleanSymbol}${tokenParam ? `?${tokenParam.slice(1)}` : ''}`
      res = await fetch(fallbackUrl)
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Token Inválido ou Expirado. Verifique as configurações da API Brapi.')
        }
        throw new Error(`Ativo não encontrado ou erro na API (${res.status})`)
      }
      data = await res.json()
      isFreePlan = true
    } else {
      data = await res.json()
      if (data.error && data.code === 'FEATURE_NOT_AVAILABLE') {
        const fallbackUrl = `https://brapi.dev/api/quote/${cleanSymbol}${tokenParam ? `?${tokenParam.slice(1)}` : ''}`
        res = await fetch(fallbackUrl)
        if (!res.ok) {
          throw new Error(`Erro na API de cotações (${res.status})`)
        }
        data = await res.json()
        isFreePlan = true
      }
    }

    if (!data.results || data.results.length === 0) {
      throw new Error('Ticker não encontrado na API Brapi.')
    }

    const result = data.results[0]
    fetchedPrice = result.regularMarketPrice || 0
    name = result.shortName || result.longName || ''

    if (
      !isFreePlan &&
      result.dividendsData &&
      result.dividendsData.cashDividends &&
      result.dividendsData.cashDividends.length > 0
    ) {
      const sortedDividends = [...result.dividendsData.cashDividends].sort(
        (a, b) => new Date(b.paymentDate || b.date).getTime() - new Date(a.paymentDate || a.date).getTime(),
      )
      fetchedDividend = sortedDividends[0].rate || sortedDividends[0].value || 0
    }

    if (fetchedPrice > 0) {
      price.value = fetchedPrice

      if (isFreePlan) {
        dividend.value = dividend.value || 0.1
        error.value =
          'Preço obtido! O histórico automático de dividendos requer plano pago da Brapi. Ajuste o dividendo manualmente abaixo.'
      } else if (fetchedDividend > 0) {
        dividend.value = Number(fetchedDividend.toFixed(4))
      } else {
        dividend.value = dividend.value || 0.1
        error.value =
          'Preço obtido! No entanto, não encontramos histórico recente de dividendos. Ajuste o dividendo manualmente abaixo.'
      }

      addToHistory(cleanSymbol, price.value, dividend.value, name)
    } else {
      throw new Error('Não foi possível obter um preço válido para este ticker.')
    }
  } catch (err: any) {
    console.error(err)
    const popular = popularFiis.find((f) => f.symbol === cleanSymbol)
    if (popular) {
      price.value = popular.price
      dividend.value = popular.dividend
      isDemoData.value = true
      addToHistory(popular.symbol, popular.price, popular.dividend, popular.name)
      error.value = `Dados de demonstração carregados como backup. (Falha na API: ${err.message}).`
    } else {
      error.value = `${err.message} Você ainda pode preencher os valores manualmente abaixo.`
    }
  } finally {
    loading.value = false
  }
}

// --- Quick select helpers ---
const selectPopular = (fii: typeof popularFiis[0]) => {
  ticker.value = fii.symbol
  price.value = fii.price
  dividend.value = fii.dividend
  isDemoData.value = true
  error.value = null
  addToHistory(fii.symbol, fii.price, fii.dividend, fii.name)
}

const selectHistory = (historyItem: any) => {
  ticker.value = historyItem.symbol
  price.value = historyItem.price
  dividend.value = historyItem.dividend
  error.value = null
}

// --- Sharing & Links ---
const shareUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set('ticker', ticker.value)
  url.searchParams.set('price', price.value.toFixed(2))
  url.searchParams.set('dividend', dividend.value.toFixed(4))
  url.searchParams.set('contrib', monthlyContribution.value.toFixed(0))
  url.searchParams.set('shares', currentShares.value.toString())
  return url.toString()
})

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    isCopied.value = true
    toast.add({
      title: 'Link Copiado!',
      description: 'As configurações de simulação foram salvas na URL.',
      color: 'success'
    })
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Falha ao copiar link:', err)
  }
}

const handleReset = () => {
  ticker.value = 'MXRF11'
  price.value = 10.05
  dividend.value = 0.09
  currentShares.value = 10
  monthlyContribution.value = 200
  error.value = null
  toast.add({
    title: 'Resetado',
    description: 'Valores padrão restaurados.',
    color: 'neutral'
  })
}

// --- FAQ Toggle ---
const toggleFaq = (index: number) => {
  openFaqIndex.value = openFaqIndex.value === index ? null : index
}

const faqs = [
  {
    question: 'O que é o "Número Mágico" nos investimentos?',
    answer:
      'O "Número Mágico" (ou Magic Number) é a quantidade de cotas de um determinado ativo (como um FII) que você precisa possuir para que o dividendo mensal recebido seja igual ou superior ao preço de uma nova cota. A partir deste ponto, o ativo começa a se autofinanciar: os rendimentos compram novas cotas mensalmente sem que você precise aportar dinheiro do próprio bolso.'
  },
  {
    question: 'Como é calculado o Número Mágico de um FII?',
    answer:
      'O cálculo matemático é muito simples: você divide o preço atual da cota pelo valor do último dividendo pago por cota. O resultado é arredondado para cima (teto matemático), pois você só pode comprar cotas inteiras. A fórmula é: Número Mágico = Teto(Preço da Cota / Último Dividendo).'
  },
  {
    question: 'O que é o efeito "Bola de Neve"?',
    answer:
      'É o efeito dos juros compostos em ação na prática. Ao atingir o Número Mágico, a renda gerada pelo seu patrimônio compra novas frações de ativos, que por sua vez passarão a pagar novos dividendos no mês seguinte. Com o tempo, a quantidade de cotas cresce em ritmo exponencial, acelerando a velocidade com que seu patrimônio se multiplica.'
  },
  {
    question: 'Qual a diferença entre FIIs de Tijolo e FIIs de Papel?',
    answer:
      'FIIs de Tijolo investem diretamente em imóveis físicos reais (como galpões logísticos, escritórios corporativos e shoppings) e lucram com aluguéis. Costumam ter maior potencial de valorização do imóvel no longo prazo. FIIs de Papel compram títulos de dívida imobiliária (como CRI e LCI) e distribuem juros e correção monetária. Tendem a pagar dividendos nominais mais elevados no curto prazo, mas não contam com a valorização de imóveis físicos.'
  },
  {
    question: 'Este simulador é seguro? Meus dados são salvos?',
    answer:
      'Sim, é 100% seguro. Este simulador é executado inteiramente no seu navegador de forma estática. Valores preenchidos, histórico de buscas ou chaves de API são armazenados apenas localmente no banco de dados local do seu navegador (localStorage). Não salvamos, transmitimos ou processamos nenhuma informação financeira dos usuários em nossos servidores.'
  }
]

// --- Pagination ---
const currentPage = ref(1)
const rowsPerPage = 12
const totalPages = computed(() => Math.ceil(simulationPoints.value.length / rowsPerPage))

const paginatedSimulationPoints = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  const end = start + rowsPerPage
  return simulationPoints.value.slice(start, end)
})

watch([price, dividend, currentShares, monthlyContribution], () => {
  currentPage.value = 1
})

// --- API Token Config Settings ---
const tokenInput = ref('')

onMounted(() => {
  userToken.value = localStorage.getItem('brapi_token') || ''
  tokenInput.value = userToken.value
  
  history.value = JSON.parse(localStorage.getItem('fii_history') || '[]')

  const params = new URLSearchParams(window.location.search)
  let loadedFromUrl = false
  if (params.has('ticker')) {
    ticker.value = params.get('ticker')!.toUpperCase()
    loadedFromUrl = true
  }
  if (params.has('price')) {
    price.value = parseFloat(params.get('price')!) || price.value
    loadedFromUrl = true
  }
  if (params.has('dividend')) {
    dividend.value = parseFloat(params.get('dividend')!) || dividend.value
    loadedFromUrl = true
  }
  if (params.has('contrib')) {
    monthlyContribution.value = parseFloat(params.get('contrib')!) || monthlyContribution.value
    loadedFromUrl = true
  }
  if (params.has('shares')) {
    currentShares.value = parseInt(params.get('shares')!) || currentShares.value
    loadedFromUrl = true
  }

  if (!loadedFromUrl) {
    searchTicker('MXRF11')
  } else {
    if (params.has('ticker') && (!params.has('price') || !params.has('dividend'))) {
      searchTicker(ticker.value)
    }
  }
})

const handleSaveToken = () => {
  userToken.value = tokenInput.value.trim()
  if (userToken.value) {
    localStorage.setItem('brapi_token', userToken.value)
  } else {
    localStorage.removeItem('brapi_token')
  }
  toast.add({
    title: 'Configuração Salva',
    description: userToken.value ? 'Token da Brapi configurado com sucesso.' : 'Token da Brapi removido.',
    color: 'success'
  })
  isSettingsOpen.value = false
}

const handleClearToken = () => {
  tokenInput.value = ''
  userToken.value = ''
  localStorage.removeItem('brapi_token')
  toast.add({
    title: 'Configuração Salva',
    description: 'Token da Brapi removido.',
    color: 'success'
  })
  isSettingsOpen.value = false
}
</script>

<template>
  <div class="space-y-6 py-4 relative">
    <!-- Ambient Light/Blur Orbs -->
    <div class="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 dark:bg-emerald-900/5 blur-[100px] pointer-events-none -z-10"></div>
    <div class="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-teal-500/10 dark:bg-teal-900/5 blur-[120px] pointer-events-none -z-10"></div>

    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Calculadora de FIIs
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Projete a bola de neve de juros compostos simulando o acúmulo de cotas de Fundos Imobiliários e reinvestimento de dividendos.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          label="Configurações API"
          icon="i-lucide-settings"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg font-bold"
          @click="isSettingsOpen = true"
        />
        <UButton
          label="Restaurar Padrão"
          icon="i-lucide-rotate-ccw"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg font-bold"
          @click="handleReset"
        />
      </div>
    </div>

    <!-- Simulator Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Inputs (Left Column - 5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        
        <!-- Choose FII Card -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <UIcon name="i-lucide-search" class="text-emerald-500 size-4" />
            <span>1. Escolha o Fundo Imobiliário</span>
          </h2>

          <div class="space-y-4">
            <!-- Search field -->
            <div class="flex gap-2">
              <div class="relative flex-1">
                <span class="absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
                  <UIcon name="i-lucide-search" class="size-4" />
                </span>
                <input
                  v-model="ticker"
                  type="text"
                  placeholder="EX: MXRF11, HGLG11..."
                  class="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all uppercase font-mono font-bold"
                  :disabled="loading"
                  @keyup.enter="searchTicker(ticker)"
                />
              </div>
              <UButton
                :label="loading ? 'Buscando...' : 'Calcular'"
                :loading="loading"
                color="primary"
                class="rounded-lg font-bold"
                @click="searchTicker(ticker)"
              />
            </div>

            <!-- Error message -->
            <div
              v-if="error"
              :class="[
                'p-4 rounded-xl text-xs border flex items-start gap-2.5',
                isDemoData
                  ? 'bg-amber-50 text-amber-800 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30'
                  : 'bg-rose-50 text-rose-800 border-rose-200/60 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/30'
              ]"
            >
              <UIcon
                :name="isDemoData ? 'i-lucide-info' : 'i-lucide-alert-triangle'"
                :class="['size-4 shrink-0 mt-0.5', isDemoData ? 'text-amber-500' : 'text-rose-500']"
              />
              <div class="leading-relaxed text-xs">{{ error }}</div>
            </div>

            <!-- Popular Shortcuts -->
            <div class="space-y-1.5">
              <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Atalhos Populares</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="fii in popularFiis"
                  :key="fii.symbol"
                  type="button"
                  @click="selectPopular(fii)"
                  :class="[
                    'px-2.5 py-1 text-xs font-bold rounded-lg border transition-all active:scale-95',
                    ticker === fii.symbol
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  ]"
                >
                  {{ fii.symbol }}
                </button>
              </div>
            </div>

            <!-- Recent Searches -->
            <div v-if="history.length > 0" class="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Buscas Recentes</span>
                <button
                  @click="clearHistory"
                  class="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline font-semibold"
                >
                  Limpar
                </button>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="item in history"
                  :key="item.symbol"
                  type="button"
                  @click="selectHistory(item)"
                  :class="[
                    'px-2.5 py-1 text-xs rounded-lg border transition-all font-mono',
                    ticker === item.symbol
                      ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold'
                      : 'bg-transparent border-dashed border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  ]"
                >
                  {{ item.symbol }} ({{ formatCurrency(item.price) }})
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Adjust Inputs Card -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <UIcon name="i-lucide-sliders" class="text-emerald-500 size-4" />
              <span>2. Ajuste Fino & Simulação</span>
            </h2>
            <div class="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-200/40 dark:border-emerald-800/30">
              DY Mensal: {{ yieldOnCost.toFixed(2) }}%
            </div>
          </div>

          <div class="space-y-5">
            <!-- Share Price -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <label for="price-range">Preço da Cota</label>
                <span class="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                  {{ formatCurrency(price) }}
                </span>
              </div>
              <div class="relative">
                <span class="absolute inset-y-0 start-0 flex items-center ps-3 text-xs text-slate-400 font-semibold font-mono">R$</span>
                <input
                  v-model.number="price"
                  type="number"
                  step="0.01"
                  min="0.10"
                  class="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-semibold font-mono"
                />
              </div>
              <input
                id="price-range"
                v-model.number="price"
                type="range"
                min="1.00"
                max="250.00"
                step="0.05"
                class="w-full accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer mt-1"
              />
            </div>

            <!-- Last Dividend -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <label for="dividend-range">Último Dividendo</label>
                <span class="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                  {{ formatCurrency(dividend) }}
                </span>
              </div>
              <div class="relative">
                <span class="absolute inset-y-0 start-0 flex items-center ps-3 text-xs text-slate-400 font-semibold font-mono">R$</span>
                <input
                  v-model.number="dividend"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  class="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-semibold font-mono"
                />
              </div>
              <input
                id="dividend-range"
                v-model.number="dividend"
                type="range"
                min="0.01"
                max="3.00"
                step="0.01"
                class="w-full accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer mt-1"
              />
            </div>

            <!-- Current Shares -->
            <div class="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div class="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <label for="shares-range">Cotas Atuais (Seu progresso)</label>
                <span class="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                  {{ currentShares }} cotas
                </span>
              </div>
              <input
                v-model.number="currentShares"
                type="number"
                min="0"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-semibold font-mono"
              />
              <input
                id="shares-range"
                v-model.number="currentShares"
                type="range"
                min="0"
                max="500"
                step="1"
                class="w-full accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer mt-1"
              />
            </div>

            <!-- Monthly Contribution -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <label for="contrib-range">Aporte Mensal (Adicional)</label>
                <span class="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                  {{ formatCurrency(monthlyContribution) }}
                </span>
              </div>
              <div class="relative">
                <span class="absolute inset-y-0 start-0 flex items-center ps-3 text-xs text-slate-400 font-semibold font-mono">R$</span>
                <input
                  v-model.number="monthlyContribution"
                  type="number"
                  min="0"
                  class="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-semibold font-mono"
                />
              </div>
              <input
                id="contrib-range"
                v-model.number="monthlyContribution"
                type="range"
                min="0"
                max="2000"
                step="50"
                class="w-full accent-emerald-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- Outputs (Right Column - 7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        
        <!-- Magic Number Snowball Card -->
        <div class="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 md:p-8 shadow-sm">
          <div class="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
          <div class="absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-teal-500/5 blur-3xl pointer-events-none"></div>

          <div class="relative z-10 space-y-6">
            <div class="flex justify-between items-start">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/30">
                  Número Mágico ❄️
                </span>
                <h3 class="text-lg font-bold mt-3 text-slate-800 dark:text-slate-100">
                  Cotas para a Bola de Neve
                </h3>
              </div>
              <div class="text-slate-500 dark:text-slate-300 font-mono text-sm font-semibold bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50">
                {{ ticker }}
              </div>
            </div>

            <!-- Big Number -->
            <div class="flex flex-col items-center justify-center py-4 border-y border-slate-100 dark:border-slate-800/80">
              <span class="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 tracking-tight select-all">
                {{ magicNumber }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold uppercase tracking-widest">
                Cotas necessárias
              </span>
            </div>

            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-center">
              Ao acumular <strong class="text-emerald-600 dark:text-emerald-400 font-bold">{{ magicNumber }} cotas</strong> de <strong class="text-emerald-600 dark:text-emerald-400 font-bold">{{ ticker }}</strong>, o seu dividendo mensal de <strong class="text-emerald-600 dark:text-emerald-400 font-bold">{{ formatCurrency(monthlyIncomeAtMagic) }}</strong> será maior ou igual ao preço de uma nova cota (<strong class="text-emerald-600 dark:text-emerald-400 font-bold">{{ formatCurrency(price) }}</strong>). A partir daí, o investimento cresce sozinho!
            </p>
          </div>
        </div>

        <!-- Quick Stats Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Total Invested needed -->
          <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm flex flex-col justify-center text-center">
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Investido Necessário</span>
            <p class="text-lg font-black text-slate-800 dark:text-slate-100 mt-1 font-mono select-all">
              {{ formatCurrencyCompact(totalInvestedNeeded) }}
            </p>
          </div>

          <!-- Monthly income generated -->
          <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm flex flex-col justify-center text-center">
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Renda Mensal Gerada</span>
            <p class="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono select-all">
              {{ formatCurrency(monthlyIncomeAtMagic) }}
            </p>
          </div>

          <!-- Time to target -->
          <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm flex flex-col justify-center text-center md:col-span-1">
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Tempo até o Magic Number</span>
            <p class="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-1.5 leading-snug">
              {{ formattedEstimation }}
            </p>
          </div>
        </div>

        <!-- Escada do Número Mágico (Income milestones) -->
        <div class="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Metas de Renda (Escada do Número Mágico)</span>
            <span class="text-[10px] lowercase text-slate-500 dark:text-slate-400 font-normal">Sua carteira: {{ currentShares }} cotas</span>
          </h4>
          <div class="flex flex-col gap-4">
            <div v-for="milestone in milestones" :key="milestone.name" class="flex flex-col gap-1.5">
              <div class="flex justify-between items-center text-xs">
                <span class="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span v-if="milestone.isCompleted" class="text-emerald-500 font-bold">✓</span>
                  <span v-else class="text-slate-300 dark:text-slate-650">○</span>
                  {{ milestone.name }}
                </span>
                <span class="font-mono text-slate-500 dark:text-slate-400 font-bold">
                  {{ currentShares }}/{{ milestone.required }} cotas ({{ milestone.progress }}%)
                </span>
              </div>
              <!-- Progress Bar -->
              <div class="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200/30 dark:border-slate-800/30">
                <div
                  :class="[
                    'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                    milestone.isCompleted
                      ? 'from-emerald-400 to-teal-400'
                      : 'from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600'
                  ]"
                  :style="{ width: `${milestone.progress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Growth Curve SVG Chart -->
        <div class="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                4. Curva de Crescimento (10 Anos)
              </h3>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Projeção gráfica do patrimônio ao longo do tempo.</p>
            </div>

            <UButton
              :label="isCopied ? 'Link Copiado!' : 'Compartilhar'"
              :icon="isCopied ? 'i-lucide-check' : 'i-lucide-share-2'"
              color="neutral"
              variant="subtle"
              size="sm"
              class="rounded-lg font-bold"
              @click="copyLink"
            />
          </div>

          <!-- SVG Graph -->
          <div class="relative w-full overflow-hidden flex justify-center items-center py-2 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-200/20 dark:border-slate-800/10">
            <svg
              :viewBox="`0 0 ${width} ${height}`"
              class="w-full h-auto max-w-[500px] text-slate-500 dark:text-slate-400 font-mono"
              style="overflow: visible"
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <!-- Grid Lines -->
              <g stroke="currentColor" stroke-opacity="0.08" stroke-width="1">
                <line :x1="padding.left" :y1="padding.top" :x2="width - padding.right" :y2="padding.top" />
                <line :x1="padding.left" :y1="padding.top + chartHeight / 2" :x2="width - padding.right" :y2="padding.top + chartHeight / 2" />
                <line :x1="padding.left" :y1="padding.top + chartHeight" :x2="width - padding.right" :y2="padding.top + chartHeight" />
              </g>

              <!-- Area Under Curve -->
              <path v-if="areaPath" :d="areaPath" fill="url(#chartGrad)" />

              <!-- Line Curve -->
              <path
                v-if="linePath"
                :d="linePath"
                fill="none"
                stroke="#10b981"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Milestone Dots -->
              <g v-for="dot in milestoneDots" :key="dot.label">
                <circle
                  :cx="dot.x"
                  :cy="dot.y"
                  r="4.5"
                  fill="#10b981"
                  stroke="white"
                  stroke-width="1.5"
                  class="transition-all duration-300 hover:r-6 cursor-pointer"
                />
                <text
                  :x="dot.x"
                  :y="dot.y - 10"
                  text-anchor="middle"
                  fill="currentColor"
                  class="text-[9px] font-bold text-slate-700 dark:text-slate-300"
                >
                  {{ formatCurrencyCompact(dot.equity) }}
                </text>
              </g>

              <!-- Axis Labels -->
              <g fill="currentColor" class="text-[9px] text-slate-400 dark:text-slate-500 font-semibold" text-anchor="middle">
                <text :x="padding.left" :y="height - 5">Começo</text>
                <text :x="padding.left + (12 / 120) * chartWidth" :y="height - 5">1 Ano</text>
                <text :x="padding.left + (36 / 120) * chartWidth" :y="height - 5">3 Anos</text>
                <text :x="padding.left + (60 / 120) * chartWidth" :y="height - 5">5 Anos</text>
                <text :x="padding.left + (120 / 120) * chartWidth" :y="height - 5">10 Anos</text>
              </g>
            </svg>
          </div>
        </div>

        <!-- Growth Projection Milestone Table -->
        <div class="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div class="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Projeção de Crescimento da Bola de Neve
            </h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">
              Evolução estimada com aporte de {{ formatCurrency(monthlyContribution) }}/mês + dividendos reinvestidos.
            </p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th class="py-2.5">Período</th>
                  <th class="py-2.5 text-right">Cotas</th>
                  <th class="py-2.5 text-right">Aportado</th>
                  <th class="py-2.5 text-right">Patrimônio</th>
                  <th class="py-2.5 text-right text-emerald-600 dark:text-emerald-400">Renda/mês</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300 font-medium font-mono">
                <tr
                  v-for="row in projectionData"
                  :key="row.label"
                  class="hover:bg-slate-50/50 dark:hover:bg-slate-950/20"
                >
                  <td class="py-3 font-semibold text-slate-800 dark:text-slate-100 font-sans">{{ row.label }}</td>
                  <td class="py-3 text-right">{{ row.cotas }}</td>
                  <td class="py-3 text-right text-slate-500">{{ formatCurrency(row.totalInvested) }}</td>
                  <td class="py-3 text-right font-bold">{{ formatCurrency(row.totalEquity) }}</td>
                  <td class="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(row.monthlyIncome) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Monthly detailed evolution breakdown table -->
    <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
      <h3 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <UIcon name="i-lucide-list" class="text-emerald-500 size-4" />
        <span>Evolução Detalhada Mês a Mês</span>
      </h3>

      <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-900">
        <table class="w-full text-left border-collapse text-xs">
          <thead class="sticky top-0 bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 z-10">
            <tr>
              <th class="p-3">Mês</th>
              <th class="p-3">Cotas Detidas</th>
              <th class="p-3">Cotas Adquiridas</th>
              <th class="p-3">Proventos Recebidos</th>
              <th class="p-3">Saldo Caixa (Troco)</th>
              <th class="p-3">Valor Patrimonial</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-900/60 font-mono">
            <tr
              v-for="row in paginatedSimulationPoints"
              :key="row.month"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <td class="p-3 font-semibold text-slate-800 dark:text-slate-200">
                {{ row.month === 0 ? 'Inicial' : `Mês ${row.month} (Ano ${Math.ceil(row.month/12)})` }}
              </td>
              <td class="p-3 font-bold text-slate-800 dark:text-slate-200">{{ row.cotas }}</td>
              <td class="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                {{ row.month === 0 ? '-' : `+${row.cotasBought}` }}
              </td>
              <td class="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                {{ row.month === 0 ? '-' : formatCurrency(row.dividendsReceived) }}
              </td>
              <td class="p-3 text-slate-500 dark:text-slate-400">{{ formatCurrency(row.cash) }}</td>
              <td class="p-3 font-bold text-slate-900 dark:text-white">{{ formatCurrency(row.equity) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Mostrando <span class="font-bold text-slate-800 dark:text-slate-200">{{ (currentPage - 1) * rowsPerPage + 1 }}</span> a 
          <span class="font-bold text-slate-800 dark:text-slate-200">{{ Math.min(currentPage * rowsPerPage, simulationPoints.length) }}</span> de 
          <span class="font-bold text-slate-800 dark:text-slate-200">{{ simulationPoints.length }}</span> meses (10 Anos)
        </div>
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <UButton
            label="Anterior"
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="subtle"
            size="xs"
            class="rounded-lg font-semibold"
            :disabled="currentPage === 1"
            @click="currentPage--"
          />
          
          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'h-7 w-7 rounded-lg text-xs font-mono font-bold transition-all',
                currentPage === page
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <UButton
            label="Próximo"
            icon="i-lucide-chevron-right"
            trailing
            color="neutral"
            variant="subtle"
            size="xs"
            class="rounded-lg font-semibold"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          />
        </div>
      </div>

    </div>

    <!-- Guia FAQ Accordion -->
    <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm mt-8">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
        <UIcon name="i-lucide-help-circle" class="text-emerald-500 size-4" />
        <span>Guia Prático e Dúvidas Frequentes (FAQ)</span>
      </h3>

      <div class="flex flex-col gap-3">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="border-b border-slate-100 dark:border-slate-800/60 pb-3"
        >
          <button
            @click="toggleFaq(index)"
            type="button"
            class="w-full flex justify-between items-center text-left py-2 text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            <span>{{ faq.question }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              :class="[
                'size-4 transition-transform duration-200 text-slate-400 shrink-0 ml-2',
                openFaqIndex === index ? 'rotate-180 text-emerald-500' : ''
              ]"
            />
          </button>

          <div
            v-show="openFaqIndex === index"
            class="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed transition-all duration-300"
          >
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>

    <!-- API settings custom Modal -->
    <div
      v-if="isSettingsOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm transition-opacity"
      @click.self="isSettingsOpen = false"
    >
      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div class="flex justify-between items-start">
          <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UIcon name="i-lucide-settings" class="text-emerald-500 size-5" />
            <span>Configurações da API</span>
          </h3>
          <button
            @click="isSettingsOpen = false"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </div>

        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Para consultar cotações reais e dividendos de qualquer FII (fora dos atalhos de teste), informe um token gratuito obtido na
          <a
            href="https://brapi.dev"
            target="_blank"
            rel="noopener"
            class="text-emerald-500 hover:underline font-semibold"
          >Brapi.dev</a>.
        </p>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label for="modal-token" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Token de API da Brapi</label>
            <div class="relative">
              <input
                id="modal-token"
                v-model="tokenInput"
                :type="showToken ? 'text' : 'password'"
                placeholder="Digite ou cole seu token"
                class="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                @click="showToken = !showToken"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <UIcon :name="showToken ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4" />
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              v-if="userToken"
              label="Excluir Token"
              color="neutral"
              variant="subtle"
              class="rounded-lg text-xs"
              @click="handleClearToken"
            />
            <UButton
              label="Salvar"
              color="primary"
              class="rounded-lg text-xs font-bold"
              @click="handleSaveToken"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Educational AdSense Placeholder -->
    <AdBlock id="adsense-fiis-footer" type="leaderboard" />
  </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
