/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import DashboardHeader from "./components/DashboardHeader";
import GematriaCalculator from "./components/GematriaCalculator";
import { Terminal, Shield, Heart } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-205">
      {/* Premium Navigation Header with Biblical Verse */}
      <DashboardHeader />

      {/* Main Content Stage */}
      <main className="flex-1 py-10 px-4 md:px-8 xl:px-12 max-w-7xl w-full mx-auto space-y-12">
        
        {/* Main Gematria Simulator & Calculator */}
        <GematriaCalculator />

        {/* Dynamic Project Status / Banner */}
        <div className="bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-display">Segurança Sanitária & Licença Aberta (MIT)</h4>
              <p className="text-xs text-neutral-400 mt-0.5 max-w-xl leading-relaxed">
                O SHEMOT é mantido sob os termos e condições da <strong>Licença MIT</strong>. O código-fonte continuará para sempre 150% Open-Source e gratuito, respeitando os devidos créditos de autoria intelectual para seu criador original.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch md:self-auto shrink-0">
            <a
              href="https://pypi.org/project/shemot/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none text-center bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-xs font-semibold text-neutral-300 transition"
            >
              Ver no PyPI (shemot)
            </a>
            <div className="flex-1 md:flex-none text-center bg-amber-500 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs select-none">
              v1.0.7 Instalada
            </div>
          </div>
        </div>

      </main>

      {/* Persistent Scholastic Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 text-neutral-500 text-xs px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="h-4 w-4 text-amber-500/60" />
            <span>SHEMOT Engine &copy; 2026. Concebido por Tiago Rabelo Sels.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              Feito com <Heart className="h-3 w-3 text-red-500 fill-current" /> para tiago
            </span>
            <span className="text-neutral-600">|</span>
            <span>Licença MIT (Preserve os Créditos)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
