/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

mod gematria;

use colored::*;
use std::collections::HashMap;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use std::time::Instant;

use gematria::{
    backtrack_latino_etimologico, backtrack_latino_custom,
    backtrack_hebraico, backtrack_grego,
    LatinoEstilo, LatinoAvancado, WildcardSpec,
    Dictionary, DictionaryManager,
};

fn main() {
    println!("{}", "=====================================================================".bright_yellow());
    println!("{}", "          🕯️  SHEMOT GEMATRIA & OFFLINE DICTIONARIES (RUST) 🕯️         ".bright_yellow().bold());
    println!("{}", "=====================================================================".bright_yellow());
    println!("{}", "Fase 3: Leitura de arquivos e dicionários offline integrada na memória!".cyan());
    println!("{}", "Carregamento modular e filtragem instantânea ativada.".green());
    println!();

    // 1. Load Dictionaries Benchmarking
    println!("{}", "---- [ CARREGANDO DICIONÁRIOS MODULARES NA MEMÓRIA ] ----".bright_blue().bold());
    let dict_start = Instant::now();
    let dict_manager = DictionaryManager::load_all();
    let dict_duration = dict_start.elapsed();

    println!("Dicionário Português: {} termos carregados", dict_manager.portuguese.list_words().len().to_string().bright_green().bold());
    println!("Dicionário Grego (Koiné): {} termos carregados", dict_manager.greek.list_words().len().to_string().bright_green().bold());
    println!("Dicionário Hebraico: {} termos carregados", dict_manager.hebrew.list_words().len().to_string().bright_green().bold());
    println!("Tempo de Inicialização & Parsing JSON: {}", format!("{:?}", dict_duration).bright_green());
    println!();

    let cancel_flag = Arc::new(AtomicBool::new(false));

    // 2. Latino Etimológico + Dictionary Filtering & Matching definitions
    println!("{}", "------------ [ BUSCA 1: LATINO ETIMOLÓGICO + DICIONÁRIO ] ------------".bright_blue().bold());
    println!("Gerando todas as combinações de tamanho 4 para Gematria Alvo = 74,");
    println!("depois filtrando apenas as palavras reais no dicionário offline...");

    let estilo = LatinoEstilo {
        min_v: 1,
        max_v: 4,
        min_c: 1,
        max_c: 6,
        max_v_seq: 3,
    };
    let avancado = LatinoAvancado {
        iniciar_com_consoante: false,
        terminar_com_vogal: false,
        permitir_k: true,
        permitir_w: true,
        permitir_y: true,
        restringir_finais: false,
        permitir_finais_estrangeiros: true,
        restringir_inicio_consonantal: false,
    };

    let search_start = Instant::now();
    let mut total_testes = 0;
    
    // Search returns all candidate permutations meeting the structural & gematria conditions
    let todas_combinacoes = backtrack_latino_etimologico(
        74,
        4,
        "",
        "",
        "",
        "fixed",
        true,
        &estilo,
        true,
        &avancado,
        cancel_flag.clone(),
        &mut |tested, _found| {
            total_testes = tested;
        },
    );
    let search_duration = search_start.elapsed();

    println!("Combinações Estruturais Testadas: {}", total_testes.to_string().bright_yellow());
    println!("Combinações Válidas Geradas: {}", todas_combinacoes.len().to_string().bright_blue());
    println!("Tempo de Backtracking: {:?}", search_duration);

    // Filter step: Compare only the words (O(1) lookups inside word_set) to save processing
    let filter_start = Instant::now();
    let mut palavras_reais = Vec::new();
    for candidate in &todas_combinacoes {
        if dict_manager.portuguese.contains(candidate) {
            if let Some(entry) = dict_manager.portuguese.lookup(candidate) {
                palavras_reais.push(entry);
            }
        }
    }
    let filter_duration = filter_start.elapsed();
    println!("Tempo de Comparação/Filtragem no Dicionário: {:?}", filter_duration);
    println!("Palavras Reais Encontradas: {}", palavras_reais.len().to_string().bright_green().bold());

    println!("\nDetalhamento dos Termos Encontrados:");
    for entry in &palavras_reais {
        println!("  • {} (Spelling: {})", entry.word.bright_magenta().bold(), entry.original_word.bright_white());
        println!("    ├─ Tradução: {}", entry.translation.bright_cyan());
        println!("    └─ Definição: {}", entry.description.italic().white());
    }
    println!();

    // 3. Greek Isopsefia + Dictionary Filtering
    println!("{}", "------------ [ BUSCA 2: GREGO ISOPSEFIA + DICIONÁRIO ] ------------".bright_blue().bold());
    println!("Buscando palavras de tamanho 5 com Isopsefia = 318...");

    let greek_start = Instant::now();
    let mut total_testes_greek = 0;
    let candidates_greek = backtrack_grego(
        318,
        5,
        false,
        false,
        3,
        false,
        cancel_flag.clone(),
        &mut |tested, _found| {
            total_testes_greek = tested;
        },
    );
    let greek_duration = greek_start.elapsed();

    println!("Candidatos de Isopsefia Gerados: {}", candidates_greek.len().to_string().bright_blue());
    println!("Tempo de Backtracking Grego: {:?}", greek_duration);

    let mut real_greek_words = Vec::new();
    for entry_str in &candidates_greek {
        // Results are formatted as "ΑΒΓΔ (ABGD)" so we extract the greek word
        if let Some(raw_word) = entry_str.split(' ').next() {
            if dict_manager.greek.contains(raw_word) {
                if let Some(entry) = dict_manager.greek.lookup(raw_word) {
                    real_greek_words.push(entry);
                }
            }
        }
    }

    println!("Palavras Reais Gregas Encontradas: {}", real_greek_words.len().to_string().bright_green().bold());
    for entry in &real_greek_words {
        println!("  • {} (Original: {})", entry.word.bright_magenta().bold(), entry.original_word.bright_white());
        println!("    ├─ Tradução: {}", entry.translation.bright_cyan());
        println!("    └─ Definição: {}", entry.description.italic().white());
    }
    println!();

    // 4. Hebrew Gematria + Dictionary Filtering
    println!("{}", "------------ [ BUSCA 3: HEBRAICO GEMATRIA + DICIONÁRIO ] ------------".bright_blue().bold());
    println!("Buscando palavras de tamanho 4 com Gematria = 55...");

    let hebrew_start = Instant::now();
    let mut total_testes_hebrew = 0;
    let candidates_hebrew = backtrack_hebraico(
        55,
        4,
        false,
        cancel_flag.clone(),
        &mut |tested, _found| {
            total_testes_hebrew = tested;
        },
    );
    let hebrew_duration = hebrew_start.elapsed();

    println!("Candidatos de Gematria Hebraicos Gerados: {}", candidates_hebrew.len().to_string().bright_blue());
    println!("Tempo de Backtracking Hebraico: {:?}", hebrew_duration);

    let mut real_hebrew_words = Vec::new();
    for entry_str in &candidates_hebrew {
        // Results are formatted as "שלום (Shalom)" so we extract the hebrew part
        if let Some(raw_word) = entry_str.split(' ').next() {
            if dict_manager.hebrew.contains(raw_word) {
                if let Some(entry) = dict_manager.hebrew.lookup(raw_word) {
                    real_hebrew_words.push(entry);
                }
            }
        }
    }

    println!("Palavras Reais Hebraicas Encontradas: {}", real_hebrew_words.len().to_string().bright_green().bold());
    for entry in &real_hebrew_words {
        println!("  • {} (Original: {})", entry.word.bright_magenta().bold(), entry.original_word.bright_white());
        println!("    ├─ Tradução: {}", entry.translation.bright_cyan());
        println!("    └─ Definição: {}", entry.description.italic().white());
    }
    println!();

    println!("{}", "=====================================================================".bright_yellow());
    println!("{}", "✨ SUCESSO: Fase 3 Concluída! Dicionários Integrados na Memória! ✨".bright_green().bold());
    println!("{}", "=====================================================================".bright_yellow());
}
