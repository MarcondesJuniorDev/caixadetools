<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSeoMeta, useHead, useToast } from '#imports'

useSeoMeta({
  title: 'Conversor de Documentos Online - PDF, Word, ODT, JSON, CSV',
  description: 'Converta seus documentos e dados estruturados localmente de forma 100% segura. Suporta PDF para Texto, DOCX para PDF, ODT para Texto, JSON para CSV/XML/YAML e Markdown.'
})

useHead({
  link: [
    { rel: 'canonical', href: 'https://caixadetools.com/texto/conversor' }
  ]
})

const toast = useToast()

// --- State ---
const activeTab = ref('office') // 'office' | 'structured'
const isProcessing = ref(false)
const processingStatus = ref('')
const conversionError = ref('')

// Office tab state
const officeFile = ref<File | null>(null)
const officeOperation = ref('pdf-txt') // 'pdf-txt' | 'docx-pdf' | 'docx-txt' | 'odt-txt' | 'html-pdf'
const officeTextOutput = ref('')
const officeHtmlOutput = ref('') // Render preview for docx/html-pdf
const richTextInput = ref('') // Text input for HTML/MD to PDF conversion

// Structured tab state
const structuredInput = ref('')
const structuredOperation = ref('json-csv')
const structuredOutput = ref('')
const autoConvertStructured = ref(true)

// --- Helper to load CDN scripts on demand ---
const loadedScripts = new Set<string>()
const loadScript = (url: string, globalName: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any)[globalName]) {
      resolve((window as any)[globalName])
      return
    }
    if (loadedScripts.has(url)) {
      // Wait for existing script tag to load
      const interval = setInterval(() => {
        if ((window as any)[globalName]) {
          clearInterval(interval)
          resolve((window as any)[globalName])
        }
      }, 50)
      return
    }
    loadedScripts.add(url)
    const script = document.createElement('script')
    script.src = url
    script.onload = () => resolve((window as any)[globalName])
    script.onerror = (err) => {
      loadedScripts.delete(url)
      reject(err)
    }
    document.head.appendChild(script)
  })
}

// ============================================================================
// 1. OFFICE CONVERSION OPERATIONS
// ============================================================================

// PDF -> Text Extraction
const convertPdfToText = async (file: File): Promise<string> => {
  processingStatus.value = 'Carregando biblioteca PDF.js...'
  const pdfjs = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js', 'pdfjsLib')
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'
  
  processingStatus.value = 'Lendo arquivo PDF...'
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    processingStatus.value = `Extraindo página ${i} de ${pdf.numPages}...`
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: any) => item.str).join(' ')
    fullText += `--- Página ${i} ---\n${pageText}\n\n`
  }
  return fullText.trim()
}

// DOCX -> HTML / Text
const convertDocxToText = async (file: File): Promise<{ html: string; text: string }> => {
  processingStatus.value = 'Carregando biblioteca Mammoth...'
  const mammothLib = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js', 'mammoth')
  
  processingStatus.value = 'Lendo arquivo Word...'
  const arrayBuffer = await file.arrayBuffer()
  const resultHtml = await mammothLib.convertToHtml({ arrayBuffer })
  const resultText = await mammothLib.extractRawText({ arrayBuffer })
  
  return {
    html: resultHtml.value,
    text: resultText.value
  }
}

// ODT -> Text (JSZip content.xml parsing)
const convertOdtToText = async (file: File): Promise<string> => {
  processingStatus.value = 'Carregando descompactador JSZip...'
  const jszipLib = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', 'JSZip')
  
  processingStatus.value = 'Lendo arquivo ODT...'
  const zip = await jszipLib.loadAsync(file)
  const contentXmlFile = zip.file('content.xml')
  if (!contentXmlFile) {
    throw new Error('Formato ODT inválido (content.xml não encontrado).')
  }
  
  processingStatus.value = 'Processando tags de texto ODT...'
  const contentXmlText = await contentXmlFile.async('text')
  
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(contentXmlText, 'text/xml')
  
  // ODT text is inside text:p and text:h tags
  const paragraphs = xmlDoc.getElementsByTagName('text:p')
  let extracted = ''
  for (let i = 0; i < paragraphs.length; i++) {
    extracted += (paragraphs[i].textContent || '') + '\n'
  }
  return extracted.trim()
}

