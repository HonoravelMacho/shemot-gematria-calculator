/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import { 
  Play, Download, Trash2, Cpu, Sparkles, Filter, 
  HelpCircle, Settings, ChevronRight, CheckCircle, Flame,
  Book, Search, Copy, Check, Info, Square
} from "lucide-react";
import { AlphabetType, LatinoEstilo, LatinoAvancado, SearchStats } from "../types";
import { 
  GREEK_DICTIONARY, 
  HEBREW_DICTIONARY, 
  PORTUGUESE_DICTIONARY, 
  normalizeWord,
  DictionaryEntry
} from "../data/dictionaries";

// Helper to format execution time beautifully (Hours, Minutes, Seconds, Milliseconds)
function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const totalSeconds = Math.floor(ms / 1000);
  const remainingMs = ms % 1000;
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  let parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  if (remainingMs > 0) {
    parts.push(`${seconds}s ${remainingMs}ms`);
  } else {
    parts.push(`${seconds}s`);
  }
  return parts.join(" ");
}

// ===================================
// LETRAS E VALORES LATINOS (A=1 - Z=26)
// ===================================
const LAT_VALORES: Record<string, number> = {};
const ALFABETO_LAT_ARR: string[] = [];
for (let i = 0; i < 26; i++) {
  const char = String.fromCharCode(65 + i); // 'A' key
  LAT_VALORES[char] = i + 1;
  ALFABETO_LAT_ARR.push(char);
}

const VOGAIS = "AEIOU";

const PARES_PERMITIDOS = new Set([
  "RR", "SS", "BR", "CR", "DR", "FR", "GR", "PR", "TR",
  "BL", "CL", "FL", "GL", "PL", "CH", "LH", "NH", "QU", "GU",
  "PT", "CT", "BT", "GN", "XC", "PS", "TZ", "TS", "NS", "ST", "RT"
]);

const PARES_INICIAIS_PERMITIDOS = new Set([
  "BR", "CR", "DR", "FR", "GR", "PR", "TR", "VR", "BL", "CL", "FL", "GL", "PL", "TL",
  "PS", "GN", "PN", "TM", "MN", "PT", "CT", "ST"
]);

// ===================================
// TABELA HEBRAICA
// ===================================
const TABELA_HEBRAICA: Record<string, number> = {
  "א (Alef)": 1,   "ב (Beit)": 2,  "ג (Gimel)": 4, "ד (Dalet)": 4, 
  "ה (He)": 5,    "ו (Vav)": 6,   "ז (Zayin)": 7, "ח (Chet)": 8, 
  "ט (Tet)": 9,   "י (Yod)": 10,  "כ (Kaf)": 20,  "ל (Lamed)": 30, 
  "מ (Mem)": 40,  "נ (Nun)": 50,  "ס (Samech)": 60,"ע (Ayin)": 70, 
  "פ (Pe)": 80,   "צ (Tzadi)": 90,"ק (Kof)": 100, "ר (Resh)": 200, 
  "ש (Shin)": 300,"ת (Tav)": 400
};
const LETRAS_HEB = Object.keys(TABELA_HEBRAICA);

// ===================================
// TABELA GREGA
// ===================================
const TABELA_GREGA: Record<string, number> = {
  "Α (Alfa)": 1, "Β (Beta)": 2, "Γ (Gama)": 3, "Δ (Delta)": 4, "Ε (Epsilon)": 5, "Ϛ (Stigma)": 6, "Ζ (Zeta)": 7, "Η (Eta)": 8, "Θ (Theta)": 9,
  "Ι (Iota)": 10, "Κ (Kapa)": 20, "Λ (Lambda)": 30, "Μ (Mi)": 40, "Ν (Ni)": 50, "Ξ (Xi)": 60, "Ο (Omicron)": 70, "Π (Pi)": 80, "Ϙ (Koppa)": 90,
  "Ρ (Ro)": 100, "Σ (Sigma)": 200, "Τ (Tau)": 300, "Υ (Ipsilon)": 400, "Φ (Fi)": 500, "Χ (Chi)": 600, "Ψ (Psi)": 700, "Ω (Omega)": 800, "Ϡ (Sampi)": 900
};
const LETRAS_GRECAS = Object.keys(TABELA_GREGA);

const TRANSLITER_GREGA: Record<string, string> = {
  "Α": "A", "Β": "B", "Γ": "G", "Δ": "D", "Ε": "E", "Ϛ": "ST", "Ζ": "Z", "Η": "E", "Θ": "TH",
  "Ι": "I", "Κ": "K", "Λ": "L", "Μ": "M", "Ν": "N", "Ξ": "X", "Ο": "O", "Π": "P", "Ϙ": "Q",
  "Ρ": "R", "Σ": "S", "Τ": "T", "Υ": "Y", "Φ": "PH", "Χ": "CH", "Ψ": "PS", "Ω": "O", "Ϡ": "TS"
};

