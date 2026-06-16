<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useSeoMeta, useHead, useToast } from '#imports'

useSeoMeta({
  title: 'Gerador de Docker Compose Online - Criar docker-compose.yml',
  description: 'Gere arquivos docker-compose.yml de forma visual e rápida. Adicione serviços, configure portas, volumes, variáveis de ambiente e baixe o arquivo.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/desenvolvedor/gerador-docker-compose' }
  ]
})

const toast = useToast()

// --- Types ---
interface PortMapping {
  host: string
  container: string
}

interface EnvVar {
  key: string
  value: string
}

interface VolumeMount {
  host: string
  container: string
}

interface DockerService {
  id: string
  name: string
  image: string
  restart: 'no' | 'always' | 'unless-stopped' | 'on-failure'
  ports: PortMapping[]
  environment: EnvVar[]
  volumes: VolumeMount[]
  dependsOn: string[] // List of other service IDs
  useBuild: boolean
  buildContext: string
  buildDockerfile: string
  containerName: string
  command: string
  envFile: string
}

// --- Helper to create default service structure ---
const createService = (data: Partial<DockerService> & { id: string; name: string }): DockerService => {
  return {
    id: data.id,
    name: data.name,
    image: data.image ?? 'nginx:alpine',
    restart: data.restart ?? 'always',
    ports: data.ports ?? [],
    environment: data.environment ?? [],
    volumes: data.volumes ?? [],
    dependsOn: data.dependsOn ?? [],
    useBuild: data.useBuild ?? false,
    buildContext: data.buildContext ?? '.',
    buildDockerfile: data.buildDockerfile ?? 'Dockerfile',
    containerName: data.containerName ?? '',
    command: data.command ?? '',
    envFile: data.envFile ?? ''
  }
}

// --- State ---
const services = ref<DockerService[]>([
  createService({
    id: '1',
    name: 'web',
    image: 'nginx:alpine',
    restart: 'always',
    ports: [{ host: '80', container: '80' }],
    environment: [{ key: 'NGINX_PORT', value: '80' }],
    volumes: [{ host: './html', container: '/usr/share/nginx/html' }]
  })
])

const activeServiceId = ref<string>('1')

