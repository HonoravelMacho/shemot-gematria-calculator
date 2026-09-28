/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Wrapper Tauri v2 (desktop + Android) com fallback para navegador.
 * Mantém a engine Rust como fonte de verdade para combinatória;
 * o motor TS em GematriaCalculator.tsx só é usado no browser.
 */

export interface RichResult {
  word: string;
  has_meaning: boolean;
  translation: string;
  description: string;
  original_word: string;
}

export interface SearchProgress {
  tested: number;
  found: number;
}

export function isTauriRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as Record<string, unknown>;
  return (
    w.__TAURI_INTERNALS__ !== undefined ||
    w.__TAURI__ !== undefined ||
    // @tauri-apps/api define __TAURI_EVENT_PLUGIN_INTERNALS__ no v2
    w.__TAURI_EVENT_PLUGIN_INTERNALS__ !== undefined
  );
}

export async function invokeSearch(
  command: "run_gematria_search",
  args: Record<string, unknown>,
): Promise<RichResult[]> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<RichResult[]>(command, args);
}

export async function invokeCancel(): Promise<void> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("cancel_search");
  } catch (err) {
    console.error("cancel_search failed:", err);
  }
}

export async function listenProgress(
  cb: (p: SearchProgress) => void,
): Promise<() => void> {
  const { listen } = await import("@tauri-apps/api/event");
  const unlisten = await listen<SearchProgress>("search_progress", (event) => {
    cb(event.payload);
  });
  return unlisten;
}