export default function GematriaCalculator() {
  const [alphabet, setAlphabet] = useState<AlphabetType>(AlphabetType.Latino);
  const [targetValue, setTargetValue] = useState<number>(55);
  const [totalLength, setTotalLength] = useState<number>(5);

  // Latino Specific Options (Modo 1A / 1B)
  const [latinoMode, setLatinoMode] = useState<"etimologico" | "fixo">("etimologico");
  
  // Latino Etimológico details
  const [prefix, setPrefix] = useState<string>("");
  const [suffix, setSuffix] = useState<string>("");
  const [radical, setRadical] = useState<string>("");
  const [modoRadical, setModoRadical] = useState<string>("none"); // "none", "prefix", "suffix", "palindrome"

  // Locked/Fixed letters e.g. "1A,3A"
  const [fixedLettersInput, setFixedLettersInput] = useState<string>("");

  // Estilísticas
  const [useEstilo, setUseEstilo] = useState<boolean>(false);
  const [estilo, setEstilo] = useState<LatinoEstilo>({
    minV: 2,
    maxV: 4,
    minC: 1,
    maxC: 4,
    maxVSeq: 2,
  });

  // Avançado
  const [useAvancado, setUseAvancado] = useState<boolean>(false);
  const [avancado, setAvancado] = useState<LatinoAvancado>({
    iniciarComConsoante: false,
    terminarComVogal: true,
    permitirK: false,
    permitirW: false,
    permitirY: false,
    restringirFinais: true,
    permitirFinaisEstrangeiros: false,
    restringirInicioConsonantal: false,
  });

  // Greek specific
  const [useGreekFinais, setUseGreekFinais] = useState<boolean>(false);
  const [useGreekIniciosProibidos, setUseGreekIniciosProibidos] = useState<boolean>(false);
  const [useGreekKoineFilter, setUseGreekKoineFilter] = useState<boolean>(true);
  const [greekMaxConsonantes, setGreekMaxConsonantes] = useState<number>(2);

  // Hebrew specific
  const [useHebrewRules, setUseHebrewRules] = useState<boolean>(true);

  // Dictionary states
  const [dictionaryFilterMode, setDictionaryFilterMode] = useState<"all" | "words-only" | "words-meanings">("all");
  const [lookupText, setLookupText] = useState<string>("");
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  const [outputFormat, setOutputFormat] = useState<"pure" | "valued">("valued");

  // Output states
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const cancelRef = useRef<boolean>(false);
  const cancelSearch = () => {
    cancelRef.current = true;
  };
  const [stats, setStats] = useState<SearchStats>({ tested: 0, found: 0, timeMs: 0 });
  const [explanation, setExplanation] = useState<string>("");

  // ===================================
  // LÓGICA DE CÁLCULO E FILTRAGEM (TS client side)
  // Mapeado 1:1 baseado nos motores Python
  // ===================================

  function valorPalavraLatino(palavra: string): number {
    let sum = 0;
    for (let i = 0; i < palavra.length; i++) {
      const char = palavra[i].toUpperCase();
      if (LAT_VALORES[char]) {
        sum += LAT_VALORES[char];
      }
    }
    return sum;
  }

  function regrasBasicasLatino(palavra: string): boolean {
    const len = palavra.length;
    // 1. Sem 3 consecutivas idênticas
    for (let i = 0; i < len - 2; i++) {
      if (palavra[i] === palavra[i + 1] && palavra[i + 1] === palavra[i + 2]) {
        return false;
      }
    }
    // 2. RR e SS regras auxiliares
    for (let i = 0; i < len - 1; i++) {
      const par = palavra.substring(i, i + 2);
      if (palavra[i] === palavra[i + 1]) {
        if (par !== "RR" && par !== "SS") return false;
        if (i === 0 || i === len - 2) return false;
        if (!VOGAIS.includes(palavra[i - 1]) || !VOGAIS.includes(palavra[i + 2])) {
          return false;
        }
      }
    }
    return true;
  }

  function regrasFoneticasLatino(palavra: string): boolean {
    // Pelo menos uma vogal
    let temVogal = false;
    for (let i = 0; i < palavra.length; i++) {
      if (VOGAIS.includes(palavra[i])) {
        temVogal = true;
        break;
      }
    }
    if (!temVogal) return false;

    // Consoantes consecutivas limites
    let consecutivas = 0;
    for (let i = 0; i < palavra.length; i++) {
      if (!VOGAIS.includes(palavra[i])) {
        consecutivas++;
        if (consecutivas > 2) return false;
      } else {
        consecutivas = 0;
      }
    }

    // Verificar pares
    for (let i = 0; i < palavra.length - 1; i++) {
      const atual = palavra[i];
      const prox = palavra[i + 1];
      if (!VOGAIS.includes(atual) && !VOGAIS.includes(prox)) {
        const par = atual + prox;
        if (!PARES_PERMITIDOS.has(par)) {
          return false;
        }
      }
    }

    // QU & GU
    for (let i = 0; i < palavra.length - 1; i++) {
      const gq = palavra.substring(i, i + 2);
      if (gq === "QU" || gq === "GU") {
        if (i + 2 >= palavra.length) return false;
        if (!VOGAIS.includes(palavra[i + 2])) return false;
      }
    }

    return true;
  }

  function applyFiltroAvancado(palavra: string): boolean {
    if (!useAvancado) return true;
    
    if (avancado.iniciarComConsoante && VOGAIS.includes(palavra[0])) {
      return false;
    }
    if (avancado.terminarComVogal && !VOGAIS.includes(palavra[palavra.length - 1])) {
      return false;
    }
    if (!avancado.permitirK && palavra.includes("K")) return false;
    if (!avancado.permitirW && palavra.includes("W")) return false;
    if (!avancado.permitirY && palavra.includes("Y")) return false;

    if (avancado.restringirInicioConsonantal && palavra.length >= 2) {
      if (!VOGAIS.includes(palavra[0]) && !VOGAIS.includes(palavra[1])) {
        const parInicial = palavra.substring(0, 2);
        if (!PARES_INICIAIS_PERMITIDOS.has(parInicial)) {
          return false;
        }
      }
    }

    if (avancado.restringirFinais) {
      const ultima = palavra[palavra.length - 1];
      if (!VOGAIS.includes(ultima)) {
        const permitidas = new Set(["R", "S", "L", "M"]);
        if (avancado.permitirFinaisEstrangeiros) {
          permitidas.add("Z").add("X").add("N").add("K");
        }
        if (!permitidas.has(ultima)) {
          return false;
        }
      }
    }

    return true;
  }

  function applyEstilo(palavra: string): boolean {
    if (!useEstilo) return true;

    let vC = 0;
    for (let i = 0; i < palavra.length; i++) {
      if (VOGAIS.includes(palavra[i])) vC++;
    }
    const cC = palavra.length - vC;

    if (vC < estilo.minV || vC > estilo.maxV) return false;
    if (cC < estilo.minC || cC > estilo.maxC) return false;

    let sv = 0;
    for (let i = 0; i < palavra.length; i++) {
      if (VOGAIS.includes(palavra[i])) {
        sv++;
        if (sv > estilo.maxVSeq) return false;
      } else {
        sv = 0;
      }
    }

    return true;
  }

  function regrasBasicasGrego(palavra: string, maxConsonantes: number): boolean {
    // Exceptions (single words: οὐκ -> OYK, ἐκ -> EK, οὐχ -> OYX)
    if (palavra === "ΟΥΚ" || palavra === "ΕΚ" || palavra === "ΟΥΧ") {
      return true;
    }

    const VOGAIS_GREGAS = "ΑΕΗΙΟΥΩ";
    const DITONGOS_GREGOS = new Set(["ΑΙ", "ΕΙ", "ΟΙ", "ΥΙ", "ΑΥ", "ΕΥ", "ΟΥ", "ΗΥ"]);
    const OCLUSIVAS = "ΠΒΦΚΓΧΤΔΘ";
    const LIQUIDA_NASAL = "ΛΡΜΝ";
    const ASPIRADAS = "ΦΧΘ";
    const DENTAIS = "ΤΔΘ";

    const len = palavra.length;
    if (len === 0) return false;

    // Rule 1: Terminação (Filtro Final de Strings)
    // Se a string terminar em consoante, ela obrigatoriamente deve terminar em ν (nu), ρ (rô) ou ς/ξ/ψ (sigma e suas duplas: Σ, Ξ, Ψ).
    const ultimo = palavra[len - 1];
    if (!VOGAIS_GREGAS.includes(ultimo)) {
      const finaisValidas = "ΝΡΣΞΨ";
      if (!finaisValidas.includes(ultimo)) {
        return false;
      }
    }

    // Rule 1B: Attack of the word (start of the word rules)
    if (len >= 2) {
      const c1 = palavra[0];
      const c2 = palavra[1];
      const isV1 = VOGAIS_GREGAS.includes(c1);
      const isV2 = VOGAIS_GREGAS.includes(c2);

      // If word starts with two consonants:
      if (!isV1 && !isV2) {
        // Líquida ou Nasal + Qualquer Consoante: If first is in Λ, Μ, Ν, Ρ, second must be a vowel
        if ("ΛΜΝΡ".includes(c1)) {
          return false;
        }

        // A "Lei do Rô Inicial" (ρ) - ΡΡ at the start is blocked
        if (c1 === "Ρ" && c2 === "Ρ") {
          return false;
        }

        // Oclusiva + Oclusiva Incompatíveis:
        // Any other combination of two oclusivas at the start is blocked, EXCEPT ΠΤ, ΚΤ, and ΒΔ
        if (OCLUSIVAS.includes(c1) && OCLUSIVAS.includes(c2)) {
          const startCluster = c1 + c2;
          if (startCluster !== "ΠΤ" && startCluster !== "ΚΤ" && startCluster !== "ΒΔ") {
            return false;
          }
        }
      }
    }

    // Rule 1C: Coda silábica final: Encontro consonantal no final de palavra é 100% proibido.
    if (len >= 2) {
      const last1 = palavra[len - 1];
      const last2 = palavra[len - 2];
      if (!VOGAIS_GREGAS.includes(last1) && !VOGAIS_GREGAS.includes(last2)) {
        return false;
      }
    }

    // Rule 2 & 3: Adjacency (Encontros Consonantais e Vocálicos)
    for (let i = 0; i < len - 1; i++) {
      const c1 = palavra[i];
      const c2 = palavra[i + 1];

      const isV1 = VOGAIS_GREGAS.includes(c1);
      const isV2 = VOGAIS_GREGAS.includes(c2);

      if (isV1 && isV2) {
        // Rule 3: Contraction (Encontros Vocálicos)
        // EE, EO, OE, OO, AE, AO must contract and are prohibited
        const pair = c1 + c2;
        if (pair === "ΕΕ" || pair === "ΕΟ" || pair === "ΟΕ" || pair === "ΟΟ" || pair === "ΑΕ" || pair === "ΑΟ") {
          return false;
        }
      } else if (!isV1 && !isV2) {
        // Rule 2: Restrições de Encontros Consonantais

        // Geminação / Duplicadas proibidas: only duplicate ΛΛ, ΜΜ, ΝΝ, ΠΠ, ΡΡ, ΣΣ, ΤΤ are allowed
        if (c1 === c2) {
          const dupAllowed = "ΛΜΝΠΡΣΤ";
          if (!dupAllowed.includes(c1)) {
            return false;
          }
        }

        // Qualquer par onde a primeira letra seja τ, δ, θ (DENTAIS) e a segunda seja outra consoante,
        // exceto se for líquida/nasal (Λ, Ρ, Μ, Ν)
        if (DENTAIS.includes(c1)) {
          if (!LIQUIDA_NASAL.includes(c2)) {
            return false;
          }
        }

        // Oclusivas iguais classes: Duas oclusivas diferentes da mesma classe não podem se tocar
        const LABIAIS = "ΠΒΦ";
        const VELARS = "ΚΓΧ";
        if (LABIAIS.includes(c1) && LABIAIS.includes(c2) && c1 !== c2) {
          return false;
        }
        if (VELARS.includes(c1) && VELARS.includes(c2) && c1 !== c2) {
          // Exception: Gamma Nasal (γ before κ, γ, χ, ξ) is valid (i.e. Γ antes de outra velar is nasal, so ΓΚ or ΓΧ are allowed)
          if (!(c1 === "Γ" && (c2 === "Κ" || c2 === "Χ"))) {
            return false;
          }
        }
        if (DENTAIS.includes(c1) && DENTAIS.includes(c2) && c1 !== c2) {
          return false;
        }

        // Bloqueio de Aspiradas: Duas consoantes aspiradas nunca ficam juntas (ΦΧΘ)
        if (ASPIRADAS.includes(c1) && ASPIRADAS.includes(c2)) {
          return false;
        }

        // Oclusiva + Líquida/Nasal: Só permitida se oclusiva vier antes: Liquid/Nasal followed by Oclusiva is forbidden
        if (LIQUIDA_NASAL.includes(c1) && OCLUSIVAS.includes(c2)) {
          return false;
        }

        // Assimilação obrigatória: Se ocorrer o padrão não-assimilado, impede
        // Before Σ: Labials (ΠΒΦ)+Σ => Ψ, Velars (ΚΓΧ)+Σ => Ξ, Dentals (ΤΔΘ)+Σ => disappear (should be just Σ)
        if (c2 === "Σ") {
          if ("ΠΒΦ".includes(c1)) return false;
          if ("ΚΓΧ".includes(c1)) return false;
          if ("ΤΔΘΝ".includes(c1)) return false; // added N
        }
        // Before Μ: Labials (ΠΒΦ)+Μ => ΜΜ, Velars (ΚΧ)+Μ => ΓΜ, Dentals (ΤΔΘ)+Μ => ΣΜ
        if (c2 === "Μ") {
          if ("ΠΒΦ".includes(c1)) return false;
          if ("ΚΧ".includes(c1)) return false;
          if ("ΤΔΘ".includes(c1)) return false;
        }
      }

      // Sibilante Intervocálica (σ entre vogais): o grego nativo tende a eliminar o σ entre duas vogais
      if (i > 0 && i < len - 1 && palavra[i] === "Σ") {
        const isPrevV = VOGAIS_GREGAS.includes(palavra[i - 1]);
        const isNextV = VOGAIS_GREGAS.includes(palavra[i + 1]);
        if (isPrevV && isNextV) {
          return false;
        }
      }
    }

    // Rule 4: Estrutura Silábica - check syllable attack at start of word and consecutive consonant length
    const nuclei: [number, number][] = [];
    let idx = 0;
    while (idx < len) {
      if (VOGAIS_GREGAS.includes(palavra[idx])) {
        if (idx + 1 < len && DITONGOS_GREGOS.has(palavra[idx] + palavra[idx + 1])) {
          nuclei.push([idx, idx + 1]);
          idx += 2;
        } else {
          nuclei.push([idx, idx]);
          idx += 1;
        }
      } else {
        idx += 1;
      }
    }

    if (nuclei.length === 0) {
      return false; // must contain at least one vowel/nucleus
    }

    // Attack check: consonants before first vowel
    const atkLen = nuclei[0][0];
    if (atkLen > 3) {
      return false;
    }
    if (atkLen === 3) {
      // First is Σ, second is Oclusiva, third is Líquida
      if (palavra[0] !== "Σ") return false;
      if (!OCLUSIVAS.includes(palavra[1])) return false;
      if (!LIQUIDA_NASAL.includes(palavra[2])) return false;
    }

    // Max consecutive consonants limit
    let consecutiveConsonants = 0;
    for (let i = 0; i < len; i++) {
      if (!VOGAIS_GREGAS.includes(palavra[i])) {
        consecutiveConsonants++;
        if (consecutiveConsonants > maxConsonantes) {
          return false;
        }
      } else {
        consecutiveConsonants = 0;
      }
    }

    // Max 3 consecutive vowels limit, and never 3 identical consecutive vowels
    let consecutiveVowelsCount = 0;
    for (let i = 0; i < len; i++) {
      if (VOGAIS_GREGAS.includes(palavra[i])) {
        consecutiveVowelsCount++;
        if (consecutiveVowelsCount > 3) {
          return false;
        }
      } else {
        consecutiveVowelsCount = 0;
      }
    }

    for (let i = 0; i < len - 2; i++) {
      const c1 = palavra[i];
      const c2 = palavra[i + 1];
      const c3 = palavra[i + 2];
      if (VOGAIS_GREGAS.includes(c1) && c1 === c2 && c2 === c3) {
        return false;
      }
    }

    return true;
  }

  // ===================================
  // REGRAS E FUNÇÕES AUXILIARES HEBRAICO
  // ===================================
  const MAP_SOFIT: Record<string, string> = {
    "כ": "ך",
    "מ": "ם",
    "נ": "ן",
    "פ": "ף",
    "צ": "ץ"
  };

  const TRANSLITER_HEBRAICA: Record<string, string> = {
    "א": "A", "ב": "B", "ג": "G", "ד": "D", "ה": "H", "ו": "V", "ז": "Z", "ח": "CH", "ט": "T",
    "י": "Y", "כ": "K", "ך": "K", "ל": "L", "מ": "M", "ם": "M", "נ": "N", "ן": "N", "ס": "S",
    "ע": "A", "פ": "P", "ף": "P", "צ": "TZ", "ץ": "TZ", "ק": "Q", "ר": "R", "ש": "SH", "ת": "T"
  };

  const HEBREW_CHAR_VALUES: Record<string, number> = {
    "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5, "ו": 6, "ז": 7, "ח": 8, "ט": 9,
    "י": 10, "כ": 20, "ך": 20, "ל": 30, "מ": 40, "ם": 40, "נ": 50, "ן": 50,
    "ס": 60, "ע": 70, "פ": 80, "ף": 80, "צ": 90, "ץ": 90, "ק": 100, "ר": 200,
    "ש": 300, "ת": 400
  };

  const GREEK_CHAR_VALUES: Record<string, number> = {
    "Α": 1, "Β": 2, "Γ": 3, "Δ": 4, "Ε": 5, "Ϛ": 6, "Ζ": 7, "Η": 8, "Θ": 9,
    "Ι": 10, "Κ": 20, "Λ": 30, "Μ": 40, "Ν": 50, "Ξ": 60, "Ο": 70, "Π": 80,
    "Ϙ": 90, "Ρ": 100, "Σ": 200, "σ": 200, "ς": 200, "Τ": 300, "Υ": 400,
    "Φ": 500, "Χ": 600, "Ψ": 700, "Ω": 800, "Ϡ": 900
  };

  function findDictionaryEntry(rawWord: string, currentAlphabet: AlphabetType): DictionaryEntry | null {
    // Extract base word without the "(translit)" part if present
    const cleanWord = normalizeWord(rawWord.split(" (")[0]).replace(/\s+/g, "");
    if (!cleanWord) return null;

    let dict: DictionaryEntry[] = [];
    if (currentAlphabet === AlphabetType.Grego) {
      dict = GREEK_DICTIONARY;
    } else if (currentAlphabet === AlphabetType.Hebraico) {
      dict = HEBREW_DICTIONARY;
    } else if (currentAlphabet === AlphabetType.Latino) {
      dict = PORTUGUESE_DICTIONARY;
    }

    return dict.find(entry => normalizeWord(entry.word).replace(/\s+/g, "") === cleanWord) || null;
  }

  function calculateStringGematria(str: string, currentAlphabet: AlphabetType): { total: number; breakdown: string } {
    const uppercaseText = str.toUpperCase();
    let total = 0;
    const pieces: string[] = [];

    for (let i = 0; i < uppercaseText.length; i++) {
      const char = uppercaseText[i];
      // Skip whitespace
      if (char.trim() === "") continue;

      if (currentAlphabet === AlphabetType.Hebraico) {
        const val = HEBREW_CHAR_VALUES[char];
        if (val !== undefined) {
          total += val;
          pieces.push(`${char}(${val})`);
        }
      } else if (currentAlphabet === AlphabetType.Grego) {
        const val = GREEK_CHAR_VALUES[char];
        if (val !== undefined) {
          total += val;
          pieces.push(`${char}(${val})`);
        }
      } else {
        // Latino
        const val = LAT_VALORES[char];
        if (val !== undefined) {
          total += val;
          pieces.push(`${char}(${val})`);
        }
      }
    }

    return {
      total,
      breakdown: pieces.length > 0 ? pieces.join(" + ") : "nenhum caractere reconhecido"
    };
  }

  function formatHebrewWord(palavra: string): string {
    if (palavra.length === 0) return "";
    const len = palavra.length;
    const ultimoChar = palavra[len - 1];
    if (MAP_SOFIT[ultimoChar]) {
      return palavra.substring(0, len - 1) + MAP_SOFIT[ultimoChar];
    }
    return palavra;
  }

  function regrasBasicasHebraico(palavra: string): boolean {
    const len = palavra.length;
    if (len === 0) return false;

    // Last character should not be standard non-sofit version of final elements
    const lastChar = palavra[len - 1];
    const nonSofitFinalas = "כמנפצ";
    if (nonSofitFinalas.includes(lastChar)) {
      return false;
    }

    // Sofit characters must ONLY be at the end
    const sofitChars = "ךםןףץ";
    for (let i = 0; i < len - 1; i++) {
      if (sofitChars.includes(palavra[i])) {
        return false;
      }
    }

    // No duplicate identical guturals: א (Alef), ה (He), ח (Chet), ע (Ayin) e ר (Resh)
    const guturaisProibidas = ["אא", "הה", "חח", "עע", "רר"];
    for (let i = 0; i < len - 1; i++) {
      const pair = palavra.substring(i, i + 2);
      if (guturaisProibidas.includes(pair)) {
        return false;
      }
    }

    // Vav Conjuntivo (ו) inicial não pode ser seguida por letras labiais (ב, מ, פ)
    if (len >= 2 && palavra[0] === "ו") {
      if ("במפ".includes(palavra[1])) {
        return false;
      }
    }

    return true;
  }

  // ===================================
  // TRIGGERS DE BUSCA (DFS Backtracking com Poda)
  // ===================================
  const runSearch = async () => {
    setIsSearching(true);
    cancelRef.current = false;
    setResults([]);

    const startTime = performance.now();
    let combinacoesTestadas = 0;
    const itemsEncontrados: string[] = [];

    // Sem limite artificial de combinações testadas para permitir buscas completas e profundas.

    // Scan do Dicionário Direto: encontra instantaneamente as palavras do banco
    let activeDict: DictionaryEntry[] = [];
    if (alphabet === AlphabetType.Grego) {
      activeDict = GREEK_DICTIONARY;
    } else if (alphabet === AlphabetType.Hebraico) {
      activeDict = HEBREW_DICTIONARY;
    } else {
      activeDict = PORTUGUESE_DICTIONARY;
    }

    const dictPreMatches: string[] = [];
    activeDict.forEach(entry => {
      let sum = 0;
      const word = entry.word.toUpperCase();
      
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (alphabet === AlphabetType.Hebraico) {
          sum += HEBREW_CHAR_VALUES[char] || 0;
        } else if (alphabet === AlphabetType.Grego) {
          sum += GREEK_CHAR_VALUES[char] || 0;
        } else {
          sum += LAT_VALORES[char] || 0;
        }
      }

      if (sum === targetValue) {
        let matchesCriteria = true;

        if (word.length !== totalLength) {
          matchesCriteria = false;
        }

        if (matchesCriteria && alphabet === AlphabetType.Latino && latinoMode === "etimologico") {
          const pfx = prefix.toUpperCase();
          const sfx = suffix.toUpperCase();
          const rad = radical.toUpperCase();

          if (pfx && !word.startsWith(pfx)) matchesCriteria = false;
          if (sfx && !word.endsWith(sfx)) matchesCriteria = false;
          if (rad && !word.includes(rad)) matchesCriteria = false;
        }

        if (matchesCriteria) {
          if (alphabet === AlphabetType.Hebraico) {
            const translit = word.split("").map(c => TRANSLITER_HEBRAICA[c] || c).join("");
            dictPreMatches.push(`${word} (${translit})`);
          } else if (alphabet === AlphabetType.Grego) {
            const translit = word.split("").map(c => TRANSLITER_GREGA[c] || c).join("");
            dictPreMatches.push(`${word} (${translit})`);
          } else {
            dictPreMatches.push(word);
          }
        }
      }
    });

    const foundSet = new Set<string>();
    dictPreMatches.forEach(w => {
      foundSet.add(w);
      itemsEncontrados.push(w);
    });

    setResults([...itemsEncontrados]);
    setStats({
      tested: 0,
      found: itemsEncontrados.length,
      timeMs: 1
    });

    let lastYieldCount = 0;
    let lastYieldTime = performance.now();

    if (alphabet === AlphabetType.Latino) {
      // PFG Pruning canProceedLatinoInDFS (Poda fonética/estilística compartilhada)
      const canProceedLatinoInDFS = (partialWord: string[]): boolean => {
        const len = partialWord.length;
        if (len === 0) return true;

        // 1. Basic rules: no 3 consecutive identical letters
        if (len >= 3) {
          if (partialWord[len - 1] === partialWord[len - 2] && partialWord[len - 2] === partialWord[len - 3]) {
            return false;
          }
        }

        // 2. Basic rules: twin letters are only allowed for RR or SS
        if (len >= 2) {
          if (partialWord[len - 1] === partialWord[len - 2]) {
            const twin = partialWord[len - 2] + partialWord[len - 1];
            if (twin !== "RR" && twin !== "SS") {
              return false;
            }
            // Flank vowel on the left
            if (len >= 3 && !VOGAIS.includes(partialWord[len - 3])) {
              return false;
            }
          }
        }

        // 3. Phonetic rules: no more than 2 consecutive consonants
        if (len >= 3) {
          const isC3 = !VOGAIS.includes(partialWord[len - 3]);
          const isC2 = !VOGAIS.includes(partialWord[len - 2]);
          const isC1 = !VOGAIS.includes(partialWord[len - 1]);
          if (isC3 && isC2 && isC1) {
            return false;
          }
        }

        // 4. Phonetic rules: adjacent consonants are only allowed if in PARES_PERMITIDOS
        if (len >= 2) {
          const isC2 = !VOGAIS.includes(partialWord[len - 2]);
          const isC1 = !VOGAIS.includes(partialWord[len - 1]);
          if (isC2 && isC1) {
            const pair = partialWord[len - 2] + partialWord[len - 1];
            if (!PARES_PERMITIDOS.has(pair)) {
              return false;
            }
          }
        }

        // 5. Stylistic rules: max consecutive vowels in useEstilo
        if (useEstilo && len >= estilo.maxVSeq + 1) {
          let allVowels = true;
          for (let k = 1; k <= estilo.maxVSeq + 1; k++) {
            if (!VOGAIS.includes(partialWord[len - k])) {
              allVowels = false;
              break;
            }
          }
          if (allVowels) {
            return false;
          }
        }

        // 6. Advanced rules: start with consonant
        if (useAvancado && avancado.iniciarComConsoante) {
          if (VOGAIS.includes(partialWord[0])) {
            return false;
          }
        }

        // 7. Advanced rules: restrict initial consonant cluster if first two letters are consonants
        if (useAvancado && avancado.restringirInicioConsonantal && len >= 2) {
          const c0 = !VOGAIS.includes(partialWord[0]);
          const c1 = !VOGAIS.includes(partialWord[1]);
          if (c0 && c1) {
            const firstPair = partialWord[0] + partialWord[1];
            if (!PARES_INICIAIS_PERMITIDOS.has(firstPair)) {
              return false;
            }
          }
        }

        return true;
      };

      if (latinoMode === "etimologico") {
        // Option 1A logic
        const pfx = prefix.toUpperCase();
        const sfx = suffix.toUpperCase();
        const rad = radical.toUpperCase();

        const pfxVal = valorPalavraLatino(pfx);
        const sfxVal = valorPalavraLatino(sfx);
        const radVal = valorPalavraLatino(rad);
        const fixoVal = pfxVal + sfxVal + radVal;

        let letrasLivres = totalLength - pfx.length - sfx.length - rad.length;
        if (modoRadical === "palindrome") {
          letrasLivres = Math.floor((totalLength - rad.length) / 2);
        }

        if (letrasLivres < 0) {
          setResults(["Erro: O tamanho das partes físicas inseridas excede o tamanho total da palavra!"]);
          setIsSearching(false);
          return;
        }

        const isPal = modoRadical === "palindrome";
        let targetMeioVal = 0;

        if (isPal) {
          const diff = targetValue - radVal;
          if (diff < 0 || diff % 2 !== 0) {
            setResults([]);
            setIsSearching(false);
            setStats({ tested: 0, found: 0, timeMs: 1 });
            return;
          }
          targetMeioVal = diff / 2;
        } else {
          targetMeioVal = targetValue - fixoVal;
          if (targetMeioVal < 0) {
            setResults([]);
            setIsSearching(false);
            setStats({ tested: 0, found: 0, timeMs: 1 });
            return;
          }
        }

        // BACKTRACKING DFS para máxima velocidade na filtragem com poda matemática de peso e fonética ativada
        const backtrackSync = (idx: number, somaAtual: number, currentMeio: string[]) => {
          if (cancelRef.current) {
            return;
          }

          if (idx === letrasLivres) {
            combinacoesTestadas++;

            const meioJoin = currentMeio.join("");
            let palavraCompleta = "";

            if (isPal) {
              const meioInvertido = meioJoin.split("").reverse().join("");
              palavraCompleta = meioJoin + rad + meioInvertido;
            } else {
              palavraCompleta = pfx + rad + meioJoin + sfx;
            }

            if (palavraCompleta.length === totalLength && valorPalavraLatino(palavraCompleta) === targetValue) {
              if (regrasBasicasLatino(palavraCompleta) && regrasFoneticasLatino(palavraCompleta)) {
                if (applyEstilo(palavraCompleta) && applyFiltroAvancado(palavraCompleta)) {
                  if (!foundSet.has(palavraCompleta)) {
                    foundSet.add(palavraCompleta);
                    itemsEncontrados.push(palavraCompleta);
                  }
                }
              }
            }
            return;
          }

          // Poda matemática de peso de Gematria para letras livres
          const faltam = letrasLivres - idx;
          if (somaAtual + (faltam * 1) > targetMeioVal || somaAtual + (faltam * 26) < targetMeioVal) {
            return;
          }

          // Poda fonética em tempo real no DFS
          if (idx > 0) {
            const partial: string[] = [];
            if (!isPal) {
              for (let k = 0; k < pfx.length; k++) partial.push(pfx[k]);
              for (let k = 0; k < rad.length; k++) partial.push(rad[k]);
              for (let k = 0; k < idx; k++) partial.push(currentMeio[k]);
            } else {
              for (let k = 0; k < idx; k++) partial.push(currentMeio[k]);
            }

            if (!canProceedLatinoInDFS(partial)) {
              return;
            }
          }

          for (let i = 0; i < ALFABETO_LAT_ARR.length; i++) {
            const letter = ALFABETO_LAT_ARR[i];
            const weight = LAT_VALORES[letter];
            currentMeio[idx] = letter;
            backtrackSync(idx + 1, somaAtual + weight, currentMeio);
          }
        };

        if (letrasLivres > 0) {
          const currentMeio = Array(letrasLivres).fill("");
          for (let i = 0; i < ALFABETO_LAT_ARR.length; i++) {
            if (cancelRef.current) break;

            const letter = ALFABETO_LAT_ARR[i];
            const weight = LAT_VALORES[letter];
            currentMeio[0] = letter;

            backtrackSync(1, weight, currentMeio);

            const now = performance.now();
            setStats({
              tested: combinacoesTestadas,
              found: itemsEncontrados.length,
              timeMs: Math.max(1, Math.round(now - startTime))
            });
            setResults([...itemsEncontrados]);
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        } else {
          backtrackSync(0, 0, []);
        }

      } else {
        // Option 1B: Personalizada (Locking specific letters)
        // Parse fixedLettersInput (e.g. "1A,3A")
        const fixas: Record<number, string> = {};
        if (fixedLettersInput.trim()) {
          const pairs = fixedLettersInput.split(",");
          pairs.forEach(p => {
            const num = p.replace(/\D/g, "");
            const letVal = p.replace(/[^A-Za-z]/g, "").toUpperCase();
            if (num && letVal) {
              fixas[parseInt(num, 10) - 1] = letVal;
            }
          });
        }

        const palTemplate = Array(totalLength).fill("");
        Object.entries(fixas).forEach(([pos, letVal]) => {
          const idx = parseInt(pos, 10);
          if (idx < totalLength) {
            palTemplate[idx] = letVal;
          }
        });

        // Fast backtracking
        const backtrackCustomSync = (idx: number, somaAtual: number, currentWord: string[]) => {
          if (cancelRef.current) return;

          if (idx === totalLength) {
            combinacoesTestadas++;

            const palavraCompleta = currentWord.join("");
            if (somaAtual === targetValue && regrasBasicasLatino(palavraCompleta)) {
              if (regrasFoneticasLatino(palavraCompleta)) {
                if (applyEstilo(palavraCompleta) && applyFiltroAvancado(palavraCompleta)) {
                  if (!foundSet.has(palavraCompleta)) {
                    foundSet.add(palavraCompleta);
                    itemsEncontrados.push(palavraCompleta);
                  }
                }
              }
            }
            return;
          }

          // Poda matemática de Gematria (Backtracker ideal)
          const letrasFaltantes = totalLength - idx;
          if (somaAtual + (letrasFaltantes * 1) > targetValue || somaAtual + (letrasFaltantes * 26) < targetValue) {
            return;
          }

          // Poda fonética customizada em tempo real
          if (idx > 0) {
            const partial = currentWord.slice(0, idx);
            if (!canProceedLatinoInDFS(partial)) {
              return;
            }
          }

          if (palTemplate[idx] !== "") {
            const letter = palTemplate[idx];
            const weight = LAT_VALORES[letter] || 0;
            currentWord[idx] = letter;
            backtrackCustomSync(idx + 1, somaAtual + weight, currentWord);
          } else {
            for (let i = 0; i < ALFABETO_LAT_ARR.length; i++) {
              const letter = ALFABETO_LAT_ARR[i];
              const weight = LAT_VALORES[letter];
              currentWord[idx] = letter;
              backtrackCustomSync(idx + 1, somaAtual + weight, currentWord);
            }
            currentWord[idx] = "";
          }
        };

        if (totalLength > 0) {
          const currentWord = Array(totalLength).fill("");
          const firstLetterTemplate = palTemplate[0];
          const candidates = firstLetterTemplate !== "" ? [firstLetterTemplate] : ALFABETO_LAT_ARR;

          for (let i = 0; i < candidates.length; i++) {
            if (cancelRef.current) break;

            const letter = candidates[i];
            const weight = LAT_VALORES[letter] || 0;
            currentWord[0] = letter;

            backtrackCustomSync(1, weight, currentWord);

            const now = performance.now();
            setStats({
              tested: combinacoesTestadas,
              found: itemsEncontrados.length,
              timeMs: Math.max(1, Math.round(now - startTime))
            });
            setResults([...itemsEncontrados]);
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
      }

    } else if (alphabet === AlphabetType.Hebraico) {
      // Hebraico search: Simple DFS
      const backtrackHebrewSync = (combi: string[], somaAtual: number) => {
        if (cancelRef.current) return;

        if (combi.length === totalLength) {
          combinacoesTestadas++;

          if (somaAtual === targetValue) {
            const palavraCrua = combi.map(k => k.split(" ")[0]).join("");
            const palavraFormatada = formatHebrewWord(palavraCrua);

            if (useHebrewRules) {
              if (!regrasBasicasHebraico(palavraFormatada)) {
                return;
              }
            }

            // Create beautiful transliteration for Hebrew too
            const translit = palavraFormatada.split("").map(c => TRANSLITER_HEBRAICA[c] || c).join("");
            const keyWord = `${palavraFormatada} (${translit})`;
            if (!foundSet.has(keyWord)) {
              foundSet.add(keyWord);
              itemsEncontrados.push(keyWord);
            }
          }
          return;
        }

        // Poda matemática básica:
        const faltantes = totalLength - combi.length;
        if (somaAtual + (faltantes * 1) > targetValue || somaAtual + (faltantes * 400) < targetValue) {
          return;
        }

        for (let i = 0; i < LETRAS_HEB.length; i++) {
          const charName = LETRAS_HEB[i];
          const val = TABELA_HEBRAICA[charName];
          combi.push(charName);
          backtrackHebrewSync(combi, somaAtual + val);
          combi.pop();
        }
      };

      if (totalLength > 0) {
        // Partition search by Hebrew letters
        for (let i = 0; i < LETRAS_HEB.length; i++) {
          if (cancelRef.current) break;

          const charName = LETRAS_HEB[i];
          const val = TABELA_HEBRAICA[charName];

          backtrackHebrewSync([charName], val);

          const now = performance.now();
          setStats({
            tested: combinacoesTestadas,
            found: itemsEncontrados.length,
            timeMs: Math.max(1, Math.round(now - startTime))
          });
          setResults([...itemsEncontrados]);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

    } else if (alphabet === AlphabetType.Grego) {
      // Grego search with custom rules
      const excessoConsoantes = (pal: string, max: number): boolean => {
        const VOGAIS_GREGAS = "ΑΕΗΙΟΥΩ";
        let consecutivas = 0;
        for (let i = 0; i < pal.length; i++) {
          if (VOGAIS_GREGAS.includes(pal[i])) {
            consecutivas = 0;
          } else {
            consecutivas++;
            if (consecutivas > max) return true;
          }
        }
        return false;
      };

      const finaisValidas = ["Ν", "Ρ", "Σ", "Ξ", "Ψ"];
      const iniciosProibidos = ["ΒΓ", "ΒΔ", "ΚΘ", "ΤΚ", "ΔΧ", "ΓΘ"];

      const backtrackGreekSync = (combi: string[], somaAtual: number) => {
        if (cancelRef.current) return;

        if (combi.length === totalLength) {
          combinacoesTestadas++;

          if (somaAtual === targetValue) {
            const palavraCompleta = combi.map(k => k.split(" ")[0]).join("");
            
            // Grego filters
            if (useGreekFinais) {
              const u = palavraCompleta[palavraCompleta.length - 1];
              if (!finaisValidas.includes(u)) return;
            }
            if (useGreekIniciosProibidos) {
              const init = palavraCompleta.substring(0, 2);
              if (iniciosProibidos.includes(init)) return;
            }
            if (excessoConsoantes(palavraCompleta, greekMaxConsonantes)) {
              return;
            }
            if (useGreekKoineFilter) {
              if (!regrasBasicasGrego(palavraCompleta, greekMaxConsonantes)) {
                return;
              }
            }

            // Transliterate
            const translit = palavraCompleta.split("").map(c => TRANSLITER_GREGA[c] || c).join("");
            const keyWord = `${palavraCompleta} (${translit})`;
            if (!foundSet.has(keyWord)) {
              foundSet.add(keyWord);
              itemsEncontrados.push(keyWord);
            }
          }
          return;
        }

        const faltantes = totalLength - combi.length;
        if (somaAtual + (faltantes * 1) > targetValue || somaAtual + (faltantes * 900) < targetValue) {
          return;
        }

        for (let i = 0; i < LETRAS_GRECAS.length; i++) {
          const charName = LETRAS_GRECAS[i];
          const val = TABELA_GREGA[charName];
          combi.push(charName);
          backtrackGreekSync(combi, somaAtual + val);
          combi.pop();
        }
      };

      if (totalLength > 0) {
        // Partition search by Greek letters
        for (let i = 0; i < LETRAS_GRECAS.length; i++) {
          if (cancelRef.current) break;

          const charName = LETRAS_GRECAS[i];
          const val = TABELA_GREGA[charName];

          backtrackGreekSync([charName], val);

          const now = performance.now();
          setStats({
            tested: combinacoesTestadas,
            found: itemsEncontrados.length,
            timeMs: Math.max(1, Math.round(now - startTime))
          });
          setResults([...itemsEncontrados]);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
    }

    const endTime = performance.now();
    setStats({
      tested: combinacoesTestadas,
      found: itemsEncontrados.length,
      timeMs: Math.max(1, Math.round(endTime - startTime))
    });
    setResults(itemsEncontrados);
    setIsSearching(false);
  };

  // Pre-calculate dictionary-filtered items
  const matchedEntries = results.map(r => {
    const entry = findDictionaryEntry(r, alphabet);
    return {
      originalString: r, // e.g. "ΛΟΓΟΣ (LOGOS)" or "DEUS" or "שלום (SHALOM)"
      entry: entry
    };
  });

  const realWordsList = matchedEntries.filter(m => m.entry !== null);

  // Decide what to display based on dictionaryFilterMode
  const displayedResults = (dictionaryFilterMode === "words-only" || dictionaryFilterMode === "words-meanings")
    ? realWordsList.map(m => m.originalString)
    : results;

  const handleDownloadResults = () => {
    if (displayedResults.length === 0) return;
    
    let contentToSave = "";
    if (outputFormat === "pure") {
      // Formato puro de Kislev: apenas as palavras (uma por linha) sem valores ou cabeçalhos
      contentToSave = displayedResults.map(r => {
        // Se for grego ou hebraico e tiver transliteração no formato "ΑΒΓ (ABG)", guardamos apenas a palavra grega/hebraica
        if ((alphabet === AlphabetType.Grego || alphabet === AlphabetType.Hebraico) && r.includes(" (")) {
          return r.split(" (")[0];
        }
        return r;
      }).join("\n");
    } else {
      const headerLine = `SHEMOT - BUSCA DE GEMATRIA VALOR ${targetValue} (${dictionaryFilterMode === "all" ? "Todas as combinações" : "Dicionário Offline"})\n====================================\n`;
      contentToSave = headerLine + displayedResults.map(r => {
        if (dictionaryFilterMode === "words-meanings") {
          const match = findDictionaryEntry(r, alphabet);
          if (match) {
            return `${r} [${match.translation}: ${match.description}] = ${targetValue}`;
          }
        }
        return `${r} = ${targetValue}`;
      }).join("\n");
    }

    const blob = new Blob([contentToSave], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shemot_${alphabet.toLowerCase()}_${targetValue}_filtered.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* Control Panel Col */}
      <div className="xl:col-span-5 space-y-6 bg-neutral-900/60 p-5 md:p-6 rounded-2xl border border-neutral-800">
        
        <div className="flex items-center gap-2 pb-4 border-b border-neutral-800">
          <Settings className="text-amber-500 h-5 w-5" />
          <h3 className="font-bold text-white font-display text-base">Configuração de Busca</h3>
        </div>

        {/* Alphabet Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Selecione o Alfabeto
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[AlphabetType.Latino, AlphabetType.Hebraico, AlphabetType.Grego].map(type => (
              <button
                id={`alphabet-select-${type.toLowerCase()}`}
                key={type}
                onClick={() => {
                  setAlphabet(type);
                  // Adjust sensible defaults
                  if (type === AlphabetType.Hebraico) {
                    setTargetValue(100);
                    setTotalLength(4);
                  } else if (type === AlphabetType.Grego) {
                    setTargetValue(88);
                    setTotalLength(4);
                  } else {
                    setTargetValue(55);
                    setTotalLength(5);
                  }
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  alphabet === type
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Common values parameters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Valor Alvo (Peso)
            </label>
            <input
              id="input-target-value"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-2 px-3.5 text-sm font-semibold focus:border-amber-500/50 outline-none focus:ring-1 focus:ring-amber-500/20 text-center"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Qtd de Letras
            </label>
            <input
              id="input-total-length"
              type="number"
              value={totalLength}
              onChange={(e) => setTotalLength(Math.min(10, Math.max(1, parseInt(e.target.value) || 0)))}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl py-2 px-3.5 text-sm font-semibold focus:border-amber-500/50 outline-none focus:ring-1 focus:ring-amber-500/20 text-center"
            />
          </div>
        </div>

        {/* Output Format selection for Kislev integration */}
        <div className="space-y-1.5 pt-2 border-t border-neutral-800/40">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Formato de Saída (Filtro Kislev)
          </label>
          <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              id="output-format-btn-valued"
              type="button"
              onClick={() => setOutputFormat("valued")}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                outputFormat === "valued"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Palavra + Valor
            </button>
            <button
              id="output-format-btn-pure"
              type="button"
              onClick={() => setOutputFormat("pure")}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                outputFormat === "pure"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Apenas Palavras
            </button>
          </div>
          <p className="text-[10px] text-neutral-400 leading-normal">
            Escolha &quot;Apenas Palavras&quot; para exportar listas puras prontas para carregar no <strong>kislev</strong> (pip install kislev).
          </p>
        </div>

        {/* LATINO LOGIC PARAMETERS */}
        {alphabet === AlphabetType.Latino && (
          <div className="space-y-5 pt-2 border-t border-neutral-800/60">
            
            {/* Latino type selector */}
            <div className="flex border border-neutral-800 rounded-xl overflow-hidden self-start">
              <button
                id="btn-mode-etimolog"
                onClick={() => setLatinoMode("etimologico")}
                className={`flex-1 py-1.5 text-[11px] font-semibold tracking-wide border-r border-neutral-800 ${
                  latinoMode === "etimologico" ? "bg-neutral-850 text-amber-400 font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Busca Etimológica
              </button>
              <button
                id="btn-mode-fixo"
                onClick={() => setLatinoMode("fixo")}
                className={`flex-1 py-1.5 text-[11px] font-semibold tracking-wide ${
                  latinoMode === "fixo" ? "bg-neutral-850 text-amber-400 font-bold" : "text-neutral-400 hover:text-white"
                }`}
              >
                Letras Fixas
              </button>
            </div>

            {/* Option 1A: Etimológico parameters */}
            {latinoMode === "etimologico" ? (
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">Prefixo</span>
                    <input
                      id="input-prefix"
                      type="text"
                      placeholder="Ex: MA"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value.replace(/[^A-Za-z]/g, ""))}
                      className="w-full bg-neutral-950 text-xs text-white border border-neutral-800 rounded-lg p-2 uppercase outline-none focus:border-amber-500/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">Sufixo</span>
                    <input
                      id="input-suffix"
                      type="text"
                      placeholder="Ex: OS"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value.replace(/[^A-Za-z]/g, ""))}
                      className="w-full bg-neutral-950 text-xs text-white border border-neutral-800 rounded-lg p-2 uppercase outline-none focus:border-amber-500/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] text-neutral-400 uppercase font-mono">Radical</span>
                    <input
                      id="input-radical"
                      type="text"
                      placeholder="Ex: ATH"
                      value={radical}
                      onChange={(e) => setRadical(e.target.value.replace(/[^A-Za-z]/g, ""))}
                      className="w-full bg-neutral-950 text-xs text-white border border-neutral-800 rounded-lg p-2 uppercase outline-none focus:border-amber-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 uppercase block font-mono">Modo Radical</span>
                  <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[10px]">
                    {["none", "prefix/suffix", "palindrome"].map(mode => (
                      <button
                        id={`mode-radical-btn-${mode.replace("/", "-")}`}
                        key={mode}
                        onClick={() => setModoRadical(mode)}
                        className={`py-1 rounded uppercase font-semibold select-none ${
                          modoRadical === mode ? "bg-amber-500/20 text-amber-400" : "text-neutral-500 hover:text-neutral-300"
                        }`}
                      >
                        {mode === "none" ? "Não usar" : mode === "prefix/suffix" ? "Pref/Suf" : "Palíndromo"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Option 1B: Personalizada parameters */
              <div className="space-y-2">
                <span className="text-[10px] text-neutral-400 uppercase block font-mono">Fixar Posições (Ex: 1A,3M)</span>
                <input
                  id="input-fixed-letters"
                  type="text"
                  placeholder="Ex: 1M,3T"
                  value={fixedLettersInput}
                  onChange={(e) => setFixedLettersInput(e.target.value)}
                  className="w-full bg-neutral-950 text-xs text-white border border-neutral-800 rounded-lg p-2 uppercase outline-none focus:border-amber-500/40"
                />
                <p className="text-[10px] text-neutral-400 leading-normal">
                  Informa posições que devem ter letras específicas. Posições são indexadas a partir de 1.
                </p>
              </div>
            )}

            {/* Regras estilísticas toggler */}
            <div className="space-y-3.5 pt-3 border-t border-neutral-800/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-xs font-semibold text-white">Regras Estilísticas</span>
                </div>
                <input
                  id="toggle-use-estilo"
                  type="checkbox"
                  checked={useEstilo}
                  onChange={(e) => setUseEstilo(e.target.checked)}
                  className="accent-amber-500 cursor-pointer"
                />
              </div>

              {useEstilo && (
                <div className="bg-neutral-950 p-4.5 rounded-xl border border-neutral-800 space-y-3.5 text-xs text-neutral-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-mono">Vogais Mínimas: {estilo.minV}</label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={estilo.minV}
                        onChange={(e) => setEstilo({ ...estilo, minV: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 h-1 bg-neutral-800 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-mono">Vogais Máximas: {estilo.maxV}</label>
                      <input
                        type="range"
                        min="2"
                        max="6"
                        value={estilo.maxV}
                        onChange={(e) => setEstilo({ ...estilo, maxV: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 h-1 bg-neutral-800 rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-mono">Consoantes Mínimas: {estilo.minC}</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        value={estilo.minC}
                        onChange={(e) => setEstilo({ ...estilo, minC: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 h-1 bg-neutral-800 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-mono">Consoantes Máximas: {estilo.maxC}</label>
                      <input
                        type="range"
                        min="2"
                        max="6"
                        value={estilo.maxC}
                        onChange={(e) => setEstilo({ ...estilo, maxC: parseInt(e.target.value) })}
                        className="w-full accent-amber-500 h-1 bg-neutral-800 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-mono block">Máx Vogais Consecutivas: {estilo.maxVSeq}</label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      value={estilo.maxVSeq}
                      onChange={(e) => setEstilo({ ...estilo, maxVSeq: parseInt(e.target.value) })}
                      className="w-full accent-amber-500 h-1 bg-neutral-800 rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Filtros Avançados Toggler */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-xs font-semibold text-white">Filtros Avançados</span>
                </div>
                <input
                  id="toggle-use-avancado"
                  type="checkbox"
                  checked={useAvancado}
                  onChange={(e) => setUseAvancado(e.target.checked)}
                  className="accent-amber-500 cursor-pointer"
                />
              </div>

              {useAvancado && (
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-805 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Começar com Consoante</span>
                    <input
                      type="checkbox"
                      checked={avancado.iniciarComConsoante}
                      onChange={(e) => setAvancado({ ...avancado, iniciarComConsoante: e.target.checked })}
                      className="accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Terminar com Vogal</span>
                    <input
                      type="checkbox"
                      checked={avancado.terminarComVogal}
                      onChange={(e) => setAvancado({ ...avancado, terminarComVogal: e.target.checked })}
                      className="accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Permitir K</span>
                    <input
                      type="checkbox"
                      checked={avancado.permitirK}
                      onChange={(e) => setAvancado({ ...avancado, permitirK: e.target.checked })}
                      className="accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Permitir W</span>
                    <input
                      type="checkbox"
                      checked={avancado.permitirW}
                      onChange={(e) => setAvancado({ ...avancado, permitirW: e.target.checked })}
                      className="accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Permitir Y</span>
                    <input
                      type="checkbox"
                      checked={avancado.permitirY}
                      onChange={(e) => setAvancado({ ...avancado, permitirY: e.target.checked })}
                      className="accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Restringir encontros consonantais iniciais (apenas BR, CR, FR, etc.)</span>
                    <input
                      type="checkbox"
                      checked={avancado.restringirInicioConsonantal}
                      onChange={(e) => setAvancado({ ...avancado, restringirInicioConsonantal: e.target.checked })}
                      className="accent-amber-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300">Permitir apenas finais permitidos em consoante final (R,S,L,M)</span>
                    <input
                      type="checkbox"
                      checked={avancado.restringirFinais}
                      onChange={(e) => setAvancado({ ...avancado, restringirFinais: e.target.checked })}
                      className="accent-amber-500 cursor-pointer"
                    />
                  </div>
                  {avancado.restringirFinais && (
                    <div className="flex items-center justify-between pl-4 border-l border-neutral-800">
                      <span className="text-neutral-400">Permitir finais estrangeiros (Z,X,N,K)</span>
                      <input
                        type="checkbox"
                        checked={avancado.permitirFinaisEstrangeiros}
                        onChange={(e) => setAvancado({ ...avancado, permitirFinaisEstrangeiros: e.target.checked })}
                        className="accent-amber-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* HEBREW CONFIGS */}
        {alphabet === AlphabetType.Hebraico && (
          <div className="space-y-4 pt-2 border-t border-neutral-800/60 text-xs">
            <span className="text-[10px] text-neutral-400 uppercase font-mono block">Customização Gematria</span>
            
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Aplicar Regras de Escrita e Fonética (Sofit, Duplicações e Conjunções)</span>
              <input
                type="checkbox"
                checked={useHebrewRules}
                onChange={(e) => setUseHebrewRules(e.target.checked)}
                className="accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* GREEK CONFIGS */}
        {alphabet === AlphabetType.Grego && (
          <div className="space-y-4 pt-2 border-t border-neutral-800/60 text-xs">
            <span className="text-[10px] text-neutral-400 uppercase font-mono block">Customização Isopsefia</span>
            
            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Aplicar Regras Fonéticas do Grego Koiné (Contração, Sílabas e Assimilações)</span>
              <input
                type="checkbox"
                checked={useGreekKoineFilter}
                onChange={(e) => setUseGreekKoineFilter(e.target.checked)}
                className="accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Usar Finais Gregos Comuns (Ν, Ρ, Σ, Ξ, Ψ)</span>
              <input
                type="checkbox"
                checked={useGreekFinais}
                onChange={(e) => setUseGreekFinais(e.target.checked)}
                className="accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Restringir Início Grego Proibido (ΒΓ, ΒΔ, etc)</span>
              <input
                type="checkbox"
                checked={useGreekIniciosProibidos}
                onChange={(e) => setUseGreekIniciosProibidos(e.target.checked)}
                className="accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 block font-mono text-[10px] text-left">Máx Consoantes Seguidas: {greekMaxConsonantes}</span>
              <input
                type="range"
                min="2"
                max="4"
                value={greekMaxConsonantes}
                onChange={(e) => setGreekMaxConsonantes(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-neutral-800 rounded"
              />
            </div>
          </div>
        )}

        {/* Run / Cancel Button Group */}
        {isSearching ? (
          <button
            onClick={cancelSearch}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-md cursor-pointer text-sm animate-pulse"
          >
            <Square className="h-4 w-4 fill-current text-white" />
            Parar Busca (Cancelar)
          </button>
        ) : (
          <button
            onClick={runSearch}
            className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-md cursor-pointer text-sm"
          >
            <Play className="h-4 w-4 fill-current" />
            Iniciar Motor de Busca
          </button>
        )}

        {/* Card: Consulta Rápida ao Dicionário */}
        <div id="quick-dictionary-card" className="bg-neutral-900/60 p-5 md:p-6 rounded-2xl border border-neutral-800 space-y-4 text-left">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
            <Book className="text-amber-500 h-4 w-4" />
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Dicionário Offline & Copiar/Colar</h4>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
            Digite ou cole palavras em <strong>Grego</strong>, <strong>Hebraico</strong> ou <strong>Português</strong> para calcular a Gematria e ver o significado místico catalogado.
          </p>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={lookupText}
                onChange={(e) => {
                  setLookupText(e.target.value);
                  setCopiedWord(null);
                }}
                placeholder="Ex: LOGOS, שלום, DEUS, AMOR..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none pr-8 transition"
              />
              <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-neutral-600" />
            </div>

            {lookupText.trim() && (() => {
              // Auto-detect alphabet
              let detectedAlphabet = AlphabetType.Latino;
              if (/[\u0590-\u05FF]/.test(lookupText)) {
                detectedAlphabet = AlphabetType.Hebraico;
              } else if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(lookupText)) {
                detectedAlphabet = AlphabetType.Grego;
              }

              const { total, breakdown } = calculateStringGematria(lookupText, detectedAlphabet);
              const matchedEntry = findDictionaryEntry(lookupText, detectedAlphabet);

              const handleCopy = () => {
                navigator.clipboard.writeText(lookupText);
                setCopiedWord(lookupText);
                setTimeout(() => setCopiedWord(null), 2000);
              };

              return (
                <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800/80 space-y-2 text-xs text-left">
                  <div className="flex justify-between items-center bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Alfabeto: <strong className="text-amber-500 uppercase">{detectedAlphabet}</strong>
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800"
                    >
                      {copiedWord === lookupText ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex justify-between items-baseline gap-2 pt-1">
                    <span className="text-neutral-500 font-mono text-[10px]">Soma Gematria:</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      {total}
                    </span>
                  </div>

                  <div className="text-[10px] text-neutral-400 font-mono leading-relaxed bg-neutral-900/40 p-1.5 rounded max-h-12 overflow-y-auto border border-neutral-900">
                    {breakdown}
                  </div>

                  {matchedEntry ? (
                    <div className="border-t border-neutral-800 pt-2 space-y-1 mt-1 block">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500/15 text-amber-300 font-bold border border-amber-500/25 text-[9px] px-1.5 py-0.5 rounded uppercase font-sans">
                          {matchedEntry.translation}
                        </span>
                        <span className="text-neutral-500 text-[9px] italic font-mono">Termo registrado</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 font-sans leading-relaxed">
                        {matchedEntry.description}
                      </p>
                    </div>
                  ) : (
                    <div className="border-t border-neutral-800 pt-2 flex items-center gap-1.5 text-neutral-500 text-[10px] italic font-sans pr-1">
                      <Info className="h-3.5 w-3.5 text-amber-500/65 flex-shrink-0" />
                      <span>Não enciclopediada no dicionário offline. Somada com sucesso!</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Terminal View Col */}
      <div className="xl:col-span-7 space-y-6">
        
        {/* Statistics Board */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">Testadas</span>
            <div className="text-lg font-bold text-white mt-1 font-mono">
              {stats.tested.toLocaleString()}
            </div>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">Encontradas</span>
            <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
              {stats.found.toLocaleString()}
            </div>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono font-sans">Velocidade (Iter/s)</span>
            <div className="text-lg font-bold text-white mt-1 font-mono flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              {stats.timeMs > 0 ? Math.round((stats.tested / stats.timeMs) * 1000).toLocaleString() : "0"}
            </div>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-2xl">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">Duração da Busca</span>
            <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
              {formatTime(stats.timeMs)}
            </div>
          </div>

        </div>

        {/* Real Console Terminal Box */}
        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col h-[480px]">
          
          {/* Header of Console */}
          <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
              <span className="text-xs text-neutral-300 font-mono pl-1.5">shell_terminal: shemot-search-engine</span>
            </div>

            {results.length > 0 && (
              <button
                onClick={handleDownloadResults}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer bg-neutral-950 border border-neutral-800 px-2 py-1 rounded"
              >
                <Download className="h-3 w-3" />
                Salvar resultados (.txt)
              </button>
            )}
          </div>

          {/* Sub Header / Tabs for Dictionary Filter */}
          {results.length > 0 && (
            <div className="bg-neutral-900/80 px-4 py-2 border-b border-neutral-800/60 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-neutral-500 font-mono uppercase">Filtrar:</span>
                <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-neutral-800/80">
                  <button
                    onClick={() => setDictionaryFilterMode("all")}
                    className={`px-2 py-1 rounded-md transition font-semibold cursor-pointer ${
                      dictionaryFilterMode === "all"
                        ? "bg-amber-500/20 text-amber-300 font-bold"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    Tudo ({results.length})
                  </button>
                  <button
                    onClick={() => setDictionaryFilterMode("words-only")}
                    className={`px-2 py-1 rounded-md transition font-semibold cursor-pointer ${
                      dictionaryFilterMode === "words-only"
                        ? "bg-amber-500/20 text-amber-300 font-bold"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    No Dicionário ({realWordsList.length})
                  </button>
                  <button
                    onClick={() => setDictionaryFilterMode("words-meanings")}
                    className={`px-2 py-1 rounded-md transition font-semibold cursor-pointer ${
                      dictionaryFilterMode === "words-meanings"
                        ? "bg-amber-500/20 text-amber-300 font-bold"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    Significados ({realWordsList.length})
                  </button>
                </div>
              </div>

              {dictionaryFilterMode !== "all" && (
                <div className="text-[10px] text-amber-500/90 font-mono flex items-center gap-1 font-semibold animate-pulse">
                  <Sparkles className="h-2.5 w-2.5" />
                  {realWordsList.length} reais catalogadas!
                </div>
              )}
            </div>
          )}

          {/* Console Content screen */}
          <div translate="no" className="flex-1 p-5 font-mono text-xs overflow-y-auto space-y-2 text-left bg-neutral-950 notranslate">
            <div className="text-neutral-500">
              # Terminal inicializado. Pronto para buscas combinatórias em {alphabet.toUpperCase()}.
              {dictionaryFilterMode !== "all" && ` (Filtrado: apenas termos do dicionário offline)`}
            </div>
            
            {displayedResults.length === 0 ? (
              <div className="text-neutral-600 select-none py-10 text-center flex flex-col items-center justify-center gap-3">
                <Cpu className="h-10 w-10 text-neutral-800 animate-pulse" />
                <span>
                  {dictionaryFilterMode !== "all"
                    ? "Nenhuma palavra registrada no dicionário offline foi gerada com a soma solicitada. Tente outros valores."
                    : "Nenhum teste foi iniciado ainda. Configure os filtros ao lado e clique em \"Iniciar Motor de Busca\"."}
                </span>
              </div>
            ) : (
              displayedResults.map((r, i) => {
                const match = findDictionaryEntry(r, alphabet);
                
                if (dictionaryFilterMode === "words-meanings" && match) {
                  return (
                    <div key={i} className="text-neutral-200 py-2.5 border-b border-neutral-900/60 hover:bg-neutral-900/50 px-3 rounded space-y-1.5 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-amber-300 tracking-widest font-bold text-sm">{r}</span>
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded font-sans font-medium">
                            {match.translation}
                          </span>
                        </div>
                        <span className="text-neutral-500 font-bold font-mono whitespace-nowrap">= {targetValue}</span>
                      </div>
                      <p className="text-neutral-400 font-sans text-xs leading-relaxed max-w-3xl">
                        {match.description}
                      </p>
                    </div>
                  );
                }

                // Default layout or words-only layout
                return (
                  <div key={i} className="text-neutral-200 flex justify-between py-1 border-b border-neutral-900/60 hover:bg-neutral-900 px-2 rounded">
                    {outputFormat === "pure" ? (
                      <span className="text-amber-300 tracking-widest">
                        {(alphabet === AlphabetType.Grego || alphabet === AlphabetType.Hebraico) && r.includes(" (") ? r.split(" (")[0] : r}
                      </span>
                    ) : (
                      <>
                        <span className="text-amber-300 tracking-widest">{r}</span>
                        <span className="text-neutral-500 font-bold">= {targetValue}</span>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Terminal Bottom info */}
          <div className="bg-neutral-900 px-4 py-2 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono flex items-center justify-between">
            <span>MODO: {alphabet.toUpperCase()} ({dictionaryFilterMode === "all" ? "COMPLETO" : "FILTRADO - DICIONÁRIO"})</span>
            <span>CLI SYSTEM PY {"->"} TS SIMULADO</span>
          </div>

        </div>

      </div>
    </div>
  );
}