// --- Preset Stack configurations ---
const applyPreset = (presetName: string) => {
  if (presetName === 'lamp') {
    services.value = [
      createService({
        id: '1',
        name: 'php-apache',
        image: 'php:8.2-apache',
        restart: 'unless-stopped',
        ports: [{ host: '80', container: '80' }],
        volumes: [{ host: './src', container: '/var/www/html' }],
        dependsOn: ['2'] // db id
      }),
      createService({
        id: '2',
        name: 'db',
        image: 'mysql:8.0',
        restart: 'always',
        ports: [{ host: '3306', container: '3306' }],
        environment: [
          { key: 'MYSQL_ROOT_PASSWORD', value: 'root_password' },
          { key: 'MYSQL_DATABASE', value: 'my_database' },
          { key: 'MYSQL_USER', value: 'db_user' },
          { key: 'MYSQL_PASSWORD', value: 'db_password' }
        ],
        volumes: [{ host: 'mysql_data', container: '/var/lib/mysql' }]
      })
    ]
    activeServiceId.value = '1'
    toast.add({ title: 'Preset LAMP Aplicado', description: 'Serviços php-apache e MySQL configurados.', color: 'success' })
  } else if (presetName === 'node-postgres-redis') {
    services.value = [
      createService({
        id: '1',
        name: 'app',
        image: 'node:18-alpine',
        restart: 'unless-stopped',
        ports: [{ host: '3000', container: '3000' }],
        environment: [
          { key: 'NODE_ENV', value: 'production' },
          { key: 'DATABASE_URL', value: 'postgresql://user:pass@db:5432/dbname' },
          { key: 'REDIS_URL', value: 'redis://cache:6379' }
        ],
        volumes: [{ host: '.', container: '/usr/src/app' }],
        dependsOn: ['2', '3'] // db and cache ids
      }),
      createService({
        id: '2',
        name: 'db',
        image: 'postgres:15-alpine',
        restart: 'always',
        ports: [{ host: '5432', container: '5432' }],
        environment: [
          { key: 'POSTGRES_USER', value: 'user' },
          { key: 'POSTGRES_PASSWORD', value: 'pass' },
          { key: 'POSTGRES_DB', value: 'dbname' }
        ],
        volumes: [{ host: 'pg_data', container: '/var/lib/postgresql/data' }]
      }),
      createService({
        id: '3',
        name: 'cache',
        image: 'redis:7-alpine',
        restart: 'always',
        ports: [{ host: '6379', container: '6379' }],
        volumes: [{ host: 'redis_data', container: '/data' }]
      })
    ]
    activeServiceId.value = '1'
    toast.add({ title: 'Preset Node + Postgres + Redis', description: 'Serviços app, db e cache configurados.', color: 'success' })
  } else if (presetName === 'mern') {
    services.value = [
      createService({
        id: '1',
        name: 'api',
        image: 'node:18-alpine',
        restart: 'unless-stopped',
        ports: [{ host: '5000', container: '5000' }],
        environment: [
          { key: 'MONGO_URI', value: 'mongodb://mongo:27017/mern_db' },
          { key: 'PORT', value: '5000' }
        ],
        volumes: [{ host: './backend', container: '/app' }],
        dependsOn: ['2'] // mongo id
      }),
      createService({
        id: '2',
        name: 'mongo',
        image: 'mongo:6.0',
        restart: 'always',
        ports: [{ host: '27017', container: '27017' }],
        environment: [
          { key: 'MONGO_INITDB_DATABASE', value: 'mern_db' }
        ],
        volumes: [{ host: 'mongo_data', container: '/data/db' }]
      }),
      createService({
        id: '3',
        name: 'frontend',
        image: 'nginx:alpine',
        restart: 'unless-stopped',
        ports: [{ host: '80', container: '80' }],
        volumes: [{ host: './frontend/dist', container: '/usr/share/nginx/html' }],
        dependsOn: ['1'] // api id
      })
    ]
    activeServiceId.value = '1'
    toast.add({ title: 'Preset MERN Stack', description: 'Serviços api, mongo e frontend configurados.', color: 'success' })
  } else if (presetName === 'python-postgres') {
    services.value = [
      createService({
        id: '1',
        name: 'web',
        image: 'python:3.11-alpine',
        restart: 'unless-stopped',
        ports: [{ host: '8000', container: '8000' }],
        environment: [
          { key: 'PYTHONUNBUFFERED', value: '1' },
          { key: 'DATABASE_URL', value: 'postgresql://db_user:db_password@db:5432/db_name' }
        ],
        volumes: [{ host: '.', container: '/code' }],
        dependsOn: ['2'] // db id
      }),
      createService({
        id: '2',
        name: 'db',
        image: 'postgres:15-alpine',
        restart: 'always',
        ports: [{ host: '5432', container: '5432' }],
        environment: [
          { key: 'POSTGRES_USER', value: 'db_user' },
          { key: 'POSTGRES_PASSWORD', value: 'db_password' },
          { key: 'POSTGRES_DB', value: 'db_name' }
        ],
        volumes: [{ host: 'postgres_data', container: '/var/lib/postgresql/data' }]
      })
    ]
    activeServiceId.value = '1'
    toast.add({ title: 'Preset Python + Postgres Aplicado', description: 'Serviços web (Python) e db (Postgres) configurados.', color: 'success' })
  } else if (presetName === 'laravel-mysql-redis') {
    services.value = [
      createService({
        id: '1',
        name: 'app',
        image: 'php:8.2-apache',
        restart: 'unless-stopped',
        ports: [{ host: '8000', container: '80' }],
        volumes: [{ host: '.', container: '/var/www/html' }],
        dependsOn: ['2', '3'] // db and redis ids
      }),
      createService({
        id: '2',
        name: 'db',
        image: 'mysql:8.0',
        restart: 'always',
        ports: [{ host: '3306', container: '3306' }],
        environment: [
          { key: 'MYSQL_ROOT_PASSWORD', value: 'root_password' },
          { key: 'MYSQL_DATABASE', value: 'laravel_db' },
          { key: 'MYSQL_USER', value: 'laravel_user' },
          { key: 'MYSQL_PASSWORD', value: 'laravel_password' }
        ],
        volumes: [{ host: 'laravel_db_data', container: '/var/lib/mysql' }]
      }),
      createService({
        id: '3',
        name: 'redis',
        image: 'redis:7-alpine',
        restart: 'always',
        ports: [{ host: '6379', container: '6379' }],
        volumes: [{ host: 'redis_data', container: '/data' }]
      })
    ]
    activeServiceId.value = '1'
    toast.add({ title: 'Preset Laravel Aplicado', description: 'Serviços app (PHP Apache), db (MySQL) e redis configurados.', color: 'success' })
  } else if (presetName === 'wordpress-mysql') {
    services.value = [
      createService({
        id: '1',
        name: 'wordpress',
        image: 'wordpress:latest',
        restart: 'unless-stopped',
        ports: [{ host: '8080', container: '80' }],
        environment: [
          { key: 'WORDPRESS_DB_HOST', value: 'db:3306' },
          { key: 'WORDPRESS_DB_USER', value: 'wp_user' },
          { key: 'WORDPRESS_DB_PASSWORD', value: 'wp_password' },
          { key: 'WORDPRESS_DB_NAME', value: 'wp_db' }
        ],
        volumes: [{ host: './wordpress', container: '/var/www/html' }],
        dependsOn: ['2'] // db id
      }),
      createService({
        id: '2',
        name: 'db',
        image: 'mysql:8.0',
        restart: 'always',
        ports: [{ host: '3306', container: '3306' }],
        environment: [
          { key: 'MYSQL_ROOT_PASSWORD', value: 'root_password' },
          { key: 'MYSQL_DATABASE', value: 'wp_db' },
          { key: 'MYSQL_USER', value: 'wp_user' },
          { key: 'MYSQL_PASSWORD', value: 'wp_password' }
        ],
        volumes: [{ host: 'wp_db_data', container: '/var/lib/mysql' }]
      })
    ]
    activeServiceId.value = '1'
    toast.add({ title: 'Preset WordPress Aplicado', description: 'Serviços wordpress e MySQL configurados.', color: 'success' })
  }
}

