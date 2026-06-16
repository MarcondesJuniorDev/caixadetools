<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from '#imports'

const colorMode = useColorMode()
const route = useRoute()

// Reactivity for Dark/Light Mode
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(val) {
    colorMode.preference = val ? 'dark' : 'light'
  }
})

// Mobile Menu State
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Check if page has sidebar enabled (defaults to true unless definePageMeta({ sidebar: false }) is used)
const hasSidebar = computed(() => route.meta.sidebar !== false)

// Navigation Links
const navLinks = [
  { name: 'Início', path: '/' },
  { name: 'Ferramentas', path: '#ferramentas' },
  { name: 'Simuladores', path: '#simuladores' },
  { name: 'Sobre', path: '/sobre' },
  { name: 'Contato', path: '/contato' }
]

// Footer Institutional Links
const institutionalLinks = [
  { name: 'Sobre Nós', path: '/sobre' },
  { name: 'Políticas de Privacidade', path: '/politica-privacidade' },
  { name: 'Termos de Uso', path: '/termos-uso' },
  { name: 'Contato', path: '/contato' }
]
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
    <!-- Header -->
    <header class="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group" id="logo-link">
          <div class="h-9 w-9 rounded-lg bg-gradient-to-tr from-emerald-600 to-emerald-400 dark:from-emerald-500 dark:to-emerald-300 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <UIcon name="i-lucide-wrench" class="size-5" />
          </div>
          <div class="flex flex-col">
            <span class="text-base font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors duration-300">
              Caixa de Tools
            </span>
            <span class="text-[9px] font-medium tracking-wider text-emerald-600 dark:text-emerald-400 uppercase leading-none">
              Utilidades & Simuladores
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
            active-class="bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
          >
            {{ link.name }}
          </NuxtLink>
        </nav>

        <!-- Actions (Dark Mode Switch & Mobile Hamburger) -->
        <div class="flex items-center gap-2">
          <!-- Dark Mode Toggle Button (Rotates on click) -->
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
              color="neutral"
              variant="ghost"
              aria-label="Alternar tema"
              id="theme-toggle"
              class="rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-transform active:scale-95 duration-200 [&_svg]:transition-transform [&_svg]:duration-500"
              :class="isDark ? '[&_svg]:rotate-180' : '[&_svg]:rotate-0'"
              @click="isDark = !isDark"
            />
            <template #fallback>
              <div class="size-8 rounded-lg bg-slate-100 dark:bg-slate-900 animate-pulse" />
            </template>
          </ClientOnly>

          <!-- Mobile Menu Toggle Button -->
          <UButton
            :icon="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'"
            color="neutral"
            variant="ghost"
            class="md:hidden rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            id="mobile-menu-toggle"
            aria-label="Menu principal"
            @click="toggleMobileMenu"
          />
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-96 opacity-100"
        leave-from-class="max-h-96 opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <div v-show="isMobileMenuOpen" class="md:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-950 overflow-hidden shadow-inner transition-colors duration-300">
          <div class="px-4 py-3 space-y-1.5">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white transition-colors"
              active-class="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
              @click="closeMobileMenu"
            >
              {{ link.name }}
            </NuxtLink>
          </div>
        </div>
      </transition>
    </header>

    <!-- AdSense Top Banner (Evita CLS) -->
    <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AdBlock id="adsense-top-banner" type="leaderboard" />
    </div>

    <!-- Main Content Layout Grid -->
    <div class="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div class="grid grid-cols-12 gap-8 items-start">
        <!-- Main Content Area -->
        <main :class="hasSidebar ? 'col-span-12 lg:col-span-9' : 'col-span-12'" class="transition-all duration-300">
          <slot />
        </main>

        <!-- Sidebar (Otimizado para AdSense e Widgets Laterais) -->
        <aside v-if="hasSidebar" class="col-span-12 lg:col-span-3 space-y-6">
          <!-- Sidebar Ad Block (Evita CLS) -->
          <AdBlock id="adsense-sidebar" type="sidebar" />
          
          <!-- Institutional Sidebar Card -->
          <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
            <h3 class="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-info" class="text-emerald-500 size-4" />
              <span>Sobre o Portal</span>
            </h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              O <strong>Caixa de Tools</strong> é um agregador moderno de ferramentas e simuladores utilitários projetados para facilitar o seu dia a dia. Rápido, leve e focado em privacidade.
            </p>
          </div>
        </aside>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 transition-colors duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Col 1: Brand Info -->
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <UIcon name="i-lucide-wrench" class="size-4" />
              </div>
              <span class="text-sm font-bold text-slate-900 dark:text-white">Caixa de Tools</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              As melhores ferramentas e simuladores gratuitos em um único lugar, otimizados para velocidade e acessibilidade.
            </p>
          </div>

          <!-- Col 2: Quick Links (Placeholder for dynamic tool listing) -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 mb-4">Ferramentas</h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="#ferramentas" class="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Calculadoras
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="#ferramentas" class="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Formatadores de Texto
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="#simuladores" class="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Simuladores Financeiros
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Col 3: Institutional Links (AdSense Mandatories) -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-600 mb-4">Institucional</h3>
            <ul class="space-y-2">
              <li v-for="link in institutionalLinks" :key="link.path">
                <NuxtLink :to="link.path" class="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  {{ link.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <span class="text-xs text-slate-400 dark:text-slate-600">
            &copy; {{ new Date().getFullYear() }} Caixa de Tools. Todos os direitos reservados.
          </span>
          <span class="text-[11px] text-slate-400 dark:text-slate-600 flex items-center gap-1">
            Desenvolvido com <UIcon name="i-lucide-heart" class="text-emerald-500 size-3" /> por <strong>Marcondes Jr</strong>.
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>
