/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  FileText, Cpu, GitMerge, Zap, Library, ChevronRight, 
  Layers, Settings, Terminal, CheckCircle, HelpCircle, ArrowRight
} from "lucide-react";

export default function ArchitectureReport() {
  const [activeSubTab, setActiveSubTab] = useState<"fase1" | "fase2" | "fase3">("fase1");

  return (
    <div className="space-y-8">
      {/* Introduction Card */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-amber-900/40 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-full text-xs font-mono font-medium">
            <Zap className="h-3.5 w-3.5" />
            Vibe Coding: Diagnóstico & Planejamento
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-display">
            Guia de Migração Estratégica para Rust
          </h2>
          <p className="text-sm md:text-base text-neutral-300 max-w-4xl leading-relaxed">
            Olá, Capitão! O projeto <strong>SHEMOT</strong> é um motor de gematria e busca fonética inteligente
            único no mundo. Por envolver algoritmos de busca combinatória intensa (onde o tempo de busca sobe
            exponencialmente a cada letra livre), o ecossistema é o candidato perfeito para receber o poder de
            paralelismo, segurança de memória e velocidade extrema do <strong>Rust</strong>.
          </p>
          <div className="border-t border-neutral-800/80 pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-400 font-mono">
            <div>• Criador: <span className="text-amber-400 font-semibold">Tiago Rabelo Sels</span></div>
            <div>• Licença: <span className="text-amber-400 font-semibold">MIT (Requer Créditos)</span></div>
            <div>• Status Atual: <span className="text-emerald-400 font-semibold">PyPI (shemot v1.0.7)</span></div>
          </div>
        </div>
      </div>

      {/* Fase Select Tabs */}
      <div className="flex border-b border-neutral-800 gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab("fase1")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-150 flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "fase1"
              ? "border-amber-500 text-amber-400 bg-amber-500/5"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <FileText className="h-4 w-4" />
          Fase 1: Diagnóstico Técnico Python
        </button>
        <button
          onClick={() => setActiveSubTab("fase2")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-150 flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "fase2"
              ? "border-amber-500 text-amber-400 bg-amber-500/5"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Cpu className="h-4 w-4" />
          Fase 2: Arquitetura Core em Rust
        </button>
        <button
          onClick={() => setActiveSubTab("fase3")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-150 flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "fase3"
              ? "border-amber-500 text-amber-400 bg-amber-500/5"
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <GitMerge className="h-4 w-4" />
          Fase 3: Plano de Migração
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 md:p-8">
        
        {/* FASE 1: DIAGNÓSTICO PYTHON */}
        {activeSubTab === "fase1" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white font-display flex items-center gap-2.5">
                <FileText className="text-amber-500 h-5 w-5" />
                Análise da Base de Código Atual (Python)
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                Abaixo está mapeado o inventário, responsabilidades, dependências e limitações do código atual compilado de forma cirúrgica.
              </p>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                  1. Inventário de Módulos & Responsabilidades
                </h4>
                <div className="space-y-3">
                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-amber-900/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <code className="text-emerald-400 text-xs font-mono font-bold">shemot.py</code>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-mono">CLI Entrypoint</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-2">
                      Controlador central e console de menus. Gerencia a entrada do usuário para as buscas e as regras estilísticas. Realiza testes iterativos de produtos cartesianos com <code>itertools.product</code>.
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-amber-900/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <code className="text-emerald-400 text-xs font-mono font-bold">motores.py</code>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-mono">Engine Base</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-2">
                      Mapeia os valores numéricos básicos das letras latinas (A=1 a Z=26) e calcula o peso usando a soma cumulativa. Também possui regras estritas de repetição de consoantes/vogais.
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-amber-900/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <code className="text-emerald-400 text-xs font-mono font-bold">regras.py</code>
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-mono">Filtros Linguísticos</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-2">
                      Valida restrições fonéticas para criar palavras naturais no Português. Define dígrafos e encontros consonantais válidos (e.g., RR, SS, BR, NH). Limita o empilhamento de consoantes a no máximo 2 consecutivas.
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 hover:border-amber-900/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <code className="text-emerald-400 text-xs font-mono font-bold">hebraico.py / grego.py</code>
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-mono">Gematria Avançada</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-2">
                      Injeta os mapeamentos de caracteres e Isopsefia clássica. O módulo grego realiza transliteração direta, enquanto o hebraico lida com a Gematria Absoluta (Alef=1 a Tav=400).
                    </p>
                  </div>
                </div>
              </div>

              {/* Performance Analysis & Duplication */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                    2. Gargalos Críticos de Performance
                  </h4>
                  <div className="mt-3 p-4 bg-amber-950/20 border border-amber-500/25 rounded-xl space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Cpu className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-white uppercase font-mono">Iteração Mononucleada & Carga I/O</h5>
                        <p className="text-xs text-neutral-300 mt-1 space-y-1">
                          Python executa em uma única thread (Single-Core) devido ao <strong>GIL (Global Interpreter Lock)</strong>.
                          Quando o usuário busca 6 ou mais letras livres, o produto cartesiano cresce em progressão fatorial ($26^{6} = 308.915.776$ combinatórias!).
                          Em Python puro, isso demanda dezenas de minutos. Em Rust, usando Rayon, podemos paralelizar em todas as CPUs nativas da máquina, derrubando o tempo para poucos segundos.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 border-t border-amber-800/40 pt-3">
                      <GitMerge className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold text-white uppercase font-mono">Validação Ineficiente</h5>
                        <p className="text-xs text-neutral-300 mt-1">
                          No algoritmo atual, a palavra é primeiro montada para depois ser validada inteira. Em Rust, podemos otimizar com <strong>verificação precoce (fail-fast)</strong>. Se as primeiras duas letras já infringem uma regra fonética, saltamos o resto do produto cartesiano imediatamente, poupando centenas de milhões de iterações redundantes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                    3. Código que Deve Permanecer Idêntico
                  </h4>
                  <div className="mt-3 p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Todas as regras fonéticas descritas em <code>regras.py</code> (como o acúmulo de consoantes e a validação do <code>QU</code> / <code>GU</code>), o mapeamento gemátrico absoluto do Alfabeto Hebraico (1 a 400), e a Isopsefia Grega clássica com suas restrições de iniciais/finais <strong>devem ser preservadas cirurgicamente</strong>. Nossos testes unitários garantirão que o comportamento seja idêntico ao milésimo após a conversão em Rust.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* FASE 2: ARQUITETURA RUST */}
        {activeSubTab === "fase2" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white font-display flex items-center gap-2.5">
                <Cpu className="text-amber-500 h-5 w-5" />
                Arquitetura do Cargo Workspace Proposta
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                Para preparar o SHEMOT para suportar dicionários gigantescos e APIs, projetamos uma estrutura baseada em microcrafts independentes (crates). Visão geral:
              </p>
            </div>

            {/* Tree visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-1 bg-neutral-950 p-6 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 space-y-2 overflow-x-auto">
                <div className="text-amber-400 font-bold font-sans flex items-center gap-1.5 mb-2">
                  <Layers className="h-4 w-4" />
                  Estrutura de Arquivos Rust:
                </div>
                <div>shemot/ &nbsp; <span className="text-neutral-500"># Raiz do Workspace</span></div>
                <div>├── Cargo.toml</div>
                <div>├── crates/</div>
                <div>│ &nbsp; ├── <span className="text-emerald-400 font-semibold">shemot-core/</span> &nbsp; &nbsp; <span className="text-neutral-500"># Gematria e regras comuns</span></div>
                <div>│ &nbsp; │ &nbsp; ├── Cargo.toml</div>
                <div>│ &nbsp; │ &nbsp; └── src/lib.rs</div>
                <div>│ &nbsp; ├── <span className="text-emerald-400 font-semibold">shemot-latino/</span> &nbsp; <span className="text-neutral-500"># Regras do Português/Latino</span></div>
                <div>│ &nbsp; │ &nbsp; └── src/lib.rs</div>
                <div>│ &nbsp; ├── <span className="text-emerald-400 font-semibold">shemot-hebraico/</span> <span className="text-neutral-500"># Guimátria</span></div>
                <div>│ &nbsp; │ &nbsp; └── src/lib.rs</div>
                <div>│ &nbsp; ├── <span className="text-emerald-400 font-semibold">shemot-grego/</span> &nbsp; &nbsp;<span className="text-neutral-500"># Isopsefia</span></div>
                <div>│ &nbsp; │ &nbsp; └── src/lib.rs</div>
                <div>│ &nbsp; ├── <span className="text-emerald-400 font-semibold">shemot-export/</span> &nbsp; <span className="text-neutral-500"># Gerador de arquivos</span></div>
                <div>│ &nbsp; │ &nbsp; └── src/lib.rs</div>
                <div>│ &nbsp; └── <span className="text-cyan-400 font-semibold">shemot-cli/</span> &nbsp; &nbsp; &nbsp;<span className="text-neutral-500"># Binário CLI Interativo</span></div>
                <div>│ &nbsp; &nbsp; &nbsp; ├── Cargo.toml</div>
                <div>│ &nbsp; &nbsp; &nbsp; └── src/main.rs</div>
                <div>├── tests/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <span className="text-neutral-500"># Testes de integração</span></div>
                <div>├── docs/</div>
                <div>└── README.md</div>
              </div>

              {/* Module Description Grid */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider font-mono">
                  Modularidade e Divisão de Responsabilidades
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-805">
                    <div className="flex items-center gap-2 mb-2">
                      <Library className="text-amber-500 h-4 w-4" />
                      <h5 className="text-xs font-bold text-white font-mono">shemot-core</h5>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Sua biblioteca central. Contém tipos primitivos universais, enums de alfabetos, e traços (traits) genéricos de cálculo que unificam o comportamento de todos os alfabetos.
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-805">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="text-amber-500 h-4 w-4" />
                      <h5 className="text-xs font-bold text-white font-mono font-sans">Multi-Threading e Rayon</h5>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      A engine utilizará a crate <code>rayon</code> para paralelização automatizada e segura do processamento combinatório. Divisão de trabalho sem condições de corrida!
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-805">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="text-amber-500 h-4 w-4" />
                      <h5 className="text-xs font-bold text-white font-mono">Cross-Platform Compiling</h5>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Desenvolvido sob medida para compilar nativamente em Windows, Linux, Mac e diretamente no Android através do <strong>Termux</strong> de forma leve e rápida, sem dependências de C pesadas.
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-805">
                    <div className="flex items-center gap-2 mb-2">
                      <Terminal className="text-amber-500 h-4 w-4" />
                      <h5 className="text-xs font-bold text-white font-mono">shemot-cli</h5>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Responsável por gerenciar os menus de console elegantes. Utiliza uma crate de formatação de tabelas terminal (e.g. <code>cli-table</code> ou similar) para exibir resultados de forma impressionante.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* FASE 3: PLANO DE MIGRAÇÃO */}
        {activeSubTab === "fase3" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-white font-display flex items-center gap-2.5">
                <GitMerge className="text-amber-500 h-5 w-5" />
                Cronograma de Migração Incremental & Checklist
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                Uma migração bem-sucedida é feita passo a passo, garantindo que o programa continue funcionando em cada estágio.
              </p>
            </div>

            <div className="space-y-6">
              
              {/* Step 1 */}
              <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-801 flex items-start gap-4">
                <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-sm font-bold font-mono border border-amber-500/20 shrink-0">
                  PASSO 1
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white font-display">
                    Instalação de Ambiente & Setup do Workspace
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Instalamos o kit do Rust Cargo em sua máquina e iniciamos a estrutura do Workspace. Criamos o arquivo <code>Cargo.toml</code> raiz do repositório para conectar todas as futuras crates.
                  </p>
                  <pre className="bg-neutral-900 border border-neutral-800 rounded p-2.5 text-[11px] font-mono text-neutral-400 overflow-x-auto">
                    {"cargo new shemot-cli\n" +
                     "mkdir crates\n" +
                     "cargo new --lib crates/shemot-core\n" +
                     "cargo new --lib crates/shemot-latino"}
                  </pre>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-810 flex items-start gap-4">
                <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-sm font-bold font-mono border border-amber-500/20 shrink-0">
                  PASSO 2
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white font-display">
                    Migração de Lógica de Cálculo e Regras em shemot-core
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Portamos o mapeamento do alfabeto e criamos os cálculos de Gematria, validando funções como <code>valor_palavra</code> e as <code>regras_basicas</code> de repetição consecutiva em Rust com testes unitários locais rápidos.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-810 flex items-start gap-4">
                <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-sm font-bold font-mono border border-amber-500/20 shrink-0">
                  PASSO 3
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white font-display">
                    Portando Filtros Fonéticos do Português (shemot-latino)
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Codificamos as constantes de dígrafos e encontros consonantais permitidos. O algoritmo otimiza a validação impedindo iterações extras no meio de buscas profundas usando referências estáticas rápidas.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-5 bg-neutral-950 rounded-xl border border-neutral-810 flex items-start gap-4">
                <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-sm font-bold font-mono border border-amber-500/20 shrink-0">
                  PASSO 4
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white font-display">
                    Integração Multithreading & Terminal CLI de shemot-cli
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Conectamos os motores hebraico e grego. Desencadeamos o paralelismo com a crate <code>rayon</code> e formatamos o menu interativo com suporte total a teclas em português e salvamento de arquivos em disco de forma otimizada.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