// --- Methods to mutate services ---
const addService = () => {
  const newId = String(Date.now())
  const newName = `service-${services.value.length + 1}`
  services.value.push(createService({
    id: newId,
    name: newName
  }))
  activeServiceId.value = newId
}

const deleteService = (id: string) => {
  services.value = services.value.filter(s => s.id !== id)
  
  // Remove dependency references
  services.value.forEach(s => {
    s.dependsOn = s.dependsOn.filter(depId => depId !== id)
  })
  
  if (services.value.length > 0) {
    if (activeServiceId.value === id) {
      activeServiceId.value = services.value[0].id
    }
  } else {
    activeServiceId.value = ''
  }
  toast.add({ title: 'Serviço Removido', color: 'neutral' })
}

// --- Inner collections add/remove ---
const addPort = (service: DockerService) => {
  service.ports.push({ host: '', container: '' })
}
const removePort = (service: DockerService, index: number) => {
  service.ports.splice(index, 1)
}

const addEnv = (service: DockerService) => {
  service.environment.push({ key: '', value: '' })
}
const removeEnv = (service: DockerService, index: number) => {
  service.environment.splice(index, 1)
}

const addVolume = (service: DockerService) => {
  service.volumes.push({ host: '', container: '' })
}
const removeVolume = (service: DockerService, index: number) => {
  service.volumes.splice(index, 1)
}

// Helper to sanitize service names (only lowercase, digits, dashes and underscores)
const sanitizeServiceName = (name: string) => {
  return name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'service'
}

// Helper to determine if a volume is named volume (letters, digits, underscores, dashes only)
const isNamedVolume = (h: string) => {
  return /^[a-zA-Z0-9_-]+$/.test(h)
}

