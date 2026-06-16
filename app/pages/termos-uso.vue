<script setup lang="ts">
import { useSeoMeta, useHead, definePageMeta } from '#imports'

definePageMeta({
  sidebar: false
})

useSeoMeta({
  title: 'Termos de Uso - Caixa de Tools',
  description: 'Leia os termos de uso do portal Caixa de Tools para entender as regras de utilização do site.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/termos-uso' }
  ]
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 py-6">
    <div class="space-y-4">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Termos de Uso
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Última atualização: 16 de Junho de 2026
      </p>
    </div>

    <div class="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
      <p>
        Bem-vindo ao <strong>Caixa de Tools</strong>. Ao acessar e usar este site, você aceita e concorda em cumprir os seguintes termos e condições de uso.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Aceitação dos Termos</h2>
      <p>
        Se você não concorda com qualquer parte destes termos, por favor, interrompa a utilização do site imediatamente. O acesso às nossas ferramentas e simuladores é inteiramente voluntário.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Licença de Uso</h2>
      <p>
        É concedida permissão para acessar e utilizar temporariamente as ferramentas disponibilizadas para uso pessoal e comercial (para testes de software, simulações financeiras ou formatação de dados). Esta é uma concessão de licença de uso gratuita, e sob esta licença você não pode:
      </p>
      <ul class="list-disc pl-5 space-y-2">
        <li>Modificar ou copiar os códigos fonte das ferramentas sem autorização explícita;</li>
        <li>Tentar fazer engenharia reversa ou extrair scripts para uso malicioso;</li>
        <li>Utilizar o portal para sobrecarregar a infraestrutura por meio de acessos automatizados abusivos (bots, scrapers).</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Isenção de Responsabilidade</h2>
      <p>
        As ferramentas e simuladores deste site são fornecidos "como estão" (as is). O Caixa de Tools não oferece garantias implícitas ou explícitas sobre a precisão absoluta de simulações financeiras complexas. Recomendamos que dados financeiros críticos sejam validados junto aos órgãos e profissionais competentes.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Limitações de Danos</h2>
      <p>
        Em nenhum caso o Caixa de Tools ou seus desenvolvedores serão responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar as ferramentas e simuladores, mesmo que notificados sobre tais possibilidades.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. Modificações dos Termos</h2>
      <p>
        Reservamos o direito de revisar estes Termos de Uso a qualquer momento, sem aviso prévio. Ao continuar a usar o site após alterações, você concorda com a versão mais recente dos termos.
      </p>
    </div>
  </div>
</template>
