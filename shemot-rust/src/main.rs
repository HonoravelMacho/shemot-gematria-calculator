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
};

fn main() {
    println!("{}", "=======================================================".bright_amber());
    println!("{}", "      🕯️  SHEMOT GEMATRIA SEARCH ENGINE (RUST) 🕯️      ".bright_yellow().bold());
    println!("{}", "=======================================================".bright_amber());
    println!("{}", "Iniciando o Motor Combinatório de Ultra Velocidade (Fase 2)!".cyan());
    println!("{}", "Módulos de Permutação Recursiva e Poda DFS Fonética ativos.".green());
    println!();

    let cancel_flag = Arc::new(AtomicBool::new(false));

    // 1. Benchmark Latino Etimológico
    println!("{}", "------------ [ BUSCA 1: LATINO ETIMOLÓGICO ] ------------".bright_blue().bold());
    println!("Parâmetros: Alvo: 74, Letras: 8, Prefixo: '', Radical: '', Sufixo: ''");
    
    let estilo = LatinoEstilo {
        min_v: 2,
        max_v: 4,
        min_c: 2,
        max_c: 6,
        max_v_seq: 2,
    };
    let avancado = LatinoAvancado {
        iniciar_com_consoante: true,
        terminar_com_vogal: false,
        permitir_k: false,
        permitir_w: false,
        permitir_y: false,
        restringir_finais: true,
        permitir_finais_estrangeiros: false,
        restringir_inicio_consonantal: true,
    };

    let start = Instant::now();
    let mut total_testes = 0;
    
    let resultados = backtrack_latino_etimologico(
        74,
        8,
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
    let duration = start.elapsed();

    println!("Duração: {}", format!("{:?}", duration).bright_green());
    println!("Combinações Testadas: {}", total_testes.to_string().bright_yellow().bold());
    println!("Palavras Encontradas (Regras de Sílabas & Fonética): {}", resultados.len().to_string().bright_green().bold());
    
    if total_testes > 0 {
        let speed = (total_testes as f64) / duration.as_secs_f64();
        println!("Velocidade Real em Rust: {} Iterações/segundo", format!("{:.2}", speed).bright_red().bold());
    }

    println!("\nPrimeiras 15 palavras geradas:");
    for w in resultados.iter().take(15) {
        println!("  - {}", w.bright_white());
    }
    println!();

    // 2. Benchmark Latino Customizado (Locking & Wildcards)
    println!("{}", "------------ [ BUSCA 2: LATINO CUSTOMIZADO ] ------------".bright_blue().bold());
    println!("Parâmetros: Alvo: 74, Letras: 8, Posições Fixas: 6C, 7H, 8A");

    let mut fixas = HashMap::new();
    fixas.insert(5, 'C'); // 6a letra (0-indexed: 5)
    fixas.insert(6, 'H'); // 7a letra (0-indexed: 6)
    fixas.insert(7, 'A'); // 8a letra (0-indexed: 7)

    let wildcards: Vec<WildcardSpec> = vec![];

    let start_custom = Instant::now();
    let mut total_testes_custom = 0;
    let resultados_custom = backtrack_latino_custom(
        74,
        8,
        &fixas,
        &wildcards,
        true,
        &estilo,
        true,
        &avancado,
        cancel_flag.clone(),
        &mut |tested, _found| {
            total_testes_custom = tested;
        },
    );
    let duration_custom = start_custom.elapsed();

    println!("Duração: {}", format!("{:?}", duration_custom).bright_green());
    println!("Combinações Testadas: {}", total_testes_custom.to_string().bright_yellow().bold());
    println!("Palavras Encontradas: {}", resultados_custom.len().to_string().bright_green().bold());
    
    if total_testes_custom > 0 {
        let speed = (total_testes_custom as f64) / duration_custom.as_secs_f64();
        println!("Velocidade Real em Rust: {} Iterações/segundo", format!("{:.2}", speed).bright_red().bold());
    }

    println!("\nPrimeiras 15 palavras geradas:");
    for w in resultados_custom.iter().take(15) {
        println!("  - {}", w.bright_white());
    }
    println!();

    // 3. Benchmark Hebraico
    println!("{}", "------------ [ BUSCA 3: HEBRAICO ISOPSEFIA ] ------------".bright_blue().bold());
    println!("Parâmetros: Alvo: 55, Letras: 4, Regras Gramaticais: Ativadas");

    let start_heb = Instant::now();
    let mut total_testes_heb = 0;
    let resultados_heb = backtrack_hebraico(
        55,
        4,
        true,
        cancel_flag.clone(),
        &mut |tested, _found| {
            total_testes_heb = tested;
        },
    );
    let duration_heb = start_heb.elapsed();

    println!("Duração: {}", format!("{:?}", duration_heb).bright_green());
    println!("Combinações Testadas: {}", total_testes_heb.to_string().bright_yellow().bold());
    println!("Palavras Encontradas (Formatadas Sofit): {}", resultados_heb.len().to_string().bright_green().bold());
    
    if total_testes_heb > 0 {
        let speed = (total_testes_heb as f64) / duration_heb.as_secs_f64();
        println!("Velocidade Real em Rust: {} Iterações/segundo", format!("{:.2}", speed).bright_red().bold());
    }

    println!("\nPrimeiras 15 palavras geradas (com Transliteração):");
    for w in resultados_heb.iter().take(15) {
        println!("  - {}", w.bright_white());
    }
    println!();

    // 4. Benchmark Grego
    println!("{}", "------------ [ BUSCA 4: GREGO ISOPSEFIA ] ------------".bright_blue().bold());
    println!("Parâmetros: Alvo: 318, Letras: 4, Filtro Koiné Completo");

    let start_grk = Instant::now();
    let mut total_testes_grk = 0;
    let resultados_grk = backtrack_grego(
        318,
        4,
        true,
        true,
        2,
        true,
        cancel_flag.clone(),
        &mut |tested, _found| {
            total_testes_grk = tested;
        },
    );
    let duration_grk = start_grk.elapsed();

    println!("Duração: {}", format!("{:?}", duration_grk).bright_green());
    println!("Combinações Testadas: {}", total_testes_grk.to_string().bright_yellow().bold());
    println!("Palavras Encontradas: {}", resultados_grk.len().to_string().bright_green().bold());
    
    if total_testes_grk > 0 {
        let speed = (total_testes_grk as f64) / duration_grk.as_secs_f64();
        println!("Velocidade Real em Rust: {} Iterações/segundo", format!("{:.2}", speed).bright_red().bold());
    }

    println!("\nPrimeiras 15 palavras geradas (com Transliteração):");
    for w in resultados_grk.iter().take(15) {
        println!("  - {}", w.bright_white());
    }
    println!();

    println!("{}", "=======================================================".bright_amber());
    println!("{}", "✨ SUCESSO: Fase 2 concluída! Motor Combinatório voando em Rust! ✨".bright_green().bold());
    println!("{}", "=======================================================".bright_amber());
}