// Rich Text/HTML -> PDF
const generatePdfFromHtml = async (htmlContent: string, filename = 'documento.pdf') => {
  processingStatus.value = 'Carregando compilador PDF...'
  const html2pdfLib = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', 'html2pdf')
  
  processingStatus.value = 'Gerando layout PDF...'
  const element = document.createElement('div')
  element.className = 'markdown-body p-8 bg-white text-slate-800 leading-relaxed font-sans text-sm'
  element.innerHTML = htmlContent
  
  const opt = {
    margin: 15,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  
  processingStatus.value = 'Renderizando e baixando...'
  await html2pdfLib().set(opt).from(element).save()
}

const handleOfficeConvert = async () => {
  conversionError.value = ''
  officeTextOutput.value = ''
  officeHtmlOutput.value = ''
  
  if (officeOperation.value === 'html-pdf') {
    if (!richTextInput.value.trim()) {
      conversionError.value = 'Escreva ou cole algum conteúdo de texto para converter em PDF.'
      return
    }
    isProcessing.value = true
    try {
      // If it is markdown, parse headers and paragraphs simply
      const simpleMdHtml = richTextInput.value
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n/g, '<br />')
      
      await generatePdfFromHtml(simpleMdHtml, 'documento_texto.pdf')
      toast.add({ title: 'PDF Criado', description: 'O download do PDF foi iniciado.', color: 'success' })
    } catch (err: any) {
      conversionError.value = err.message || 'Falha ao gerar o PDF.'
    } finally {
      isProcessing.value = false
    }
    return
  }

  if (!officeFile.value) {
    conversionError.value = 'Por favor, selecione um arquivo para conversão.'
    return
  }

  isProcessing.value = true
  try {
    const file = officeFile.value
    if (officeOperation.value === 'pdf-txt') {
      const txt = await convertPdfToText(file)
      officeTextOutput.value = txt
    } else if (officeOperation.value === 'docx-txt') {
      const res = await convertDocxToText(file)
      officeTextOutput.value = res.text
      officeHtmlOutput.value = res.html
    } else if (officeOperation.value === 'docx-pdf') {
      const res = await convertDocxToText(file)
      await generatePdfFromHtml(res.html, file.name.replace(/\.[^/.]+$/, "") + '.pdf')
      toast.add({ title: 'Conversão Efetuada', description: 'Seu arquivo Word foi baixado como PDF.', color: 'success' })
    } else if (officeOperation.value === 'odt-txt') {
      const txt = await convertOdtToText(file)
      officeTextOutput.value = txt
    }
  } catch (err: any) {
    conversionError.value = err.message || 'Erro durante o processamento do documento.'
  } finally {
    isProcessing.value = false
  }
}

const handleOfficeFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    officeFile.value = target.files[0]
    conversionError.value = ''
    
    // Auto detect operation based on extension
    const ext = officeFile.value.name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      officeOperation.value = 'pdf-txt'
    } else if (ext === 'docx') {
      officeOperation.value = 'docx-txt'
    } else if (ext === 'odt') {
      officeOperation.value = 'odt-txt'
    }
  }
}

const removeOfficeFile = () => {
  officeFile.value = null
  officeTextOutput.value = ''
  officeHtmlOutput.value = ''
  conversionError.value = ''
}