// --- Generated output ---
const generatedYaml = computed(() => {
  if (services.value.length === 0) {
    return '# Nenhum serviço adicionado. Crie ou selecione um preset para começar.'
  }

  let yaml = `version: '3.8'\n\nservices:\n`
  
  services.value.forEach(service => {
    const sName = sanitizeServiceName(service.name)
    yaml += `  ${sName}:\n`
    
    // Build vs Image
    if (service.useBuild) {
      yaml += `    build:\n`
      yaml += `      context: ${service.buildContext.trim() || '.'}\n`
      if (service.buildDockerfile.trim() && service.buildDockerfile.trim() !== 'Dockerfile') {
        yaml += `      dockerfile: ${service.buildDockerfile.trim()}\n`
      }
    } else {
      yaml += `    image: ${service.image.trim() || 'nginx:alpine'}\n`
    }
    
    // Container Name
    if (service.containerName.trim()) {
      yaml += `    container_name: ${service.containerName.trim()}\n`
    }
    
    if (service.restart && service.restart !== 'no') {
      yaml += `    restart: ${service.restart}\n`
    }
    
    // Ports
    const activePorts = service.ports.filter(p => p.container.trim())
    if (activePorts.length > 0) {
      yaml += `    ports:\n`
      activePorts.forEach(p => {
        if (p.host.trim()) {
          yaml += `      - "${p.host.trim()}:${p.container.trim()}"\n`
        } else {
          yaml += `      - "${p.container.trim()}"\n`
        }
      })
    }
    
    // Env File
    if (service.envFile.trim()) {
      yaml += `    env_file:\n`
      yaml += `      - ${service.envFile.trim()}\n`
    }
    
    // Env Vars
    const activeEnv = service.environment.filter(e => e.key.trim())
    if (activeEnv.length > 0) {
      yaml += `    environment:\n`
      activeEnv.forEach(e => {
        const val = e.value.trim()
        const quotedVal = val.includes(' ') || val.includes('$') || val.includes('{') || val.includes('}') ? `"${val}"` : val
        yaml += `      - ${e.key.trim()}=${quotedVal}\n`
      })
    }
    
    // Volumes
    const activeVols = service.volumes.filter(v => v.container.trim())
    if (activeVols.length > 0) {
      yaml += `    volumes:\n`
      activeVols.forEach(v => {
        if (v.host.trim()) {
          yaml += `      - ${v.host.trim()}:${v.container.trim()}\n`
        } else {
          yaml += `      - ${v.container.trim()}\n`
        }
      })
    }
    
    // Startup Command
    if (service.command.trim()) {
      yaml += `    command: ${service.command.trim()}\n`
    }
    
    // Dependencies
    if (service.dependsOn && service.dependsOn.length > 0) {
      const activeDeps = service.dependsOn
        .map(depId => services.value.find(s => s.id === depId))
        .filter(Boolean) as DockerService[]
        
      if (activeDeps.length > 0) {
        yaml += `    depends_on:\n`
        activeDeps.forEach(dep => {
          yaml += `      - ${sanitizeServiceName(dep.name)}\n`
        })
      }
    }
    
    yaml += `\n`
  })

  // Detect named volumes
  const namedVolumes: string[] = []
  services.value.forEach(s => {
    s.volumes.forEach(v => {
      const h = v.host.trim()
      if (h && isNamedVolume(h)) {
        if (!namedVolumes.includes(h)) {
          namedVolumes.push(h)
        }
      }
    })
  })

  if (namedVolumes.length > 0) {
    yaml += `volumes:\n`
    namedVolumes.forEach(vol => {
      yaml += `  ${vol}:\n`
    })
  }

  return yaml.trim()
})

