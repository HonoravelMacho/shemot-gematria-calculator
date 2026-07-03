/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use serde::Serialize;

use gematria::{
    backtrack_latino_etimologico, backtrack_latino_custom,
    backtrack_hebraico, backtrack_grego,
    LatinoEstilo, LatinoAvancado, WildcardSpec,
    Dictionary, DictionaryManager, DictionaryEntry,
};

// Payload for real-time progress events
#[derive(Clone, Serialize)]
struct ProgressPayload {
    tested: u64,
    found: usize,
}

// Global lazy or shared DictionaryManager can be managed by Tauri state
struct AppState {
    dictionary_manager: DictionaryManager,
    cancel_flag: Arc<AtomicBool>,
}

#[derive(Serialize)]
struct RichResult {
    word: String,
    has_meaning: bool,
    translation: String,
    description: String,
    original_word: String,
}

#[tauri::command]
fn cancel_search(state: tauri::State<'_, AppState>) {
    state.cancel_flag.store(true, Ordering::Relaxed);
}

#[tauri::command]
fn run_gematria_search(
    window: tauri::Window,
    state: tauri::State<'_, AppState>,
    target_value: u32,
    total_length: usize,
    alphabet: String, // "latino" | "hebraico" | "grego"
    latino_mode: String, // "etimologico" | "custom"
    prefix: String,
    suffix: String,
    radical: String,
    modo_radical: String,
    fixed_letters_input: String,
    use_estilo: bool,
    min_v: u32,
    max_v: u32,
    min_c: u32,
    max_c: u32,
    max_v_seq: u32,
    use_avancado: bool,
    iniciar_com_consoante: bool,
    terminar_com_vogal: bool,
    permitir_k: bool,
    permitir_w: bool,
    permitir_y: bool,
    restringir_finais: bool,
    permitir_finais_estrangeiros: bool,
    restringir_inicio_consonantal: bool,
    use_hebrew_rules: bool,
    use_greek_finais: bool,
    use_greek_inicios_proibidos: bool,
    greek_max_consonantes: u32,
    use_greek_koine_filter: bool,
) -> Result<Vec<RichResult>, String> {
    // Reset cancel flag
    state.cancel_flag.store(false, Ordering::Relaxed);

    let cancel_clone = state.cancel_flag.clone();
    let window_clone = window.clone();

    let estilo = LatinoEstilo {
        min_v,
        max_v,
        min_c,
        max_c,
        max_v_seq,
    };

    let avancado = LatinoAvancado {
        iniciar_com_consoante,
        terminar_com_vogal,
        permitir_k,
        permitir_w,
        permitir_y,
        restringir_finais,
        permitir_finais_estrangeiros,
        restringir_inicio_consonantal,
    };

    let mut raw_results = Vec::new();

    let mut on_iter = move |tested: u64, found: usize| {
        let _ = window_clone.emit("search_progress", ProgressPayload { tested, found });
    };

    if alphabet == "hebraico" {
        raw_results = backtrack_hebraico(
            target_value,
            total_length,
            use_hebrew_rules,
            cancel_clone,
            &mut on_iter,
        );
    } else if alphabet == "grego" {
        raw_results = backtrack_grego(
            target_value,
            total_length,
            use_greek_finais,
            use_greek_inicios_proibidos,
            greek_max_consonantes,
            use_greek_koine_filter,
            cancel_clone,
            &mut on_iter,
        );
    } else {
        // Latino
        if latino_mode == "etimologico" {
            raw_results = backtrack_latino_etimologico(
                target_value,
                total_length,
                &prefix,
                &suffix,
                &radical,
                &modo_radical,
                use_estilo,
                &estilo,
                use_avancado,
                &avancado,
                cancel_clone,
                &mut on_iter,
            );
        } else {
            // Option 1B: Custom / Structured search with locked letters/wildcards
            let mut fixas = HashMap::new();
            let mut wildcards = Vec::new();

            if !fixed_letters_input.trim().is_empty() {
                let parts: Vec<&str> = fixed_letters_input
                    .split(',')
                    .map(|p| p.trim())
                    .filter(|p| !p.is_empty())
                    .collect();

                #[derive(Debug, Clone)]
                enum ParsedType {
                    Fixed { idx: usize, char: char },
                    Wildcard { char: char },
                }

                let mut parsed_items = Vec::new();

                for p in parts {
                    if p.starts_with('#') {
                        let clean_char: String = p.chars().filter(|c| c.is_alphabetic()).collect();
                        if let Some(ch) = clean_char.to_uppercase().chars().next() {
                            parsed_items.push(ParsedType::Wildcard { char: ch });
                        }
                    } else {
                        let num_str: String = p.chars().filter(|c| c.is_numeric()).collect();
                        let alpha_str: String = p.chars().filter(|c| c.is_alphabetic()).collect();
                        if !num_str.is_empty() && !alpha_str.is_empty() {
                            if let Ok(num) = num_str.parse::<usize>() {
                                if num > 0 && num <= total_length {
                                    let idx = num - 1;
                                    if let Some(ch) = alpha_str.to_uppercase().chars().next() {
                                        fixas.insert(idx, ch);
                                        parsed_items.push(ParsedType::Fixed { idx, char: ch });
                                    }
                                }
                            }
                        }
                    }
                }

                for (item_idx, item) in parsed_items.iter().enumerate() {
                    if let ParsedType::Wildcard { char: ch } = *item {
                        let mut min_idx = 0;
                        for l in (0..item_idx).rev() {
                            if let ParsedType::Fixed { idx, .. } = parsed_items[l] {
                                min_idx = idx + 1;
                                break;
                            }
                        }

                        let mut max_idx = total_length - 1;
                        for r in (item_idx + 1)..parsed_items.len() {
                            if let ParsedType::Fixed { idx, .. } = parsed_items[r] {
                                max_idx = idx - 1;
                                break;
                            }
                        }

                        wildcards.push(WildcardSpec {
                            char: ch,
                            min_idx,
                            max_idx,
                        });
                    }
                }
            }

            raw_results = backtrack_latino_custom(
                target_value,
                total_length,
                &fixas,
                &wildcards,
                use_estilo,
                &estilo,
                use_avancado,
                &avancado,
                cancel_clone,
                &mut on_iter,
            );
        }
    }

    // Now, enrich raw results with dictionary definitions if available
    let mut rich_results = Vec::new();

    for r in raw_results {
        // Extract plain search key for formatting (e.g. "ΛΟΓΟΣ (LOGOS)" or "DEUS" or "שלום (SHALOM)")
        let clean_word = r.split(' ').next().unwrap_or(&r).to_string();

        let mut has_meaning = false;
        let mut translation = String::new();
        let mut description = String::new();
        let mut original_word = clean_word.clone();

        if alphabet == "hebraico" {
            if state.dictionary_manager.hebrew.contains(&clean_word) {
                if let Some(entry) = state.dictionary_manager.hebrew.lookup(&clean_word) {
                    has_meaning = true;
                    translation = entry.translation.clone();
                    description = entry.description.clone();
                    original_word = entry.original_word.clone();
                }
            }
        } else if alphabet == "grego" {
            if state.dictionary_manager.greek.contains(&clean_word) {
                if let Some(entry) = state.dictionary_manager.greek.lookup(&clean_word) {
                    has_meaning = true;
                    translation = entry.translation.clone();
                    description = entry.description.clone();
                    original_word = entry.original_word.clone();
                }
            }
        } else {
            // Latino
            if state.dictionary_manager.portuguese.contains(&clean_word) {
                if let Some(entry) = state.dictionary_manager.portuguese.lookup(&clean_word) {
                    has_meaning = true;
                    translation = entry.translation.clone();
                    description = entry.description.clone();
                    original_word = entry.original_word.clone();
                }
            }
        }

        rich_results.push(RichResult {
            word: r,
            has_meaning,
            translation,
            description,
            original_word,
        });
    }

    Ok(rich_results)
}

