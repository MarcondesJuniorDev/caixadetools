<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useSeoMeta, useHead, useToast } from '#imports'

useSeoMeta({
  title: 'Calculadora de Juros Compostos Online - Simular Investimentos',
  description: 'Simule a evolução de seus investimentos com juros compostos. Calcule o ganho acumulado, aportes mensais e veja o gráfico de evolução patrimonial.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/financas/juros-compostos' }
  ]
})

const toast = useToast()

// --- Calculator Inputs ---
const inputs = reactive({
  initialValue: 5000,
  monthlyValue: 300,
  interestRate: 10.5,
  ratePeriod: 'annual', // 'monthly' | 'annual'
  periodValue: 10,
  periodType: 'years' // 'months' | 'years'
})

// --- Calculation Logic ---
const results = computed(() => {
  const initial = Number(inputs.initialValue) || 0
  const monthly = Number(inputs.monthlyValue) || 0
  
  // Rate Conversion (Decimal)
  let r = (Number(inputs.interestRate) || 0) / 100
  if (inputs.ratePeriod === 'annual') {
    // Equivalent monthly rate: (1 + r)^(1/12) - 1
    r = Math.pow(1 + r, 1 / 12) - 1
  }
  
  // Total months
  let n = Number(inputs.periodValue) || 0
  if (inputs.periodType === 'years') {
    n = n * 12
  }
  
  // Limit simulation length to 600 months (50 years) for UI sanity
  n = Math.min(n, 600)
  
  const simulation = []
  let currentBalance = initial
  let totalInvested = initial
  let totalInterest = 0
  
  for (let t = 1; t <= n; t++) {
    const startBalance = currentBalance
    const contribution = monthly
    const compoundingBasis = startBalance + contribution
    const interestOfPeriod = compoundingBasis * r
    const endBalance = compoundingBasis + interestOfPeriod
    
    totalInvested += contribution
    totalInterest += interestOfPeriod
    currentBalance = endBalance
    
    simulation.push({
      period: t,
      startBalance,
      contribution,
      interest: interestOfPeriod,
      accumulatedInterest: totalInterest,
      totalInvested,
      endBalance
    })
  }
  
  return {
    totalValue: currentBalance,
    totalInvested,
    totalInterest,
    simulation
  }
})

// Formatting helpers
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatRate = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(val) + '%'
}

// --- Dynamic SVG Chart Calculation ---
const chartPoints = computed(() => {
  const sim = results.value.simulation
  const n = sim.length
  
  if (n === 0) {
    return { areaInvested: '', areaTotal: '', lineInvested: '', lineTotal: '', dots: [] }
  }
  
  // SVG viewport size
  const width = 600
  const height = 250
  const paddingX = 40
  const paddingY = 20
  
  const maxVal = results.value.totalValue || 1
  
  const getX = (index: number) => paddingX + (index / (n - 1)) * (width - 2 * paddingX)
  const getY = (val: number) => height - paddingY - (val / maxVal) * (height - 2 * paddingY)
  
  let pathInvested = `M ${getX(0)} ${getY(sim[0].totalInvested)}`
  let pathTotal = `M ${getX(0)} ${getY(sim[0].endBalance)}`
  
  for (let i = 1; i < n; i++) {
    pathInvested += ` L ${getX(i)} ${getY(sim[i].totalInvested)}`
    pathTotal += ` L ${getX(i)} ${getY(sim[i].endBalance)}`
  }
  
  // Areas to close the path at the bottom
  const areaInvested = `${pathInvested} L ${getX(n - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`
  const areaTotal = `${pathTotal} L ${getX(n - 1)} ${height - paddingY} L ${getX(0)} ${height - paddingY} Z`
  
  // Key points to display as hover dots (spread out)
  const step = Math.max(1, Math.floor(n / 5))
  const dots = []
  for (let i = 0; i < n; i += step) {
    dots.push({
      x: getX(i),
      y: getY(sim[i].endBalance),
      label: inputs.periodType === 'years' ? `Ano ${Math.ceil((i+1)/12)}` : `Mês ${i+1}`,
      val: sim[i].endBalance
    })
  }
  // Include final node
  if ((n - 1) % step !== 0) {
    dots.push({
      x: getX(n - 1),
      y: getY(sim[n - 1].endBalance),
      label: inputs.periodType === 'years' ? `Ano ${inputs.periodValue}` : `Mês ${n}`,
      val: sim[n - 1].endBalance
    })
  }
  
  return {
    areaInvested,
    areaTotal,
    lineInvested: pathInvested,
    lineTotal: pathTotal,
    dots
  }
})

