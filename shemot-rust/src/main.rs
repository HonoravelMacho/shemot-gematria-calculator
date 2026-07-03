/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

mod gematria;

use colored::*;
use gematria::{
    valor_palavra_latino, regras_basicas_latino, regras_foneticas_latino,
    valor_palavra_grega, regras_basicas_grego,
    valor_palavra_hebraico, format_hebrew_word,
    LatinoEstilo, LatinoAvancado,
};

fn main() {
    println!("{}", "=======================================================".bright_amber());
    println!("{}", "      🕯️  SHEMOT GEMATRIA SEARCH ENGINE (RUST) 🕯️      ".bright_yellow().bold());
    println!("{}", "=======================================================".bright_amber());
    println!("{}", "Iniciando a migração modular do motor de busca para Rust!".cyan());
    println!("{}", "Fase 1: Mapeamento de Alfabetos, Cálculos e Validações.".green());
    println!();

    // 1. Testando Latino (Português)
    println!("{}", "------------ [ TESTE 1: ALFABETO LATINO ] ------------".bright_blue().bold());
    let palavra_teste_lat = "SHEMOT";
    let valor_lat = valor_palavra_latino(palavra_teste_lat);
    let basico_lat = regras_basicas_latino(palavra_teste_lat);
    let fonetico_lat = regras_foneticas_latino(palavra_teste_lat);

    println!("Palavra: {}", palavra_teste_lat.bright_white().bold());
    println!("Soma Gematria: {}", valor_lat.to_string().bright_green().bold());
    println!(
        "Validação Básica: {}",
        if basico_lat { "VÁLIDO".green() } else { "INVÁLIDO".red() }
    );
    println!(
        "Validação Fonética: {}",
        if fonetico_lat { "VÁLIDO".green() } else { "INVÁLIDO".red() }
    );

    // Testando estilo e filtros avançados
    let estilo = LatinoEstilo {
        min_v: 2,
        max_v: 4,
        min_c: 2,
        max_c: 5,
        max_v_seq: 2,
    };
    let avancado = LatinoAvancado {
        iniciar_com_consoante: true,
        terminar_com_vogal: false,
        permitir_k: true,
        permitir_w: true,
        permitir_y: true,
        restringir_finais: true,
        permitir_finais_estrangeiros: false,
        restringir_inicio_consonantal: true,
    };

    let estilo_valido = gematria::apply_estilo(palavra_teste_lat, true, &estilo);
    let avancado_valido = gematria::apply_filtro_avancado(palavra_teste_lat, true, &avancado);

    println!(
        "Filtro Estilo (Mín 2V, Máx 4V, Mín 2C, Máx 5C): {}",
        if estilo_valido { "APROVADO".green() } else { "REPROVADO".red() }
    );
    println!(
        "Filtro Avançado (Iniciar Consoante, Terminar Consoante): {}",
        if avancado_valido { "APROVADO".green() } else { "REPROVADO".red() }
    );
    println!();

    // 2. Testando Hebraico
    println!("{}", "----------- [ TESTE 2: ALFABETO HEBRAICO ] -----------".bright_blue().bold());
    let palavra_heb_raw = "אמת"; // Emet (Verdade)
    let valor_heb = valor_palavra_hebraico(palavra_heb_raw);
    println!("Palavra original: {}", palavra_heb_raw.bright_white().bold());
    println!("Soma Gematria (1 + 40 + 400): {}", valor_heb.to_string().bright_green().bold());

    // Testando formatação de letra Sofit
    let palavra_com_sofit = "מלך"; // Melech (Rei) - termina com Kaf, deve virar Kaf Sofit (ך)
    let palavra_com_sofit_raw = "מלכ"; // Melech com Kaf normal
    let formatada = format_hebrew_word(palavra_com_sofit_raw);
    println!("Palavra com Kaf normal: {}", palavra_com_sofit_raw.bright_red());
    println!("Formatada automática Sofit: {}", formatada.bright_green().bold());
    println!("Soma Gematria: {}", valor_palavra_hebraico(&formatada).to_string().bright_green().bold());
    println!();

    // 3. Testando Grego
    println!("{}", "------------- [ TESTE 3: ALFABETO GREGO ] ------------".bright_blue().bold());
    let palavra_grk = "ΘΕΟΣ"; // Theos (Deus)
    let valor_grk = valor_palavra_grega(palavra_grk);
    let regras_grk = regras_basicas_grego(palavra_grk, 2);

    println!("Palavra Grega: {}", palavra_grk.bright_white().bold());
    println!("Soma Gematria (9 + 5 + 70 + 200): {}", valor_grk.to_string().bright_green().bold());
    println!(
        "Validação Fonética Grega: {}",
        if regras_grk { "VÁLIDO".green() } else { "INVÁLIDO".red() }
    );
    println!();

    println!("{}", "=======================================================".bright_amber());
    println!("{}", "✨ SUCESSO: Fase 1 do motor em Rust compilada perfeitamente! ✨".bright_green().bold());
    println!("{}", "=======================================================".bright_amber());
}
