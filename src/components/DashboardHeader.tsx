/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Terminal } from "lucide-react";

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function DashboardHeader({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="bg-neutral-900 border-b border-amber-900/40 text-neutral-100 py-5 px-6 md:px-12 sticky top-0 z-50 backdrop-blur-md bg-neutral-900/90">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Terminal className="h-6 w-6" id="header-logo-icon" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2">
              S H E M O T
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                MOTOR DE GEMATRIA
              </span>
            </h1>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              &quot;Em busca do nome perfeito&quot; — Ecossistema de Gematria Multilíngue por Tiago Rabelo Sels
            </p>
          </div>
        </div>

        {/* Biblical Verse (Apocalipse 2:17) */}
        <div className="max-w-2xl text-left lg:text-right text-xs text-amber-500/80 italic font-serif leading-relaxed border-l-2 lg:border-l-0 lg:border-r-2 border-amber-500/30 pl-4 lg:pl-0 lg:pr-4 py-1">
          &ldquo;Quem tem ouvidos, ouça o que o Espírito diz às igrejas: Ao que vencer darei a comer do maná escondido, e dar-lhe-ei uma pedra branca, e na pedra um novo nome escrito, o qual ninguém conhece senão aquele que o recebe.&rdquo;
          <span className="block mt-1 text-[10px] font-mono tracking-widest uppercase text-amber-600/60 font-sans not-italic">&mdash; Apocalipse 2:17</span>
        </div>
      </div>
    </header>
  );
}

