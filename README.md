# Shemot - Gematria Calculator & Combinatorial Search Engine 🔱

**Shemot** (do hebraico שֵׁמוֹת, "Nomes") é uma plataforma interativa de alto polimento visual inspirada em painéis analíticos retrô e terminais cibernéticos antigos. Ela foi projetada para estudantes, pesquisadores e entusiastas da Gematria (Hebrea, Grega e Latina), permitindo calcular correspondências numéricas, realizar buscas combinatórias em massa e consultar significados místicos arquetípicos integrados de forma totalmente offline.

> **Visual Estético**: Tema monocromático escuro ambarino do terminal analítico combinatório (*Amber/CRT Terminal*), com abundância de espaço negativo, animações sutis de renderização física e feedback visual interativo completo.

---

## 🌌 Recursos Clave (Principais Funcionalidades)

### 1. 🧮 Calculadora de Gematria Multi-Alfabeto
Calcule instantaneamente o valor cabalístico de qualquer string inserida em três alfabetos tradicionais distintos em tempo real:
*   **Latino (Gematria Clássica, Tradicional e de Espelho)**: Suporta múltiplos métodos de decodificação para o alfabeto ocidental, permitindo mapeamentos diretos por conversão fonética e sequencial.
*   **Grego (Isopsefia)**: Atribuições numéricas autênticas correspondentes ao período clássico e helenístico.
*   **Hebreu (Gematria Clássica)**: Conversão fidedigna de termos hebraicos incluindo o suporte a *Sophit* (letras finais com valores estendidos).

### 2. ⚡ Motor de Busca de Combinações Alquímicas
Quer descobrir quais sequências ou frases geram exatamente uma soma específica? Nosso motor de busca simula a expansão combinatória sequencial e varre possibilidades místicas:
*   Insira a soma desejada (ex: `777`, `666`, `26`, `358`, `15`).
*   Gere caminhos combinatórios baseados em sub-blocos matemáticos puros.
*   Filtre os dados gerados em tempo real de acordo com as ocorrências no dicionário integrado.

### 3. 📖 Dicionário Offline de Alta Densidade (Mais de 100 Termos)
Um acervo teológico e místico offline contendo os principais conceitos catalogados:
*   **Grego clássico**: Termos filosóficos (ex: *Lógos*, *Agape*, *Sophia*, *Phos*, *Theos*, *Gnosis*, *Abraxas*).
*   **Hebreu cabalístico**: Termos da Árvore da Vida, Sefirot, nomes divinos sagrados e anjos (ex: *YHVH*, *Shalom*, *Eheyeh*, *Kadosh*, *Metatron*, *Yeshua*).
*   **Português hermético**: Correlações virtuosas modernas, alquimia e ensinamentos ocultistas (ex: *Alquimia*, *Transmutação*, *Sol*, *Eternidade*, *Misericórdia*).
*   **Filtro Inteligente no Motor de Busca**: Ao rodar o motor de busca, filtre instantaneamente para ver **apenas** palavras reais registradas do dicionário ou exiba as traduções e parágrafos enciclopédicos explicativos!

### 4. 🔍 Consulta Rápida Interativa
Copie palavras sugeridas e cole na barra de busca rápida inteligente para ver instantaneamente quais letras geraram aquela soma, os coeficientes individuais e o significado detalhado de forma instantânea.

---

## 🛠️ Tecnologias Utilizadas

A arquitetura foi desenhada priorizando modularidade, carregamento imediato offline e isolamento de dependências:
*   **Vite**: Agente de bundling ultra-veloz.
*   **React 19 & TypeScript**: Programação tipada de ponta para impedir falhas de cálculo e garantir coesão das fórmulas matemáticas.
*   **Tailwind CSS**: Estilização baseada em utilitários focados em alto contraste e adaptabilidade de tela de forma nativa.
*   **Motion (Framer Motion)**: Transições físicas fluidas, suavização de carregamento de cartas e feedback tátil simulado.
*   **Lucide React**: Biblioteca de ícones elegantes para guiar o olhar do pesquisador.

---

## 🚀 Como Rodar o Projeto Localmente

### ⚡ Método Rápido (Recomendado - Comando Único)
Para clonar, instalar todas as dependências, atualizar automaticamente e criar o comando prático `shemot` para poder iniciar de qualquer pasta do seu terminal, basta copiar e colar o comando de linha única abaixo:

```bash
curl -sSL https://raw.githubusercontent.com/HonoravelMacho/shemot-gematria-calculator/principal/install.sh | bash
```

> **Dica**: Após o script completar, reinicie o terminal ou digite `source ~/.bashrc` (ou `source ~/.zshrc`) para carregar o apelido. A partir daí, basta digitar **`shemot`** de qualquer lugar para jogar a plataforma no navegador!

---

### 🛠️ Método Tradicional Passo a Passo

Siga o passo a passo abaixo se preferir executar manualmente em seu ambiente de desenvolvimento:

### 1. Clonar o Repositório
```bash
git clone https://github.com/HonoravelMacho/shemot-gematria-calculator.git
cd shemot-gematria-calculator
```

### 2. Instalar as Dependências
```bash
npm install
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
O servidor será aberto localmente. Abra [http://localhost:3000](http://localhost:3000) no seu navegador para explorar o terminal místico!

### 4. Compilar para Produção (Build)
```bash
npm run build
```
O compilador do Vite gerará arquivos estáticos puros e otimizados dentro do diretório `/dist/`, ideais para publicação gratuita no GitHub Pages, Vercel ou Netlify.

---

## ⚙️ Regras Matemáticas Aplicadas

### Gematria Hebraica
Mapeamento clássico dos caracteres do alfabeto alef-bet:
```text
א-1 | ב-2 | ג-3 | ד-4 | ה-5 | ו-6 | ז-7 | ח-8 | ט-9 | י-10
כ-20 | ל-30 | מ-40 | נ-50 | ס-60 | ע-70 | פ-80 | צ-90 | ק-100
ר-200 | ש-300 | ת-400
Sophith (Finais): ך-500 | ם-600 | ן-700 | ף-800 | ץ-900
```

### Isopsefia Grega
Mapeamento de caracteres clássicos:
```text
Α-1 | Β-2 | Γ-3 | Δ-4 | Ε-5 | Ζ-7 | Η-8 | Θ-9 | Ι-10
Κ-20 | Λ-30 | Μ-40 | Ν-50 | Ξ-60 | Ο-70 | Π-80 | Ρ-100
Σ-200 | Τ-300 | Υ-400 | Φ-500 | Χ-600 | Ψ-700 | Ω-800
```

### Gematria Latina
Conversão baseada nas posições alfabéticas ocidentais tradicionais de A a Z de forma sequencial linear (`A=1`, `B=2` ... `Z=26`).

---

## 📜 Licença
Distribuído sob a licença **Apache-2.0**. Sinta-se à vontade para expandir, sugerir novos alfabetos ou integrar mais dicionários filosóficos!

*Desenvolvido com carinho espiritual e rigor hermético.* 🕯️
