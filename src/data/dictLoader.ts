/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Loader modular de wordlists da comunidade (ver dictionaries/README.md).
 * Descobre wordlists via public/dicts/registry.json e baixa cada .txt
 * sob demanda (fora do bundle JS), com cache em memória.
 */

export interface WordlistEntry {
  id: string;
  name: string;
  lang: string;
  alphabet: string;
  kind: string;
  version: string;
  file: string;
  entries: number;
  description: string;
}

interface Registry {
  version: number;
  wordlists: WordlistEntry[];
}

/** Normalização canônica (igual à Rust em wordlists.rs): minúsculas + NFD sem diacríticos. */
export function normalizeForMatch(word: string): string {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

let registryCache: Registry | null = null;
const setsCache = new Map<string, Set<string>>();
const inflight = new Map<string, Promise<Set<string>>>();

export async function fetchRegistry(): Promise<Registry> {
  if (registryCache) return registryCache;
  const res = await fetch("dicts/registry.json");
  if (!res.ok) throw new Error(`registry HTTP ${res.status}`);
  registryCache = (await res.json()) as Registry;
  return registryCache;
}

export function wordlistsForAlphabet(
  registry: Registry,
  alphabet: string,
): WordlistEntry[] {
  const a = alphabet.toLowerCase();
  return registry.wordlists.filter(
    (w) => w.kind === "filter" && w.alphabet.toLowerCase() === a,
  );
}

export function loadWordlist(entry: WordlistEntry): Promise<Set<string>> {
  const cached = setsCache.get(entry.id);
  if (cached) return Promise.resolve(cached);
  const ongoing = inflight.get(entry.id);
  if (ongoing) return ongoing;

  const p = (async () => {
    const res = await fetch(`dicts/${entry.file}`);
    if (!res.ok) throw new Error(`wordlist ${entry.id} HTTP ${res.status}`);
    const text = await res.text();
    const set = new Set<string>();
    for (const line of text.split("\n")) {
      const key = normalizeForMatch(line);
      if (key) set.add(key);
    }
    setsCache.set(entry.id, set);
    inflight.delete(entry.id);
    return set;
  })();
  inflight.set(entry.id, p);
  return p;
}

export function wordlistContains(
  entryId: string,
  rawWord: string,
): boolean {
  const set = setsCache.get(entryId);
  if (!set) return false;
  // Remove sufixo de transliteração "PALAVRA (TRANSLIT)" antes de normalizar.
  const base = rawWord.split(" (")[0];
  return set.has(normalizeForMatch(base));
}
