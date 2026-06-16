<script setup lang="ts">
import { useSeoMeta, useHead, definePageMeta } from '#imports'

definePageMeta({
  sidebar: false
})

useSeoMeta({
  title: 'Políticas de Privacidade - Caixa de Tools',
  description: 'Saiba como coletamos e protegemos seus dados no portal Caixa de Tools.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/politica-privacidade' }
  ]
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 py-6">
    <div class="space-y-4">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Políticas de Privacidade
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Última atualização: 16 de Junho de 2026
      </p>
    </div>

    <div class="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
      <p>
        No <strong>Caixa de Tools</strong>, a privacidade de nossos visitantes é de extrema importância. Este documento descreve os tipos de informações pessoais que são coletadas e registradas pelo site, bem como a forma como as utilizamos.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Processamento de Dados no Cliente</h2>
      <p>
        Nossas ferramentas (como formatadores de textos, geradores e simuladores) processam os dados inseridos inteiramente no lado do cliente (Client-Side). Isso significa que as informações inseridas nas caixas de texto ou formulários **não são transmitidas para nossos servidores**, permanecendo seguras em seu próprio navegador.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Arquivos de Log e Cookies</h2>
      <p>
        Como a maioria dos sites padrão, o Caixa de Tools utiliza arquivos de log. As informações nos logs incluem endereços IP (protocolo de internet), tipo de navegador, Provedor de Serviços de Internet (ISP), carimbo de data/hora, páginas de referência/saída e número de cliques. Esses dados são usados apenas para fins estatísticos e de administração do site.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Cookie DART do Google DoubleClick</h2>
      <p>
        O Google, como fornecedor terceirizado, utiliza cookies para veicular anúncios em nosso site.
        O uso do cookie DART pelo Google permite veicular anúncios para nossos usuários com base em suas visitas a este e outros sites na Internet.
        Os usuários podem desativar o uso do cookie DART visitando a Política de Privacidade da rede de conteúdo e anúncios do Google.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Nossos Parceiros de Publicidade</h2>
      <p>
        Alguns dos nossos parceiros publicitários podem utilizar cookies e web beacons no nosso site. Nosso principal parceiro é o:
      </p>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>Google AdSense:</strong> Para mais detalhes sobre as práticas do Google, consulte a <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 hover:underline">política de privacidade de anúncios do Google</a>.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. Controle de Cookies</h2>
      <p>
        Você pode optar por desativar ou desativar seletivamente nossos cookies ou cookies de terceiros nas configurações do seu navegador ou gerenciando preferências em programas utilitários de segurança. No entanto, isso pode afetar a forma como você interage com o nosso site e outros sites.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. Consentimento</h2>
      <p>
        Ao utilizar nosso site, você consente com a nossa Política de Privacidade e concorda com seus Termos de Uso.
      </p>
    </div>
  </div>
</template>
