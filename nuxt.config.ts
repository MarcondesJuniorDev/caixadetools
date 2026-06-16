// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui'
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      script: [
        {
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4947694760683886',
          async: true,
          crossorigin: 'anonymous'
        }
      ],
      meta: [
        {
          name: 'google-adsense-account',
          content: 'ca-pub-4947694760683886'
        }
      ]
    }
  }
})