// --- Custom regex-based colorizer ---
const highlightedYaml = computed(() => {
  const text = generatedYaml.value
  if (!text) return ''
  
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  const strings: string[] = []
  const comments: string[] = []
  
  // 1. Extract strings (both double and single quoted) first to prevent their contents from being highlighted
  html = html.replace(/(".*?"|'.*?')/g, (match) => {
    const placeholder = `___STRING_PLACEHOLDER_${strings.length}___`
    strings.push(`<span class="text-amber-600 dark:text-amber-400">${match}</span>`)
    return placeholder
  })
  
  // 2. Extract comments
  html = html.replace(/(#[^\n]*)/g, (match) => {
    const placeholder = `___COMMENT_PLACEHOLDER_${comments.length}___`
    comments.push(`<span class="text-slate-500">${match}</span>`)
    return placeholder
  })
  
  // 3. Highlight keys (emerald)
  html = html.replace(/^(\s*)([a-zA-Z0-9_-]+)(:)/gm, '$1<span class="text-emerald-600 dark:text-emerald-400 font-bold">$2</span>$3')
  
  // 4. Highlight dashes
  html = html.replace(/^(\s*)(-)/gm, '$1<span class="text-emerald-600 dark:text-emerald-400 font-bold">$2</span>')

  // 5. Highlight keywords
  html = html.replace(/\b(always|unless-stopped|on-failure|no|true|false)\b/g, '<span class="text-indigo-600 dark:text-indigo-400 font-semibold">$1</span>')
  
  // 6. Restore strings
  strings.forEach((strHtml, index) => {
    html = html.replace(`___STRING_PLACEHOLDER_${index}___`, strHtml)
  })
  
  // 7. Restore comments
  comments.forEach((comHtml, index) => {
    html = html.replace(`___COMMENT_PLACEHOLDER_${index}___`, comHtml)
  })
  
  return html
})

// --- Share & Copy actions ---
const isCopied = ref(false)

const copyYaml = async () => {
  try {
    await navigator.clipboard.writeText(generatedYaml.value)
    isCopied.value = true
    toast.add({ title: 'Copiado!', description: 'Arquivo YAML copiado para a área de transferência.', color: 'success' })
    setTimeout(() => { isCopied.value = false }, 2000)
  } catch (err) {
    console.error('Erro ao copiar:', err)
  }
}

