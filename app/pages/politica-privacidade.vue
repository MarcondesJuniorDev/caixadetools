<script setup lang="ts">
import { useSeoMeta, useHead, definePageMeta } from '#imports'

definePageMeta({
  sidebar: false
})

useSeoMeta({
  title: 'Políticas de Privacidade - Caixa de Tools',
  description: 'Saiba como coletamos, processamos e protegemos seus dados no portal Caixa de Tools de acordo com a LGPD e GDPR.'
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
        No <strong>Caixa de Tools</strong>, a privacidade de nossos visitantes é uma de nossas maiores prioridades. Este documento detalha quais tipos de informações são registradas pelo nosso portal e como elas são utilizadas, assegurando total conformidade com a <strong>LGPD</strong> (Lei Geral de Proteção de Dados - Brasil) e a <strong>GDPR</strong> (General Data Protection Regulation - União Europeia).
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Processamento de Dados Local (No Navegador)</h2>
      <p>
        Comprometidos com a segurança da informação, informamos que a maioria dos nossos simuladores e utilitários web processa as informações inseridas <strong>inteiramente no lado do cliente (Client-Side)</strong>. Isso significa que textos formatados, dados para geração de chaves e simulações de cálculos <strong>não são enviados ou armazenados em nossos servidores</strong>, permanecendo estritamente em seu computador ou dispositivo móvel.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Coleta de Arquivos de Log</h2>
      <p>
        O Caixa de Tools segue um procedimento padrão de uso de arquivos de log. Esses arquivos registram os visitantes quando eles acessam o site. Todas as empresas de hospedagem fazem isso como parte dos serviços de análise administrativa. As informações coletadas pelos arquivos de log incluem:
      </p>
      <ul class="list-disc pl-5 space-y-2">
        <li>Endereço de Protocolo de Internet (IP);</li>
        <li>Tipo de navegador e versão;</li>
        <li>Provedor de Serviços de Internet (ISP);</li>
        <li>Carimbo de data e hora de acesso;</li>
        <li>Páginas de referência, navegação e saída;</li>
        <li>Número de cliques no site.</li>
      </ul>
      <p>
        Esses dados não possuem qualquer ligação com informações de identificação pessoal e são utilizados exclusivamente para analisar tendências de mercado, administrar o site, rastrear o movimento dos usuários e coletar informações demográficas gerais.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Cookies de Terceiros e Google AdSense</h2>
      <p>
        Como o nosso site exibe anúncios e campanhas de monetização, fornecedores terceiros, incluindo o Google, utilizam cookies para veicular anúncios com base em visitas anteriores do usuário a este ou a outros sites.
      </p>
      <p>
        Com o uso de cookies de publicidade, o Google e seus parceiros podem veicular anúncios para os usuários com base nas visitas a este site e/ou a outros sites na Internet.
      </p>
      <p>
        Você pode optar por desativar a publicidade personalizada acessando a página de
        <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">Configurações de Anúncios do Google</a>. Alternativamente, você pode desativar o uso de cookies de terceiros para publicidade personalizada visitando a página
        <a href="http://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">www.aboutads.info</a>.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Seus Direitos de Privacidade (LGPD & GDPR)</h2>
      <p>
        De acordo com as legislações de proteção de dados aplicáveis, você possui os seguintes direitos garantidos:
      </p>
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>Confirmação e Acesso:</strong> Direito de solicitar cópias e confirmação sobre o tratamento de seus dados de navegação.</li>
        <li><strong>Retificação e Correção:</strong> Solicitar a correção de dados incompletos ou inexatos.</li>
        <li><strong>Eliminação e Oposição:</strong> Direito de se opor ao tratamento ou solicitar a exclusão dos cookies de rastreamento do seu navegador.</li>
      </ul>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. Links de Terceiros</h2>
      <p>
        O portal Caixa de Tools pode conter links para sites externos que não são operados por nós. Recomendamos que você leia atentamente a política de privacidade de cada site de terceiros que visitar, pois não possuímos controle ou responsabilidade sobre suas práticas e políticas internas.
      </p>

      <h2 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. Consentimento</h2>
      <p>
        Ao navegar e utilizar as ferramentas do nosso site, você declara estar de acordo com a nossa Política de Privacidade.
      </p>
    </div>
  </div>
</template>
