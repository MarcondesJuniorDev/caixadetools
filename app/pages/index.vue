<script setup lang="ts">
import { useSeoMeta, useHead } from '#imports'

// High-impact SEO optimization
useSeoMeta({
  title: 'Caixa de Tools - Ferramentas e Simuladores Online Gratuitos',
  ogTitle: 'Caixa de Tools - Ferramentas e Simuladores Online Gratuitos',
  description: 'Portal multiferramentas e simuladores utilitários online e gratuitos. Encontre formatadores, geradores, calculadoras financeiras e mais.',
  ogDescription: 'Portal multiferramentas e simuladores utilitários online e gratuitos. Encontre formatadores, geradores, calculadoras financeiras e mais.',
  ogType: 'website',
  ogImage: 'https://caixadetools.com/og-default.jpg', // Placeholder domain
  twitterCard: 'summary_large_image',
  twitterTitle: 'Caixa de Tools - Ferramentas e Simuladores Online Gratuitos',
  twitterDescription: 'Portal de utilitários rápidos, leves e seguros.',
})

useHead({
  htmlAttrs: {
    lang: 'pt-BR'
  },
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com' }
  ]
})

const categories = [
  {
    name: 'Desenvolvedor',
    icon: 'i-lucide-wrench',
    description: 'Ferramentas utilitárias para agilizar sua codificação.',
    tools: [
      { name: 'Formatador de JSON', desc: 'Valide e formate strings JSON de maneira limpa.', icon: 'i-lucide-braces', badge: 'Popular', path: '/desenvolvedor/formatador-json' },
      { name: 'Gerador de CPF / CNPJ', desc: 'Gere documentos válidos para fins de testes de software.', icon: 'i-lucide-user-check', path: '/desenvolvedor/gerador-cpf-cnpj' },
      { name: 'Conversor Base64', desc: 'Codifique e decodifique textos ou arquivos facilmente.', icon: 'i-lucide-binary', path: '#' }
    ]
  },
  {
    name: 'Finanças & Simulação',
    icon: 'i-lucide-wallet',
    description: 'Calculadoras financeiras e simuladores práticos.',
    tools: [
      { name: 'Juros Compostos', desc: 'Simule o crescimento de seus investimentos no tempo.', icon: 'i-lucide-trending-up', badge: 'Novo', path: '#' },
      { name: 'Simulador de Pix', desc: 'Gere QR Codes Pix estáticos para cobranças rápidas.', icon: 'i-lucide-qr-code', path: '#' }
    ]
  },
  {
    name: 'Texto & Utilidades',
    icon: 'i-lucide-file-text',
    description: 'Manipulação e análise de textos em tempo real.',
    tools: [
      { name: 'Contador de Caracteres', desc: 'Conte palavras, caracteres e analise legibilidade.', icon: 'i-lucide-hash', path: '#' },
      { name: 'Gerador de Lorem Ipsum', desc: 'Crie textos fictícios para preenchimento de layouts.', icon: 'i-lucide-file-type', path: '#' }
    ]
  }
]
</script>

<template>
  <div class="space-y-10">
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-10 lg:p-12 transition-all duration-300">
      <!-- Decorative background blur blobs -->
      <div class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div class="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl pointer-events-none" />

      <div class="relative z-10 max-w-2xl">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 mb-6">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Multiportal Gratuito
        </span>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-none mb-4">
          Ferramentas Inteligentes para
          <span class="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
            Facilitar o seu Dia
          </span>
        </h1>
        <p class="text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
          Acesse utilitários rápidos, sem necessidade de cadastro, 100% seguros e projetados com as melhores práticas de SEO e tempo de carregamento instantâneo.
        </p>
        <div class="flex flex-wrap gap-4">
          <UButton
            label="Explorar Ferramentas"
            icon="i-lucide-wrench"
            color="primary"
            size="lg"
            class="rounded-xl shadow-lg shadow-emerald-500/10"
            href="#ferramentas"
          />
          <UButton
            label="Sobre o Projeto"
            icon="i-lucide-info"
            color="neutral"
            variant="subtle"
            size="lg"
            class="rounded-xl"
            href="/sobre"
          />
        </div>
      </div>
    </section>

    <!-- In-Content Ad Banner (Otimizado AdSense) -->
    <AdBlock id="adsense-hero-under" type="leaderboard" />

    <!-- Categories and Tools Section -->
    <section id="ferramentas" class="space-y-12 scroll-mt-20">
      <div v-for="category in categories" :key="category.name" class="space-y-6">
        <!-- Category Header -->
        <div class="flex items-start gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
          <div class="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400">
            <UIcon :name="category.icon" class="size-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight text-slate-950 dark:text-white">{{ category.name }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ category.description }}</p>
          </div>
        </div>

        <!-- Tool Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="tool in category.tools"
            :key="tool.name"
            :to="tool.path"
            class="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                  <UIcon :name="tool.icon" class="size-5" />
                </div>
                <span v-if="tool.badge" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400">
                  {{ tool.badge }}
                </span>
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                {{ tool.name }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {{ tool.desc }}
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity">
              <span>Acessar Ferramenta</span>
              <UIcon name="i-lucide-arrow-right" class="size-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Content-embedded Ad Slot (Evita CLS) -->
    <AdBlock id="adsense-bottom-content" type="rectangle" />
  </div>
</template>
