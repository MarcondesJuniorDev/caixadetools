# 🧰 Caixa de Tools

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.x-emerald?logo=nuxt.js)](https://nuxt.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue.svg)](LICENSE)
[![Segurança](https://img.shields.io/badge/Privacidade-100%25%20Local-success)](https://caixadetools.com)

A **Caixa de Tools** é um portal multiferramentas e simuladores utilitários online, gratuitos e rápidos. O projeto foi desenvolvido com foco em desempenho extremo, design premium (Light/Dark mode) e otimização para SEO (pronto para AdSense).

---

## 🔒 Privacidade e Segurança Absoluta

Diferente de outros serviços web, **100% do processamento de dados e documentos ocorre diretamente no navegador do usuário (client-side)**.
- Seus arquivos PDF, Word (DOCX) ou ODT **nunca** são enviados para servidores externos.
- Senhas, CPFs, e estruturas JSON inseridos permanecem estritamente no seu computador.

---

## 🛠️ Ferramentas Disponíveis

O portal é dividido em três categorias principais de utilitários:

### 💻 Desenvolvedor
- **Formatador de JSON**: Valide, corrija e formate estruturas JSON complexas com recuo limpo.
- **Gerador de CPF / CNPJ**: Geração rápida de documentos válidos para fins de testes e homologação de software.
- **Conversor Multiuso**: Conversão rápida de Base64 (texto/arquivo), codificação de URLs e bases numéricas (Hex, Dec, Bin, Oct).
- **Gerador de Docker Compose**: Criação visual de arquivos `docker-compose.yml` com suporte a variáveis, volumes, dependências e build local.

### 📈 Finanças & Simulação
- **Juros Compostos**: Simulador detalhado de crescimento financeiro e aportes ao longo do tempo.
- **Simulador de Pix**: Gerador de QR Codes Pix estáticos para cobrança e transferências diretas.
- **Calculadora de FIIs**: Simulação de Fundos Imobiliários com cálculo do efeito bola de neve, tempo estimado e estimativa do **Número Mágico** (Magic Number).

### 📝 Texto & Utilidades
- **Contador de Caracteres**: Análise em tempo real de palavras, caracteres, linhas e métricas de leitura.
- **Gerador de Lorem Ipsum**: Criação flexível de parágrafos e frases fictícias para diagramação.
- **Conversor de Documentos**:
  - **Office**: Extração de texto de arquivos **PDF**, **DOCX** e **ODT** e exportador de Markdown/HTML para **PDF**.
  - **Dados**: Conversão local entre **JSON, CSV, XML e YAML**.

---

## 🚀 Tecnologias Utilizadas

- **Core**: [Nuxt 4](https://nuxt.com/) (Vue 3, Nitro Engine)
- **UI & Iconografia**: [Nuxt UI](https://ui.nuxt.com/) (com suporte nativo ao Tailwind CSS e Lucide Icons)
- **Bibliotecas Client-Side integradas sob demanda**:
  - [PDF.js](https://github.com/mozilla/pdf.js) (Extração de texto em PDF)
  - [Mammoth.js](https://github.com/mikespook/mammoth.js) (Leitor estruturado de DOCX)
  - [JSZip](https://github.com/Stuk/jszip) (Extração XML de arquivos compactados ODT)
  - [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) (Geração e download de arquivos PDF)

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em sua máquina (versão v18 ou superior recomendada).

### Passo 1: Instalar Dependências
```bash
# Instala as dependências listadas no package.json
npm install
```

### Passo 2: Executar em Ambiente de Desenvolvimento
```bash
# Inicia o servidor local de desenvolvimento
npm run dev
```
O portal estará disponível em: `http://localhost:3000`.

### Passo 3: Compilar para Produção
```bash
# Compila e otimiza a build de produção (Nitro/Server-ready)
npm run build
```

---

## 🎨 Diretrizes de Design

O design do portal baseia-se em uma estética moderna baseada nos temas **Emerald (Esmeralda)** e **Slate (Grafite)**.
- **Micro-animações**: Transições suaves e estados ativos responsivos (`active:scale-[0.98]`).
- **Adaptabilidade de Cores**: Todos os elementos (incluindo painéis de FAQ e contêineres de pré-visualização de código) adaptam-se dinamicamente entre o tema claro e escuro.

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes.
