/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Check, Clipboard, Code2, HelpCircle } from "lucide-react";

interface CodeSnippet {
  title: string;
  description: string;
  python: string;
  rust: string;
  benefit: string;
}

const COMPARISONS: CodeSnippet[] = [
  {
    title: "1. Cálculo de Valor Gemátrico",
    description: "Soma os pesos numéricos de cada letra de uma palavra usando uma tabela de pontuação.",
    benefit: "Rust elimina a sobrecarga de busca em dicionários em tempo de execução através do uso de indexação estática ultra veloz no array, garantindo segurança de tipos.",
    python: `VALORES = {l: i + 1 for i, l in enumerate(string.ascii_uppercase)}

def valor_palavra(palavra):
    return sum(VALORES[l] for l in palavra if l in VALORES)`,
    rust: `// Em Rust, usamos correspondência de padrões (match) 
// ou vetor direto indexado para máxima performance.
pub fn valor_palavra(palavra: &str) -> u32 {
    palavra
        .bytes()
        .filter(|&b| b.is_ascii_alphabetic())
        .map(|b| {
            let u = b.to_ascii_uppercase();
            (u - b'A' + 1) as u32
        })
        .sum()
}`
  },
  {
    title: "2. Regra de Letras Triplas Repetidas (Fail-Fast)",
    description: "Varre a string para impedir que três letras idênticas apareçam juntas (e.g. 'AAA').",
    benefit: "O fatiamento de strings de Python cria novos objetos alocados na memória heap. Rust utiliza ponteiros de fatias temporárias (slices) na pilha (stack) de execução sem nenhuma alocação de memória.",
    python: `def regras_basicas(palavra):
    for i in range(len(palavra) - 2):
        if palavra[i] == palavra[i + 1] == palavra[i + 2]:
            return False
    # ...`,
    rust: `pub fn regras_basicas(palavra: &str) -> bool {
    // Usamos iteradores de fatias (windows) de 3 bytes na stack!
    let bytes = palavra.as_bytes();
    for window in bytes.windows(3) {
        if window[0] == window[1] && window[1] == window[2] {
            return false;
        }
    }
    true
}`
  },
  {
    title: "3. Busca Combinatória com Multi-Threading (O Pulo do Gato)",
    description: "Gerencia o loop principal que faz o produto cartesiano das letras livres.",
    benefit: "A biblioteca Rayon em Rust distribui o espaço de busca automaticamente entre os demais núcleos de processamento da sua máquina sem risco de erros de compartilhamento (data races).",
    python: `# Em Python puro, roda em apenas 1 núcleo devido ao GIL:
for combinacao in itertools.product(LETRAS, repeat=letras_livres):
    meio = "".join(combinacao)
    # Executa validação linear e lenta...`,
    rust: `// Em Rust + Rayon, paralelismo nativo de alto nível:
use rayon::prelude::*;

// Geramos combinações de forma preguiçosa (lazy) e paralela
let encontradas: Vec<String> = gerar_combinacoes(letras_livres)
    .par_iter() // Paraleliza o loop em todos os cores!
    .map(|meio| format!("{}{}{}", prefixo, meio, sufixo))
    .filter(|palavra| {
        valor_palavra(palavra) == valor_alvo 
            && regras_basicas(palavra) 
            && regras_basicas_latino(palavra)
    })
    .collect();`
  }
];

export default function CodeComparison() {
  const [selectedSnippet, setSelectedSnippet] = useState<number>(0);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, type: "python" | "rust") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  const current = COMPARISONS[selectedSnippet];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white font-display flex items-center gap-2.5">
          <Code2 className="text-amber-500 h-5 w-5" />
          Comparações Práticas: Python vs Rust
        </h3>
        <p className="text-sm text-neutral-400 mt-1">
          Veja com seus próprios olhos a diferença na implementação das regras do SHEMOT e entenda por que o código Rust é infinitamente mais veloz e robusto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left selector col */}
        <div className="lg:col-span-1 space-y-2">
          {COMPARISONS.map((comp, idx) => (
            <button
              id={`comp-btn-${idx}`}
              key={idx}
              onClick={() => setSelectedSnippet(idx)}
              className={`w-full text-left p-4 rounded-xl border text-xs transition-all duration-200 ${
                selectedSnippet === idx
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                  : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              <div className="font-semibold block text-[13px] text-white truncate mb-1">
                {comp.title.split(". ")[1]}
              </div>
              <p className="text-[11px] line-clamp-2 text-neutral-400">
                {comp.description}
              </p>
            </button>
          ))}

          {/* Education Info element */}
          <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2 text-xs">
            <h5 className="font-semibold text-white flex items-center gap-1.5 font-sans">
              <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
              O Que é Vibe Coding?
            </h5>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Vibe Coding é criarmos código juntos de forma descontraída, onde eu faço todo o trabalho difícil de engenharia e você atua como copiloto e tomador de decisões cirúrgicas!
            </p>
          </div>
        </div>

        {/* Right side Comparison area */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-5 md:p-6 space-y-4">
            <div>
              <h4 className="text-base font-bold text-white font-display">
                {current.title}
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                {current.description}
              </p>
            </div>

            {/* Code grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              
              {/* Python block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-neutral-300 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                    Python original
                  </div>
                  <button
                    onClick={() => handleCopy(current.python, "python")}
                    className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied === "python" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-3 w-3" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-[11px] font-mono text-neutral-300 overflow-x-auto min-h-[160px] max-h-[300px]">
                  {current.python}
                </pre>
              </div>

              {/* Rust block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-amber-300 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    Rust otimizado
                  </div>
                  <button
                    onClick={() => handleCopy(current.rust, "rust")}
                    className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied === "rust" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-3 w-3" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-[11px] font-mono text-neutral-300 overflow-x-auto min-h-[160px] max-h-[300px]">
                  {current.rust}
                </pre>
              </div>

            </div>

            {/* Performance highlight */}
            <div className="mt-4 p-4 rounded-xl bg-orange-950/10 border border-amber-900/30">
              <h5 className="text-[11px] uppercase font-mono tracking-wider text-amber-400 font-bold">
                Impacto no Vantagem de Performance
              </h5>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                {current.benefit}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