const downloadTxtOffice = () => {
  if (!officeTextOutput.value) return
  const blob = new Blob([officeTextOutput.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `caixa_de_tools_extraido.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const copyTextOffice = async () => {
  try {
    await navigator.clipboard.writeText(officeTextOutput.value)
    toast.add({ title: 'Copiado!', description: 'Texto extraído copiado.', color: 'success' })
  } catch (err) {
    toast.add({ title: 'Erro', description: 'Não foi possível copiar.', color: 'danger' })
  }
}


// ============================================================================
// 2. STRUCTURED DATA CONVERSION OPERATIONS
// ============================================================================

const jsonToCsv = (jsonStr: string): string => {
  try {
    const obj = JSON.parse(jsonStr.trim())
    const array = Array.isArray(obj) ? obj : [obj]
    if (array.length === 0) return ''
    const headersSet = new Set<string>()
    array.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(k => headersSet.add(k))
      }
    })
    const headers = Array.from(headersSet)
    if (headers.length === 0) return ''
    const csvRows = [headers.join(',')]
    for (const row of array) {
      const values = headers.map(header => {
        const val = row[header]
        if (val === undefined || val === null) return '""'
        const escaped = (typeof val === 'object' ? JSON.stringify(val) : String(val)).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    }
    return csvRows.join('\n')
  } catch (err) {
    return ''
  }
}

const csvToJson = (csvStr: string): string => {
  try {
    const lines = csvStr.split('\n').map(l => l.trim()).filter(l => l !== '')
    if (lines.length === 0) return '[]'
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const c = line[i]
        if (c === '"') inQuotes = !inQuotes
        else if (c === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else current += c
      }
      result.push(current.trim())
      return result.map(v => v.replace(/^["']|["']$/g, '').replace(/""/g, '"'))
    }
    const headers = parseCSVLine(lines[0])
    const result = []
    for (let i = 1; i < lines.length; i++) {
      const obj: Record<string, any> = {}
      const currentline = parseCSVLine(lines[i])
      headers.forEach((header, idx) => {
        const val = currentline[idx] || ''
        if (val.toLowerCase() === 'true') obj[header] = true
        else if (val.toLowerCase() === 'false') obj[header] = false
        else if (val !== '' && !isNaN(Number(val))) obj[header] = Number(val)
        else obj[header] = val
      })
      result.push(obj)
    }
    return JSON.stringify(result, null, 2)
  } catch (err) {
    return ''
  }
}

const jsonToXml = (jsonStr: string): string => {
  try {
    const obj = JSON.parse(jsonStr.trim())
    const toXml = (val: any, rootName = 'root'): string => {
      if (val === null) return `<${rootName} />`
      if (typeof val !== 'object') {
        const safeVal = String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        return `<${rootName}>${safeVal}</${rootName}>`
      }
      if (Array.isArray(val)) {
        return val.map(item => toXml(item, rootName + '-item')).join('\n')
      }
      const keys = Object.keys(val)
      const body = keys.map(k => toXml(val[k], k)).join('\n')
      return `<${rootName}>\n${body.split('\n').map(l => '  ' + l).join('\n')}\n</${rootName}>`
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n` + toXml(obj)
  } catch (err) {
    return ''
  }
}

const xmlToJson = (xmlStr: string): string => {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlStr.trim(), 'text/xml')
    const rootElement = xmlDoc.documentElement
    if (!rootElement || xmlDoc.querySelector('parsererror')) return ''
    
    const parseNode = (node: Node): any => {
      if (node.nodeType === Node.TEXT_NODE) return node.nodeValue?.trim() || null
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const obj: any = {}
        if (element.attributes.length > 0) {
          obj['@attributes'] = {}
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i]
            obj['@attributes'][attr.nodeName] = attr.nodeValue
          }
        }
        if (element.hasChildNodes()) {
          const textChildren = Array.from(element.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim())
          const elementChildren = Array.from(element.childNodes).filter(n => n.nodeType === Node.ELEMENT_NODE)
          if (elementChildren.length === 0 && textChildren.length > 0) {
            const textVal = textChildren[0].nodeValue?.trim() || ''
            if (element.attributes.length === 0) return textVal
            obj['#text'] = textVal
          } else {
            for (let i = 0; i < element.childNodes.length; i++) {
              const child = element.childNodes[i]
              if (child.nodeType !== Node.ELEMENT_NODE) continue
              const childName = child.nodeName
              const childVal = parseNode(child)
              if (obj[childName] === undefined) obj[childName] = childVal
              else {
                if (!Array.isArray(obj[childName])) obj[childName] = [obj[childName]]
                obj[childName].push(childVal)
              }
            }
          }
        }
        return obj
      }
      return null
    }
    
    const result: any = {}
    result[rootElement.nodeName] = parseNode(rootElement)
    return JSON.stringify(result, null, 2)
  } catch (err) {
    return ''
  }
}