#[tauri::command]
fn quick_lookup_dictionary(
    state: tauri::State<'_, AppState>,
    word: String,
    alphabet: String,
) -> Result<Option<RichResult>, String> {
    let clean_word = word.to_uppercase().trim().to_string();

    let mut has_meaning = false;
    let mut translation = String::new();
    let mut description = String::new();
    let mut original_word = clean_word.clone();

    if alphabet == "hebraico" {
        if state.dictionary_manager.hebrew.contains(&clean_word) {
            if let Some(entry) = state.dictionary_manager.hebrew.lookup(&clean_word) {
                has_meaning = true;
                translation = entry.translation.clone();
                description = entry.description.clone();
                original_word = entry.original_word.clone();
            }
        }
    } else if alphabet == "grego" {
        if state.dictionary_manager.greek.contains(&clean_word) {
            if let Some(entry) = state.dictionary_manager.greek.lookup(&clean_word) {
                has_meaning = true;
                translation = entry.translation.clone();
                description = entry.description.clone();
                original_word = entry.original_word.clone();
            }
        }
    } else {
        // Latino
        if state.dictionary_manager.portuguese.contains(&clean_word) {
            if let Some(entry) = state.dictionary_manager.portuguese.lookup(&clean_word) {
                has_meaning = true;
                translation = entry.translation.clone();
                description = entry.description.clone();
                original_word = entry.original_word.clone();
            }
        }
    }

    if has_meaning {
        Ok(Some(RichResult {
            word: clean_word,
            has_meaning,
            translation,
            description,
            original_word,
        }))
    } else {
        Ok(None)
    }
}

fn main() {
    let state = AppState {
        dictionary_manager: DictionaryManager::load_all(),
        cancel_flag: Arc::new(AtomicBool::new(false)),
    };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            run_gematria_search,
            cancel_search,
            quick_lookup_dictionary
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
