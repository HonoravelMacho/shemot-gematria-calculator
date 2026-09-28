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
  /** ids das wordlists da comunidade que contêm a palavra (ex.: ["pt-BR"]). */
  in_wordlists?: string[];
}

export interface SearchProgress {
  tested: number;
  found: number;
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export interface SaveResult {
  ok: boolean;
  /** Caminho onde foi salvo (quando ok). */
  path: string;
  /** Motivo da falha / "cancelado pelo usuário" (quando !ok). */
  error: string;
}

/**
 * Salva um .txt via APIs nativas do Tauri.
 * - Desktop: diálogo "Salvar como" (plugin-dialog) + escrita (plugin-fs).
 * - Android: WebView não tem download; tenta gravar em Downloads
 *   (pode falhar por scoped storage) com fallback para a pasta do app.
 * Retorna ok:false para a UI oferecer o fallback de copiar o texto.
 */
export async function saveTextFileNative(
  filename: string,
  contents: string,
): Promise<SaveResult> {
  try {
    if (!isAndroid()) {
      const { save } = await import("@tauri-apps/plugin-dialog");
      const path = await save({
        defaultPath: filename,
        filters: [{ name: "Texto", extensions: ["txt"] }],
      });
      if (!path) return { ok: false, path: "", error: "cancelado pelo usuário" };
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");
      await writeTextFile(path, contents);
      return { ok: true, path, error: "" };
    }

    const { downloadDir, join } = await import("@tauri-apps/api/path");
    const { writeTextFile, BaseDirectory } = await import(
      "@tauri-apps/plugin-fs"
    );
    try {
      const full = await join(await downloadDir(), filename);
      await writeTextFile(full, contents);
      return { ok: true, path: full, error: "" };
    } catch (e) {
      // Scoped storage (Android 10+) pode barrar Downloads público:
      // grava na pasta privada do app, sempre permitida.
      await writeTextFile(filename, contents, {
        baseDir: BaseDirectory.AppData,
      });
      return { ok: true, path: `pasta do app/${filename}`, error: "" };
    }
  } catch (e) {
    return { ok: false, path: "", error: String(e) };
  }
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