const handleReset = () => {
  inputs.initialValue = 5000
  inputs.monthlyValue = 300
  inputs.interestRate = 10.5
  inputs.ratePeriod = 'annual'
  inputs.periodValue = 10
  inputs.periodType = 'years'
  toast.add({
    title: 'Resetado',
    description: 'Valores padrão restaurados.',
    color: 'neutral'
  })
}
</script>

<template>
  <div class="space-y-6 py-4">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Calculadora de Juros Compostos
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Projete a rentabilidade de seus aportes financeiros de médio e longo prazo sob o efeito de juros compostos.
        </p>
      </div>
      <UButton
        label="Resetar"
        icon="i-lucide-rotate-ccw"
        color="neutral"
        variant="subtle"
        size="sm"
        class="w-fit rounded-lg"
        @click="handleReset"
      />
    </div>

    <!-- Simulator Layout (Inputs & Charts) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Inputs Column (5 cols) -->
      <div class="lg:col-span-5 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <h2 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <UIcon name="i-lucide-wrench" class="text-emerald-500 size-4" />
          <span>Parâmetros da Simulação</span>
        </h2>

        <div class="space-y-4">
          <!-- Initial Capital -->
          <UFormField label="Valor Inicial (Capital inicial)">
            <div class="relative">
              <span class="absolute inset-y-0 start-0 flex items-center ps-3 text-xs text-slate-400 font-semibold">R$</span>
              <input
                type="number"
                v-model.number="inputs.initialValue"
                class="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
                min="0"
              />
            </div>
          </UFormField>

          <!-- Monthly Contribution -->
          <UFormField label="Aporte Mensal (Valor investido por mês)">
            <div class="relative">
              <span class="absolute inset-y-0 start-0 flex items-center ps-3 text-xs text-slate-400 font-semibold">R$</span>
              <input
                type="number"
                v-model.number="inputs.monthlyValue"
                class="w-full ps-9 pe-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
                min="0"
              />
            </div>
          </UFormField>

          <!-- Interest Rate -->
          <UFormField label="Taxa de Juros">
            <div class="grid grid-cols-12 gap-2">
              <input
                type="number"
                v-model.number="inputs.interestRate"
                step="0.01"
                class="col-span-7 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
                min="0"
              />
              <select
                v-model="inputs.ratePeriod"
                class="col-span-5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
              >
                <option value="annual">Anual (%)</option>
                <option value="monthly">Mensal (%)</option>
              </select>
            </div>
          </UFormField>

          <!-- Period -->
          <UFormField label="Período de Tempo">
            <div class="grid grid-cols-12 gap-2">
              <input
                type="number"
                v-model.number="inputs.periodValue"
                class="col-span-7 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
                min="1"
              />
              <select
                v-model="inputs.periodType"
                class="col-span-5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
              >
                <option value="years">Anos</option>
                <option value="months">Meses</option>
              </select>
            </div>
          </UFormField>
        </div>
      </div>

      <!-- Results Column (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        
        <!-- Summary Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Total Value -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-emerald-500/10 dark:bg-emerald-950/20 text-center">
            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Acumulado</span>
            <p class="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 select-all">
              {{ formatCurrency(results.totalValue) }}
            </p>
          </div>
          <!-- Invested -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center">
            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Investido</span>
            <p class="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-1 select-all">
              {{ formatCurrency(results.totalInvested) }}
            </p>
          </div>
          <!-- Interest -->
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center">
            <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total em Juros</span>
            <p class="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-500 mt-1 select-all">
              {{ formatCurrency(results.totalInterest) }}
            </p>
          </div>
        </div>

        <!-- SVG Chart Card -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Evolução Patrimonial</h3>
            <!-- Chart Legend -->
            <div class="flex items-center gap-3 text-[10px] font-medium text-slate-500">
              <span class="flex items-center gap-1">
                <span class="h-2 w-2 rounded bg-slate-400 dark:bg-slate-600" />
                <span>Investido</span>
              </span>
              <span class="flex items-center gap-1">
                <span class="h-2 w-2 rounded bg-emerald-500" />
                <span>Juros Acumulados</span>
              </span>
            </div>
          </div>

          <!-- Reactive SVG Curve -->
          <div class="relative w-full aspect-[2.4/1] bg-slate-50/50 dark:bg-slate-950/40 rounded-xl p-1 overflow-hidden border border-slate-100 dark:border-slate-900">
            <svg viewBox="0 0 600 250" class="w-full h-full">
              <!-- Gradients definition -->
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
                </linearGradient>
                <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#64748b" stop-opacity="0.15" />
                  <stop offset="100%" stop-color="#64748b" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <!-- Grid horizontal guideline -->
              <line x1="40" y1="20" x2="560" y2="20" stroke="#94a3b8" stroke-opacity="0.1" stroke-dasharray="3,3" />
              <line x1="40" y1="125" x2="560" y2="125" stroke="#94a3b8" stroke-opacity="0.1" stroke-dasharray="3,3" />
              <line x1="40" y1="230" x2="560" y2="230" stroke="#94a3b8" stroke-opacity="0.15" />

              <!-- Total Value Area & Line -->
              <path :d="chartPoints.areaTotal" fill="url(#totalGrad)" />
              <path :d="chartPoints.lineTotal" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" />

              <!-- Invested Capital Area & Line -->
              <path :d="chartPoints.areaInvested" fill="url(#investGrad)" />
              <path :d="chartPoints.lineInvested" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4" />

              <!-- Hover interactive dots -->
              <g v-for="(dot, idx) in chartPoints.dots" :key="idx">
                <circle :cx="dot.x" :cy="dot.y" r="4" fill="#10b981" class="hover:scale-150 transition-transform duration-100 cursor-pointer" />
                <!-- Text tooltips below top border -->
                <text :x="dot.x" :y="dot.y - 8" text-anchor="middle" fill="#94a3b8" class="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 font-semibold">
                  {{ formatCurrency(dot.val).replace('R$', '').trim() }}
                </text>
              </g>
            </svg>
          </div>
        </div>

      </div>
    </div>

    <!-- Monthly Evolution Breakdown Table -->
    <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
      <h3 class="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
        <UIcon name="i-lucide-list" class="text-emerald-500 size-4" />
        <span>Tabela de Evolução Patrimonial</span>
      </h3>

      <div class="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-900 max-h-[400px]">
        <table class="w-full text-left border-collapse text-xs">
          <thead class="sticky top-0 bg-slate-50 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-500 z-10">
            <tr>
              <th class="p-3">Período</th>
              <th class="p-3">Saldo Anterior</th>
              <th class="p-3">Aporte</th>
              <th class="p-3">Juros Ganhos</th>
              <th class="p-3">Juros Acumulados</th>
              <th class="p-3">Saldo Final</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-900/60 font-mono">
            <tr
              v-for="row in results.simulation"
              :key="row.period"
              class="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <td class="p-3 font-semibold text-slate-800 dark:text-slate-200">
                {{ inputs.periodType === 'years' ? `Mês ${row.period} (Ano ${Math.ceil(row.period/12)})` : `Mês ${row.period}` }}
              </td>
              <td class="p-3">{{ formatCurrency(row.startBalance) }}</td>
              <td class="p-3 text-slate-500">{{ formatCurrency(row.contribution) }}</td>
              <td class="p-3 text-emerald-600 dark:text-emerald-500 font-semibold">+{{ formatCurrency(row.interest) }}</td>
              <td class="p-3 text-emerald-600/70 dark:text-emerald-500/70">{{ formatCurrency(row.accumulatedInterest) }}</td>
              <td class="p-3 font-bold text-slate-900 dark:text-white">{{ formatCurrency(row.endBalance) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Educational AdSense Placeholder -->
    <AdBlock id="adsense-compound-footer" type="leaderboard" />
  </div>
</template>
