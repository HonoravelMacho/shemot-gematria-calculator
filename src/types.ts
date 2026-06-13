/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LatinoEstilo {
  minV: number;
  maxV: number;
  minC: number;
  maxC: number;
  maxVSeq: number;
}

export interface LatinoAvancado {
  iniciarComConsoante: boolean;
  terminarComVogal: boolean;
  permitirK: boolean;
  permitirW: boolean;
  permitirY: boolean;
  restringirFinais: boolean;
  permitirFinaisEstrangeiros: boolean;
  restringirInicioConsonantal: boolean;
}

export interface SearchStats {
  tested: number;
  found: number;
  timeMs: number;
}

export enum AlphabetType {
  Latino = "Latino",
  Hebraico = "Hebraico",
  Grego = "Grego",
}
