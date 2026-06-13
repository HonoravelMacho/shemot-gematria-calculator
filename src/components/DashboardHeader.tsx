/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOpen, Cpu, Sparkles, Terminal } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardHeader({ activeTab, setActiveTab }: HeaderProps) {
  return (
    <header className="bg-neutral-900 border-b border-amber-900/40 text-neutral-100 py-5 px-6 md:px-12 sticky top-0 z-50 backdrop-blur-md bg-neutral-900/90">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Terminal className="h-6 w-6" id="header-logo-icon" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-display flex items-center gap-2">
              S H E M O T
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PROJETO DE MIGRAÇÃO RUST
              </span>
            </h1>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              &quot;Em busca do nome perfeito&quot; — Ecossistema de Gematria Multilíngue por Tiago Rabelo Sels
            </p>
          </div>
        </div>

        {/* Navigation Tab selection */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-800 self-start md:self-auto">
          <button
            id="nav-tab-blueprint"
            onClick={() => setActiveTab("blueprint")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              activeTab === "blueprint"
                ? "bg-amber-500 text-neutral-950 font-semibold shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Blueprint de Migração
          </button>
          
          <button
            id="nav-tab-simulator"
            onClick={() => setActiveTab("simulator")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              activeTab === "simulator"
                ? "bg-amber-500 text-neutral-950 font-semibold shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            Simulador de Busca
          </button>

          <button
            id="nav-tab-code"
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
              activeTab === "code"
                ? "bg-amber-500 text-neutral-950 font-semibold shadow-md"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Python vs Rust Code
          </button>
        </div>
      </div>
    </header>
  );
}
