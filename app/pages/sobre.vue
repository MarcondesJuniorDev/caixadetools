<script setup lang="ts">
import { useSeoMeta, useHead, definePageMeta } from '#imports'

// Disable sidebar for a clean reading layout
definePageMeta({
  sidebar: false
})

useSeoMeta({
  title: 'Sobre Nós - Caixa de Tools',
  description: 'Conheça o Caixa de Tools, um portal moderno que reúne utilitários e simuladores práticos para o dia a dia.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/sobre' }
  ]
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 py-6">
    <div class="space-y-4">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Sobre o Caixa de Tools
      </h1>
      <p class="text-base text-slate-500 dark:text-slate-400">
        Nossa missão é simplificar tarefas diárias fornecendo utilitários web rápidos, seguros e acessíveis.
      </p>
    </div>

    <!-- Content Block -->
    <div class="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
      <p>
        O <strong>Caixa de Tools</strong> nasceu com o objetivo de centralizar as ferramentas que desenvolvedores, estudantes, profissionais de finanças e criadores de conteúdo usam no dia a dia. Evitamos a poluição visual, o excesso de anúncios intrusivos e os tempos de carregamento lentos que plagiam a maioria dos portais utilitários hoje em dia.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Nossos Compromissos:</h2>
      <ul class="space-y-3 list-disc pl-5">
        <li>
          <strong>Privacidade em Primeiro Lugar:</strong> Suas informações e dados inseridos em nossos simuladores não são enviados para servidores externos; o processamento é executado inteiramente no seu navegador.
        </li>
        <li>
          <strong>Velocidade e Eficiência:</strong> Desenvolvido com Nuxt 4 (Server-Side Rendering nativo), garantimos um dos melhores tempos de resposta e performance de renderização.
        </li>
        <li>
          <strong>Layout Limpo:</strong> Monetização planejada de forma a respeitar a experiência do usuário. Nada de popups inconvenientes ou elementos piscando.
        </li>
      </ul>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">A Tecnologia por Trás:</h2>
      <p>
        Este site é construído utilizando as tecnologias mais modernas de desenvolvimento web:
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 not-prose mt-4">
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <UIcon name="i-lucide-wrench" class="size-6 text-emerald-500 mx-auto mb-2" />
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Nuxt 4</h3>
          <p class="text-[11px] text-slate-500 mt-1">SSR ultra rápido</p>
        </div>
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <UIcon name="i-lucide-layout-grid" class="size-6 text-emerald-500 mx-auto mb-2" />
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Tailwind CSS</h3>
          <p class="text-[11px] text-slate-500 mt-1">Design moderno e responsivo</p>
        </div>
        <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <UIcon name="i-lucide-user-check" class="size-6 text-emerald-500 mx-auto mb-2" />
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Vue 3</h3>
          <p class="text-[11px] text-slate-500 mt-1">Reatividade impecável</p>
        </div>
      </div>
    </div>
  </div>
</template>