const downloadYaml = () => {
  const blob = new Blob([generatedYaml.value], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'docker-compose.yml'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  toast.add({ title: 'Download Iniciado', description: 'Arquivo docker-compose.yml baixado.', color: 'success' })
}

const currentService = computed(() => {
  return services.value.find(s => s.id === activeServiceId.value)
})
</script>

<template>
  <div class="space-y-6 py-4 relative">
    <!-- Ambient Light Blurs -->
    <div class="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 dark:bg-emerald-900/5 blur-[100px] pointer-events-none -z-10" />
    <div class="absolute bottom-[20%] right-[-5%] w-[500px] h-[500px] rounded-full bg-teal-500/10 dark:bg-teal-900/5 blur-[120px] pointer-events-none -z-10" />

    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Gerador de Docker Compose
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure serviços, portas, volumes e variáveis de ambiente de forma visual para criar o seu docker-compose.yml completo.
        </p>
      </div>
    </div>

    <!-- Presets bar -->
    <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2.5">
      <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Templates Populares</span>
      <div class="flex flex-wrap gap-2">
        <UButton
          label="LAMP (PHP + Apache + MySQL)"
          icon="i-lucide-globe"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg font-bold"
          @click="applyPreset('lamp')"
        />
        <UButton
          label="Node + Postgres + Redis"
          icon="i-lucide-database"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg font-bold"
          @click="applyPreset('node-postgres-redis')"
        />
        <UButton
          label="MERN Stack (Node + React + Mongo)"
          icon="i-lucide-layers"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg font-bold"
          @click="applyPreset('mern')"
        />
        <UButton
          label="Python + Postgres"
          icon="i-lucide-terminal"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg font-bold"
          @click="applyPreset('python-postgres')"
        />
        <UButton
          label="Laravel (PHP + MySQL + Redis)"
          icon="i-lucide-server"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg font-bold"
          @click="applyPreset('laravel-mysql-redis')"
        />
        <UButton
          label="WordPress + MySQL"
          icon="i-lucide-layout-template"
          color="neutral"
          variant="subtle"
          size="sm"
          class="rounded-lg font-bold"
          @click="applyPreset('wordpress-mysql')"
        />
      </div>
    </div>

    <!-- Generator layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Editor (Left Column - 6 cols) -->
      <div class="lg:col-span-6 space-y-6">
        
        <!-- Services Accordion Tab bar -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-5">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <UIcon name="i-lucide-boxes" class="text-emerald-500 size-4" />
              <span>Configurar Serviços</span>
            </h2>
            <UButton
              label="Adicionar Serviço"
              icon="i-lucide-plus"
              color="primary"
              size="xs"
              class="rounded-lg font-bold"
              @click="addService"
            />
          </div>

          <!-- Services List buttons -->
          <div v-if="services.length > 0" class="flex flex-wrap gap-1.5">
            <div
              v-for="s in services"
              :key="s.id"
              class="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200"
            >
              <button
                type="button"
                :class="[
                  'px-2 py-0.5 text-xs font-mono font-bold transition-all',
                  s.id === activeServiceId
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                ]"
                @click="activeServiceId = s.id"
              >
                {{ s.name }}
              </button>
              <button
                type="button"
                class="text-slate-400 hover:text-rose-500 p-0.5"
                title="Excluir Serviço"
                @click.stop="deleteService(s.id)"
              >
                <UIcon name="i-lucide-trash-2" class="size-3.5" />
              </button>
            </div>
          </div>

          <!-- Empty services placeholder -->
          <div v-else class="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center space-y-4">
            <UIcon name="i-lucide-box" class="text-slate-400 size-10 mx-auto" />
            <div class="space-y-1">
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhum serviço configurado</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Adicione um novo serviço ou escolha um preset acima para gerar o docker-compose.yml.</p>
            </div>
            <UButton
              label="Adicionar Novo Serviço"
              icon="i-lucide-plus"
              color="primary"
              size="sm"
              class="rounded-xl font-bold shadow"
              @click="addService"
            />
          </div>

          <!-- Service Editor Form -->
          <div v-if="currentService" class="space-y-4 pt-2 animate-in fade-in duration-300">
            
            <!-- Basic Properties -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label for="srv-name" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nome do Serviço</label>
                <input
                  id="srv-name"
                  v-model="currentService.name"
                  type="text"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div class="space-y-1">
                <label for="srv-restart" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Restart Policy (Reinicialização)</label>
                <select
                  id="srv-restart"
                  v-model="currentService.restart"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="no">no (Não reiniciar)</option>
                  <option value="always">always (Sempre reiniciar)</option>
                  <option value="unless-stopped">unless-stopped (Reiniciar exceto se parado)</option>
                  <option value="on-failure">on-failure (Reiniciar se falhar)</option>
                </select>
              </div>
            </div>

            <!-- Build vs Image Toggle -->
            <div class="space-y-1.5 pt-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Origem do Serviço (Build ou Imagem)</span>
              <div class="flex gap-2">
                <button
                  type="button"
                  :class="[
                    'flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5',
                    !currentService.useBuild
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                  ]"
                  @click="currentService.useBuild = false"
                >
                  <UIcon name="i-lucide-image" class="size-3.5" />
                  Imagem Pronta (image)
                </button>
                <button
                  type="button"
                  :class="[
                    'flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5',
                    currentService.useBuild
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                  ]"
                  @click="currentService.useBuild = true"
                >
                  <UIcon name="i-lucide-wrench" class="size-3.5" />
                  Construir Local (build)
                </button>
              </div>
            </div>

            <!-- Image input / Suggestions OR Build inputs -->
            <div v-if="!currentService.useBuild" class="animate-in fade-in duration-200">
              <div class="space-y-1">
                <label for="srv-image" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Imagem Container</label>
                <input
                  id="srv-image"
                  v-model="currentService.image"
                  type="text"
                  placeholder="ex: nginx:alpine"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-semibold font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div v-else class="grid grid-cols-2 gap-4 animate-in fade-in duration-200">
              <div class="space-y-1">
                <label for="srv-context" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contexto de Build (context)</label>
                <input
                  id="srv-context"
                  v-model="currentService.buildContext"
                  type="text"
                  placeholder="ex: . ou ./backend"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div class="space-y-1">
                <label for="srv-dockerfile" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Dockerfile (opcional)</label>
                <input
                  id="srv-dockerfile"
                  v-model="currentService.buildDockerfile"
                  type="text"
                  placeholder="ex: Dockerfile ou Dockerfile.dev"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <!-- Advanced Options Accordion -->
            <details class="group border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden transition-all">
              <summary class="flex justify-between items-center p-3 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/30 transition-all select-none list-none [&::-webkit-details-marker]:hidden">
                <span class="flex items-center gap-1.5">
                  <UIcon name="i-lucide-sliders-horizontal" class="text-emerald-500 size-4" />
                  <span>Configurações Adicionais (Avançado)</span>
                </span>
                <UIcon name="i-lucide-chevron-right" class="size-4 text-slate-400 group-open:rotate-90 transition-transform duration-200" />
              </summary>
              <div class="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-950/50">
                <!-- Container Name & Env File -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label for="srv-container-name" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nome do Container (container_name)</label>
                    <input
                      id="srv-container-name"
                      v-model="currentService.containerName"
                      type="text"
                      placeholder="ex: api-container"
                      class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div class="space-y-1">
                    <label for="srv-env-file" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Arquivo Env (env_file)</label>
                    <input
                      id="srv-env-file"
                      v-model="currentService.envFile"
                      type="text"
                      placeholder="ex: .env"
                      class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <!-- Start Command -->
                <div class="space-y-1">
                  <label for="srv-command" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Comando de Inicialização (command)</label>
                  <input
                    id="srv-command"
                    v-model="currentService.command"
                    type="text"
                    placeholder="ex: npm run dev ou python manage.py runserver"
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </details>

            <!-- Ports Mapping -->
            <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mapeamento de Portas (Host:Container)</span>
                <UButton
                  label="Adicionar"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                  class="rounded-lg font-bold"
                  @click="addPort(currentService)"
                />
              </div>
              <div v-if="currentService.ports.length === 0" class="text-xs text-slate-400 italic">Sem mapeamento de portas.</div>
              <div class="space-y-1.5">
                <div v-for="(p, idx) in currentService.ports" :key="idx" class="flex gap-2 items-center">
                  <input
                    v-model="p.host"
                    type="text"
                    placeholder="Host (ex: 8080)"
                    class="w-1/2 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span class="text-slate-400 text-xs">:</span>
                  <input
                    v-model="p.container"
                    type="text"
                    placeholder="Container (ex: 80)"
                    class="w-1/2 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button type="button" class="text-rose-500 p-1" @click="removePort(currentService, idx)">
                    <UIcon name="i-lucide-x" class="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Environment Variables -->
            <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Variáveis de Ambiente (Environment)</span>
                <UButton
                  label="Adicionar"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                  class="rounded-lg font-bold"
                  @click="addEnv(currentService)"
                />
              </div>
              <div v-if="currentService.environment.length === 0" class="text-xs text-slate-400 italic">Sem variáveis de ambiente.</div>
              <div class="space-y-1.5">
                <div v-for="(e, idx) in currentService.environment" :key="idx" class="flex gap-2 items-center">
                  <input
                    v-model="e.key"
                    type="text"
                    placeholder="CHAVE"
                    class="w-1/2 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase font-bold"
                  />
                  <span class="text-slate-400 text-xs">=</span>
                  <input
                    v-model="e.value"
                    type="text"
                    placeholder="valor"
                    class="w-1/2 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button type="button" class="text-rose-500 p-1" @click="removeEnv(currentService, idx)">
                    <UIcon name="i-lucide-x" class="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Volumes mapping -->
            <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Volumes (Host:Container ou Volume Nomeado)</span>
                <UButton
                  label="Adicionar"
                  icon="i-lucide-plus"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                  class="rounded-lg font-bold"
                  @click="addVolume(currentService)"
                />
              </div>
              <div v-if="currentService.volumes.length === 0" class="text-xs text-slate-400 italic">Sem volumes.</div>
              <div class="space-y-1.5">
                <div v-for="(v, idx) in currentService.volumes" :key="idx" class="flex gap-2 items-center">
                  <input
                    v-model="v.host"
                    type="text"
                    placeholder="Host (ex: ./data ou pg_data)"
                    class="w-1/2 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span class="text-slate-400 text-xs">:</span>
                  <input
                    v-model="v.container"
                    type="text"
                    placeholder="Container (ex: /var/lib/mysql)"
                    class="w-1/2 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button type="button" class="text-rose-500 p-1" @click="removeVolume(currentService, idx)">
                    <UIcon name="i-lucide-x" class="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Dependencies (Depends on) -->
            <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Dependência do Serviço (depends_on)</span>
              <div class="flex flex-wrap gap-3">
                <label
                  v-for="other in services.filter(s => s.id !== currentService.id)"
                  :key="other.id"
                  class="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="other.id"
                    v-model="currentService.dependsOn"
                    class="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>{{ other.name }}</span>
                </label>
              </div>
              <div v-if="services.length <= 1" class="text-xs text-slate-400 italic">Adicione mais serviços para poder configurar dependências.</div>
            </div>

          </div>
        </div>

      </div>

      <!-- Output Preview (Right Column - 6 cols) -->
      <div class="lg:col-span-6 space-y-6">
        
        <!-- Live YAML Render -->
        <div class="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                docker-compose.yml
              </h3>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Código gerado em tempo real com sintaxe realçada.</p>
            </div>
            <div class="flex gap-2">
              <UButton
                :label="isCopied ? 'Copiado!' : 'Copiar'"
                :icon="isCopied ? 'i-lucide-check' : 'i-lucide-copy'"
                color="neutral"
                variant="subtle"
                size="xs"
                class="rounded-lg font-bold"
                :disabled="services.length === 0"
                @click="copyYaml"
              />
              <UButton
                label="Download"
                icon="i-lucide-download"
                color="primary"
                size="xs"
                class="rounded-lg font-bold"
                :disabled="services.length === 0"
                @click="downloadYaml"
              />
            </div>
          </div>

          <!-- Highlight Code Box -->
          <div class="relative w-full rounded-xl p-4 bg-slate-50 dark:bg-slate-950/90 text-slate-800 dark:text-slate-300 font-mono text-xs overflow-auto border border-slate-200 dark:border-slate-900 min-h-[350px] max-h-[600px] leading-relaxed select-all">
            <pre v-html="highlightedYaml"></pre>
          </div>
        </div>

        <!-- Explanatory Docker Compose FAQ -->
        <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm text-xs space-y-2">
          <h4 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <UIcon name="i-lucide-help-circle" class="text-emerald-500 size-4" />
            <span>Como usar o arquivo gerado?</span>
          </h4>
          <ol class="list-decimal pl-4 space-y-1.5 text-slate-500 dark:text-slate-400">
            <li>Copie o código gerado acima ou clique no botão <strong>Download</strong> para baixar o arquivo como <code class="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded font-mono">docker-compose.yml</code>.</li>
            <li>Coloque o arquivo na pasta raiz do seu projeto.</li>
            <li>Certifique-se de que o Docker e o Docker Compose estejam instalados na sua máquina.</li>
            <li>Abra o terminal na pasta onde colocou o arquivo e execute o comando:
              <pre class="bg-slate-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-900 p-2 rounded-lg font-mono text-[10px] mt-1 select-all">docker compose up -d</pre>
              O parâmetro <code class="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded font-mono">-d</code> executa os containers em segundo plano (background).
            </li>
          </ol>
        </div>

      </div>

    </div>

    <!-- Educational AdBlocker -->
    <AdBlock id="adsense-compose-footer" type="leaderboard" />
  </div>
</template>

<style scoped>
pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
