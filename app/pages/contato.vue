<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useSeoMeta, useHead, definePageMeta } from '#imports'

definePageMeta({
  sidebar: false
})

useSeoMeta({
  title: 'Contato - Caixa de Tools',
  description: 'Entre em contato com a equipe do portal Caixa de Tools para sugestões de ferramentas ou parcerias.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/contato' }
  ]
})

const state = reactive({
  name: '',
  email: '',
  subject: 'Sugestão de Ferramenta',
  message: ''
})

const isPending = ref(false)
const isSuccess = ref(false)

const subjects = [
  { label: 'Sugestão de Ferramenta', value: 'Sugestão de Ferramenta' },
  { label: 'Reportar Bug / Problema', value: 'Reportar Bug / Problema' },
  { label: 'Parcerias / Anúncios', value: 'Parcerias / Anúncios' },
  { label: 'Outros Assuntos', value: 'Outros Assuntos' }
]

const handleSubmit = async () => {
  isPending.value = true
  
  // Simulate API submission
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  isPending.value = false
  isSuccess.value = true
  
  // Reset form
  state.name = ''
  state.email = ''
  state.message = ''
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8 py-6">
    <div class="space-y-3">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Fale Conosco
      </h1>
      <p class="text-base text-slate-500 dark:text-slate-400">
        Tem alguma sugestão de simulador, ferramenta ou encontrou algum problema? Envie sua mensagem abaixo.
      </p>
    </div>

    <!-- Success Feedback Card -->
    <div
      v-if="isSuccess"
      class="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-4 animate-fade-in"
    >
      <div class="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        <UIcon name="i-lucide-user-check" class="size-6" />
      </div>
      <div class="space-y-1">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Mensagem Enviada!</h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Agradecemos o seu contato. Nossa equipe analisará sua mensagem e responderá o mais breve possível.
        </p>
      </div>
      <UButton
        label="Enviar Nova Mensagem"
        color="primary"
        variant="subtle"
        size="sm"
        class="rounded-xl"
        @click="isSuccess = false"
      />
    </div>

    <!-- Contact Form Card -->
    <div
      v-else
      class="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6"
    >
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <!-- Name Input -->
          <UFormField label="Seu Nome" name="name" required>
            <UInput
              v-model="state.name"
              placeholder="Digite seu nome"
              class="w-full"
              required
            />
          </UFormField>

          <!-- Email Input -->
          <UFormField label="Seu E-mail" name="email" required>
            <UInput
              v-model="state.email"
              type="email"
              placeholder="seuemail@exemplo.com"
              class="w-full"
              required
            />
          </UFormField>
        </div>

        <!-- Subject Select -->
        <UFormField label="Assunto" name="subject" required>
          <!-- Using standard native select styled, or a custom select if needed -->
          <select
            v-model="state.subject"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white transition-all"
            required
          >
            <option v-for="sub in subjects" :key="sub.value" :value="sub.value">
              {{ sub.label }}
            </option>
          </select>
        </UFormField>

        <!-- Message Textarea -->
        <UFormField label="Mensagem" name="message" required>
          <UTextarea
            v-model="state.message"
            placeholder="Descreva detalhadamente sua sugestão ou problema..."
            :rows="5"
            autoresize
            class="w-full"
            required
          />
        </UFormField>

        <!-- Submit Button -->
        <div class="pt-2">
          <UButton
            type="submit"
            label="Enviar Mensagem"
            icon="i-lucide-mail"
            color="primary"
            class="w-full sm:w-auto rounded-xl shadow-lg shadow-emerald-500/10"
            :loading="isPending"
          />
        </div>
      </form>
    </div>
  </div>
</template>