const jsonToYaml = (jsonStr: string): string => {
  try {
    const obj = JSON.parse(jsonStr.trim())
    const stringify = (val: any, depth = 0): string => {
      const indent = '  '.repeat(depth)
      if (val === null) return 'null'
      if (typeof val === 'string') {
        if (val.includes('\n')) return `|\n${val.split('\n').map(l => indent + '  ' + l).join('\n')}`
        return val.includes(' ') || val.includes(':') ? `"${val.replace(/"/g, '\\"')}"` : val
      }
      if (typeof val !== 'object') return String(val)
      if (Array.isArray(val)) {
        if (val.length === 0) return '[]'
        return '\n' + val.map(item => `${indent}- ${stringify(item, depth + 1).trim()}`).join('\n')
      }
      const keys = Object.keys(val)
      if (keys.length === 0) return '{}'
      return '\n' + keys.map(k => {
        const v = val[k]
        const valueStr = stringify(v, depth + 1)
        if (typeof v === 'object' && v !== null) return `${indent}${k}:${valueStr}`
        return `${indent}${k}: ${valueStr.trim()}`
      }).join('\n')
    }
    return stringify(obj).trim()
  } catch (err) {
    return ''
  }
}

const yamlToJson = (yamlStr: string): string => {
  try {
    const lines = yamlStr.split('\n')
    const result: any = {}
    const stack: { indent: number; obj: any; key?: string }[] = [{ indent: -1, obj: result }]
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const indent = line.length - line.trimStart().length
      if (trimmed.startsWith('-')) {
        const val = trimmed.slice(1).trim()
        let parent = stack[stack.length - 1]
        while (parent && parent.indent >= indent) {
          stack.pop()
          parent = stack[stack.length - 1]
        }
        if (parent) {
          if (!Array.isArray(parent.obj)) {
            const pObj = parent.obj
            const pKey = parent.key
            if (pKey) {
              pObj[pKey] = pObj[pKey] || []
              if (!Array.isArray(pObj[pKey])) pObj[pKey] = [pObj[pKey]]
              pObj[pKey].push(val)
            }
          } else parent.obj.push(val)
        }
      } else {
        const colonIdx = trimmed.indexOf(':')
        if (colonIdx === -1) continue
        const key = trimmed.slice(0, colonIdx).trim()
        const val = trimmed.slice(colonIdx + 1).replace(/^["']|["']$/g, '').trim()
        let parent = stack[stack.length - 1]
        while (parent && parent.indent >= indent) {
          stack.pop()
          parent = stack[stack.length - 1]
        }
        if (parent) {
          const currentObj = parent.obj
          if (val) {
            if (val.toLowerCase() === 'true') currentObj[key] = true
            else if (val.toLowerCase() === 'false') currentObj[key] = false
            else currentObj[key] = isNaN(Number(val)) ? val : Number(val)
          } else {
            currentObj[key] = {}
            stack.push({ indent, obj: currentObj[key], key })
          }
        }
      }
    }
    return JSON.stringify(result, null, 2)
  } catch (err) {
    return ''
  }
}

// Markdown -> HTML / HTML -> Markdown
const mdHtml = (str: string) => {
  return str.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .split(/\n{2,}/)
    .map(p => p.trim().startsWith('<h') ? p : `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('\n')
}
const htmlMd = (str: string) => {
  let md = str.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gim, '# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gim, '## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gim, '### $1\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gim, '**$1**')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gim, '$1\n\n')
  return md.replace(/<[^>]*>/g, '').trim()
}

const structuredOperations = [
  { id: 'json-csv', label: 'JSON para CSV', icon: 'i-lucide-file-spreadsheet' },
  { id: 'csv-json', label: 'CSV para JSON', icon: 'i-lucide-file-json' },
  { id: 'json-xml', label: 'JSON para XML', icon: 'i-lucide-file-code' },
  { id: 'xml-json', label: 'XML para JSON', icon: 'i-lucide-file-json' },
  { id: 'json-yaml', label: 'JSON para YAML', icon: 'i-lucide-file-text' },
  { id: 'yaml-json', label: 'YAML para JSON', icon: 'i-lucide-file-json' },
  { id: 'md-html', label: 'Markdown para HTML', icon: 'i-lucide-globe' },
  { id: 'html-md', label: 'HTML para Markdown', icon: 'i-lucide-file-markdown' }
]

const structuredTransformed = computed(() => {
  const txt = structuredInput.value
  if (!txt.trim()) return ''
  switch (structuredOperation.value) {
    case 'json-csv': return jsonToCsv(txt)
    case 'csv-json': return csvToJson(txt)
    case 'json-xml': return jsonToXml(txt)
    case 'xml-json': return xmlToJson(txt)
    case 'json-yaml': return jsonToYaml(txt)
    case 'yaml-json': return yamlToJson(txt)
    case 'md-html': return mdHtml(txt)
    case 'html-md': return htmlMd(txt)
    default: return txt
  }
})

const finalStructuredOutput = computed(() => {
  return autoConvertStructured.value ? structuredTransformed.value : manualOutput.value
})

watch([structuredOperation, structuredInput], () => {
  if (autoConvertStructured.value) {
    manualOutput.value = structuredTransformed.value
  }
})

const handleStructuredFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      structuredInput.value = reader.result as string
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext === 'json') structuredOperation.value = 'json-csv'
      else if (ext === 'csv') structuredOperation.value = 'csv-json'
      else if (ext === 'xml') structuredOperation.value = 'xml-json'
      else if (ext === 'yml' || ext === 'yaml') structuredOperation.value = 'yaml-json'
      else if (ext === 'md') structuredOperation.value = 'md-html'
      else if (ext === 'html') structuredOperation.value = 'html-md'
      toast.add({ title: 'Arquivo Importado', description: `"${file.name}" carregado.`, color: 'success' })
    }
    reader.readAsText(file)
  }
}

const copyStructuredOutput = async () => {
  await navigator.clipboard.writeText(finalStructuredOutput.value)
  toast.add({ title: 'Copiado!', color: 'success' })
}

const downloadStructuredFile = () => {
  const ext = structuredOperation.value.split('-')[1]
  const blob = new Blob([finalStructuredOutput.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `caixa_de_tools_dados.${ext}`
  a.click()
}
</script>

<template>
  <div class="space-y-6 py-4 relative">
    <!-- Blurs Background decorativos -->
    <div class="absolute top-[-5%] right-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 dark:bg-emerald-950/5 blur-[90px] pointer-events-none -z-10" />
    <div class="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-teal-500/10 dark:bg-teal-950/5 blur-[100px] pointer-events-none -z-10" />

    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Conversor de Documentos
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Converta documentos PDF, Word (DOCX), ODT, além de dados estruturados (JSON, CSV, XML, YAML). Processamento local seguro.
      </p>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="flex border-b border-slate-200 dark:border-slate-800 gap-4">
      <button
        type="button"
        :class="activeTab === 'office' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 border-b-2 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'"
        class="px-4 py-2.5 text-sm transition-all flex items-center gap-1.5"
        @click="activeTab = 'office'"
      >
        <UIcon name="i-lucide-file-text" class="size-4" />
        <span>Documentos Office (PDF, Word, ODT)</span>
      </button>
      <button
        type="button"
        :class="activeTab === 'structured' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 border-b-2 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'"
        class="px-4 py-2.5 text-sm transition-all flex items-center gap-1.5"
        @click="activeTab = 'structured'"
      >
        <UIcon name="i-lucide-braces" class="size-4" />
        <span>Dados Estruturados (JSON, CSV, XML)</span>
      </button>
    </div>

    <!-- =======================================================================
         TAB 1: OFFICE DOCUMENT CONVERTER
         ======================================================================= -->
    <div v-if="activeTab === 'office'" class="space-y-6">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        <!-- Left: Upload & Operation Form (7 columns) -->
        <div class="lg:col-span-7 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6 flex flex-col justify-between">
          
          <div class="space-y-5">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Configurar Conversão</h2>
            
            <!-- Type Selector Buttons -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                :class="officeOperation === 'pdf-txt' ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all"
                @click="officeOperation = 'pdf-txt'"
              >
                <UIcon name="i-lucide-file-text" class="size-5" />
                <span>PDF para Texto</span>
              </button>
              <button
                type="button"
                :class="officeOperation === 'docx-pdf' ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all"
                @click="officeOperation = 'docx-pdf'"
              >
                <UIcon name="i-lucide-file-pdf" class="size-5" />
                <span>Word para PDF</span>
              </button>
              <button
                type="button"
                :class="officeOperation === 'docx-txt' ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all"
                @click="officeOperation = 'docx-txt'"
              >
                <UIcon name="i-lucide-file-edit" class="size-5" />
                <span>Word para Texto</span>
              </button>
              <button
                type="button"
                :class="officeOperation === 'odt-txt' ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center text-center gap-1.5 transition-all"
                @click="officeOperation = 'odt-txt'"
              >
                <UIcon name="i-lucide-repeat-2" class="size-5" />
                <span>ODT para Texto</span>
              </button>
            </div>

            <!-- HTML/MD to PDF Editor option -->
            <div
              type="button"
              :class="officeOperation === 'html-pdf' ? 'bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'"
              class="w-full p-4 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer select-none"
              @click="officeOperation = 'html-pdf'"
            >
              <div class="flex items-center gap-2.5">
                <UIcon name="i-lucide-file-output" class="size-5 text-emerald-500" />
                <div class="text-left">
                  <span class="block text-slate-800 dark:text-white">Criar PDF a partir de Texto / Markdown</span>
                  <span class="text-[10px] text-slate-400 font-normal">Escreva o texto e baixe um documento PDF diagramado.</span>
                </div>
              </div>
              <UIcon name="i-lucide-check-circle-2" v-if="officeOperation === 'html-pdf'" class="size-4 text-emerald-500" />
            </div>

            <!-- Upload File section (Hidden if using editor mode) -->
            <div v-if="officeOperation !== 'html-pdf'" class="space-y-2 animate-in fade-in duration-200">
              <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Carregar Documento</label>
              
              <div v-if="!officeFile" class="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center bg-slate-50/50 dark:bg-slate-950/15 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer relative group">
                <input type="file" @change="handleOfficeFileSelect" class="absolute inset-0 opacity-0 cursor-pointer w-full" accept=".pdf,.docx,.odt" />
                <div class="flex flex-col items-center justify-center">
                  <UIcon name="i-lucide-file-up" class="size-9 text-slate-400 group-hover:text-emerald-500 mb-2.5" />
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">Escolha ou arraste o seu arquivo aqui</span>
                  <span class="text-[10px] text-slate-400 mt-1">Aceita arquivos PDF, DOCX e ODT</span>
                </div>
              </div>

              <!-- Selected File Card -->
              <div v-else class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <UIcon name="i-lucide-file" class="size-6" />
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-xs md:max-w-md">{{ officeFile.name }}</span>
                    <span class="text-[10px] text-slate-400 block">{{ (officeFile.size / 1024).toFixed(1) }} KB</span>
                  </div>
                </div>
                <button type="button" @click="removeOfficeFile" class="text-xs font-bold text-rose-500 hover:underline">Remover</button>
              </div>
            </div>

            <!-- Rich Text Editor Mode (For HTML/MD to PDF) -->
            <div v-else class="space-y-2 animate-in fade-in duration-200">
              <label for="rich-input" class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Escreva seu documento (Suporta Markdown)</label>
              <textarea
                id="rich-input"
                v-model="richTextInput"
                placeholder="# Título do Documento&#10;&#10;Escreva seu parágrafo aqui. Use **negrito** para destacar palavras importantes.&#10;&#10;## Subtítulo&#10;- Item de lista 1&#10;- Item de lista 2"
                class="w-full h-[220px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
              ></textarea>
            </div>

            <!-- Error Banner -->
            <div v-if="conversionError" class="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-[11px] text-rose-600 dark:text-rose-400">
              <UIcon name="i-lucide-alert-circle" class="size-3.5 inline mr-1 align-text-bottom" />
              <span>{{ conversionError }}</span>
            </div>

          </div>

          <!-- Convert Button / Processing state -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <UButton
              v-if="!isProcessing"
              label="Iniciar Conversão"
              icon="i-lucide-sparkles"
              color="primary"
              size="md"
              class="w-full rounded-xl font-bold py-3 shadow-lg shadow-emerald-500/10"
              @click="handleOfficeConvert"
            />
            <div v-else class="w-full p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center gap-3 text-xs font-bold border border-emerald-500/20">
              <UIcon name="i-lucide-loader-2" class="size-4 animate-spin" />
              <span>{{ processingStatus }}</span>
            </div>
          </div>

        </div>

        <!-- Right: Preview / Extracted Text (5 columns) -->
        <div class="lg:col-span-5 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Resultado Extraído</span>
            </h2>
            <div class="flex gap-1.5" v-if="officeTextOutput">
              <UButton icon="i-lucide-copy" label="Copiar" color="neutral" variant="subtle" size="xs" class="font-bold rounded-lg" @click="copyTextOffice" />
              <UButton icon="i-lucide-download" label="TXT" color="neutral" variant="subtle" size="xs" class="font-bold rounded-lg" @click="downloadTxtOffice" />
            </div>
          </div>

          <textarea
            :value="officeTextOutput"
            readonly
            placeholder="O texto extraído do PDF, Word ou ODT aparecerá aqui para cópia..."
            class="w-full flex-1 min-h-[350px] lg:min-h-[400px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-xs overflow-auto resize-none select-all"
          ></textarea>

          <div class="text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            Quantidade de caracteres: <strong class="text-slate-700 dark:text-slate-350">{{ officeTextOutput.length }}</strong>
          </div>
        </div>

      </div>

    </div>

    <!-- =======================================================================
         TAB 2: STRUCTURED DATA CONVERSION
         ======================================================================= -->
    <div v-if="activeTab === 'structured'" class="space-y-6">
      
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <!-- Input pane -->
        <div class="lg:col-span-5 flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <UIcon name="i-lucide-braces" class="text-emerald-500 size-4" />
              <span>Dados Estruturados</span>
            </h2>
            <div class="flex gap-1.5 items-center">
              <label class="relative cursor-pointer bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95">
                <UIcon name="i-lucide-upload" class="size-3.5" />
                <span>Importar</span>
                <input type="file" @change="handleStructuredFileUpload" class="absolute inset-0 opacity-0 cursor-pointer w-full" accept=".json,.csv,.xml,.yml,.yaml,.md,.html" />
              </label>
              <UButton
                icon="i-lucide-trash"
                color="neutral"
                variant="subtle"
                size="xs"
                class="rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold"
                @click="clearFields"
              />
            </div>
          </div>

          <textarea
            v-model="structuredInput"
            placeholder="Cole seus dados (JSON, CSV, XML ou YAML) aqui para converter..."
            class="w-full flex-1 min-h-[350px] lg:min-h-[400px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 overflow-auto resize-none"
          ></textarea>
        </div>

        <!-- Conversion panel selector -->
        <div class="lg:col-span-2 space-y-4 flex flex-col justify-start">
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Conversão</span>
          
          <div class="flex flex-col gap-2 max-h-[350px] lg:max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
            <button
              v-for="op in structuredOperations"
              :key="op.id"
              type="button"
              :class="[
                'w-full py-2.5 px-3 rounded-xl text-left border text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.98]',
                structuredOperation === op.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
              ]"
              @click="structuredOperation = op.id"
            >
              <UIcon :name="op.icon" class="size-4 text-emerald-500" />
              <span class="truncate">{{ op.label }}</span>
            </button>
          </div>

          <div class="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 mt-auto">
            <label class="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" v-model="autoConvertStructured" class="sr-only peer" />
              <div class="w-8 h-4.5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              <span class="ms-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tempo Real</span>
            </label>

            <UButton
              v-if="!autoConvertStructured"
              label="Converter"
              icon="i-lucide-sparkles"
              color="primary"
              class="w-full rounded-xl font-bold py-2 shadow-lg shadow-emerald-500/10"
              @click="triggerConvert"
            />
          </div>
        </div>

        <!-- Output pane -->
        <div class="lg:col-span-5 flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Dados Convertidos</span>
            </h2>
            <div class="flex gap-1.5" v-if="finalStructuredOutput">
              <UButton icon="i-lucide-copy" label="Copiar" color="neutral" variant="subtle" size="xs" class="font-bold rounded-lg" @click="copyStructuredOutput" />
              <UButton icon="i-lucide-download" label="Salvar" color="neutral" variant="subtle" size="xs" class="font-bold rounded-lg" @click="downloadStructuredFile" />
            </div>
          </div>

          <textarea
            :value="finalStructuredOutput"
            readonly
            placeholder="O resultado aparecerá automaticamente aqui..."
            class="w-full flex-1 min-h-[300px] lg:min-h-[400px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-emerald-600 dark:text-emerald-400 font-mono text-xs overflow-auto resize-none select-all"
          ></textarea>

          <div class="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            Tamanho: <strong class="text-slate-800 dark:text-slate-200">{{ finalStructuredOutput.length }}</strong> bytes
          </div>
        </div>

      </div>

    </div>

    <!-- Educational AdBlocker -->
    <AdBlock id="adsense-document-conversor-footer" type="rectangle" />
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(226, 232, 240);
  border-radius: 9999px;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgb(51, 65, 85);
}
</style>
