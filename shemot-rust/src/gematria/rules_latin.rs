/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use super::alphabets::{valor_letra_latino, VOGAIS_LATINO, get_pares_permitidos, get_pares_iniciais_permitidos};
use std::collections::HashSet;

#[derive(Debug, Clone)]
pub struct LatinoEstilo {
    pub min_v: u32,
    pub max_v: u32,
    pub min_c: u32,
    pub max_c: u32,
    pub max_v_seq: u32,
}

#[derive(Debug, Clone)]
pub struct LatinoAvancado {
    pub iniciar_com_consoante: bool,
    pub terminar_com_vogal: bool,
    pub permitir_k: bool,
    pub permitir_w: bool,
    pub permitir_y: bool,
    pub restringir_finais: bool,
    pub permitir_finais_estrangeiros: bool,
    pub restringir_inicio_consonantal: bool,
}

/// Computes the Gematria value of a Latin word.
pub fn valor_palavra_latino(palavra: &str) -> u32 {
    let mut sum = 0;
    for c in palavra.chars() {
        sum += valor_letra_latino(c);
    }
    sum
}

/// Checks the basic Latin syllabic and duplicate character rules.
pub fn regras_basicas_latino(palavra: &str) -> bool {
    let chars: Vec<char> = palavra.to_uppercase().chars().collect();
    let len = chars.len();

    if len == 0 {
        return false;
    }

    // 1. Sem 3 consecutivas idênticas
    for i in 0..len.saturating_sub(2) {
        if chars[i] == chars[i + 1] && chars[i + 1] == chars[i + 2] {
            return false;
        }
    }

    // 2. RR e SS regras auxiliares
    for i in 0..len.saturating_sub(1) {
        if chars[i] == chars[i + 1] {
            let par: String = chars[i..i+2].iter().collect();
            if par != "RR" && par != "SS" {
                return false;
            }
            if i == 0 || i == len - 2 {
                return false;
            }
            // Safe indices due to boundaries checked above
            let prev = chars[i - 1];
            let next = chars[i + 2];
            if !VOGAIS_LATINO.contains(prev) || !VOGAIS_LATINO.contains(next) {
                return false;
            }
        }
    }

    true
}

/// Checks phonetic acceptability of a Latin word (consonant strings, clusters, GU/QU rules).
pub fn regras_foneticas_latino(palavra: &str) -> bool {
    let chars: Vec<char> = palavra.to_uppercase().chars().collect();
    let len = chars.len();

    if len == 0 {
        return false;
    }

    // Pelo menos uma vogal
    let mut tem_vogal = false;
    for &c in &chars {
        if VOGAIS_LATINO.contains(c) {
            tem_vogal = true;
            break;
        }
    }
    if !tem_vogal {
        return false;
    }

    // Consoantes consecutivas limites
    let mut consecutivas = 0;
    for &c in &chars {
        if !VOGAIS_LATINO.contains(c) {
            consecutivas += 1;
            if consecutivas > 2 {
                return false;
            }
        } else {
            consecutivas = 0;
        }
    }

    // Verificar pares permitidos
    let pares_permitidos = get_pares_permitidos();
    for i in 0..len.saturating_sub(1) {
        let atual = chars[i];
        let prox = chars[i + 1];
        if !VOGAIS_LATINO.contains(atual) && !VOGAIS_LATINO.contains(prox) {
            let par: String = [atual, prox].iter().collect();
            if !pares_permitidos.contains(&par) {
                return false;
            }
        }
    }

    // QU & GU regras
    for i in 0..len.saturating_sub(1) {
        let slice: String = chars[i..i+2].iter().collect();
        if slice == "QU" || slice == "GU" {
            if i + 2 >= len {
                return false;
            }
            if !VOGAIS_LATINO.contains(chars[i + 2]) {
                return false;
            }
        }
    }

    true
}

/// Applies style limits like vowel and consonant quantity boundaries.
pub fn apply_estilo(palavra: &str, use_estilo: bool, estilo: &LatinoEstilo) -> bool {
    if !use_estilo {
        return true;
    }

    let chars: Vec<char> = palavra.to_uppercase().chars().collect();
    let mut v_c = 0;
    for &c in &chars {
        if VOGAIS_LATINO.contains(c) {
            v_c += 1;
        }
    }
    let c_c = chars.len() as u32 - v_c;

    if v_c < estilo.min_v || v_c > estilo.max_v {
        return false;
    }
    if c_c < estilo.min_c || c_c > estilo.max_c {
        return false;
    }

    let mut sv = 0;
    for &c in &chars {
        if VOGAIS_LATINO.contains(c) {
            sv += 1;
            if sv > estilo.max_v_seq {
                return false;
            }
        } else {
            sv = 0;
        }
    }

    true
}

/// Applies advanced letter constraints and starting rules.
pub fn apply_filtro_avancado(palavra: &str, use_avancado: bool, avancado: &LatinoAvancado) -> bool {
    if !use_avancado {
        return true;
    }

    let chars: Vec<char> = palavra.to_uppercase().chars().collect();
    let len = chars.len();
    if len == 0 {
        return false;
    }

    if avancado.iniciar_com_consoante && VOGAIS_LATINO.contains(chars[0]) {
        return false;
    }
    if avancado.terminar_com_vogal && !VOGAIS_LATINO.contains(chars[len - 1]) {
        return false;
    }

    if !avancado.permitir_k && palavra.to_uppercase().contains('K') {
        return false;
    }
    if !avancado.permitir_w && palavra.to_uppercase().contains('W') {
        return false;
    }
    if !avancado.permitir_y && palavra.to_uppercase().contains('Y') {
        return false;
    }

    if avancado.restringir_inicio_consonantal && len >= 2 {
        if !VOGAIS_LATINO.contains(chars[0]) && !VOGAIS_LATINO.contains(chars[1]) {
            let par_inicial: String = chars[0..2].iter().collect();
            let pares_iniciais_permitidos = get_pares_iniciais_permitidos();
            if !pares_iniciais_permitidos.contains(&par_inicial) {
                return false;
            }
        }
    }

    if avancado.restringir_finais {
        let ultima = chars[len - 1];
        if !VOGAIS_LATINO.contains(ultima) {
            let mut permitidas = HashSet::new();
            permitidas.insert('R');
            permitidas.insert('S');
            permitidas.insert('L');
            permitidas.insert('M');
            if avancado.permitir_finais_estrangeiros {
                permitidas.insert('Z');
                permitidas.insert('X');
                permitidas.insert('N');
                permitidas.insert('K');
            }
            if !permitidas.contains(&ultima) {
                return false;
            }
        }
    }

    true
}
