/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use super::alphabets::get_tabela_grega;
use std::collections::HashSet;

pub const VOGAIS_GREGAS: &str = "ΑΕΗΙΟΥΩ";

pub fn get_ditongos_gregos() -> HashSet<String> {
    let mut s = HashSet::new();
    let items = ["ΑΙ", "ΕΙ", "ΟΙ", "ΥΙ", "ΑΥ", "ΕΥ", "ΟΥ", "ΗΥ"];
    for x in items {
        s.insert(x.to_string());
    }
    s
}

/// Computes the Gematria value of a Greek word.
pub fn valor_palavra_grega(palavra: &str) -> u32 {
    let tabela = get_tabela_grega();
    let mut sum = 0;
    for c in palavra.chars() {
        if let Some(&val) = tabela.get(&c) {
            sum += val;
        }
    }
    sum
}

/// Checks the phonotactic and syllabic rules for Greek words.
pub fn regras_basicas_grego(palavra: &str, max_consonantes: u32) -> bool {
    // Exceptions (single words: οὐκ -> OYK, ἐκ -> EK, οὐχ -> OYX)
    let palavra_upper = palavra.to_uppercase();
    if palavra_upper == "ΟΥΚ" || palavra_upper == "ΕΚ" || palavra_upper == "ΟΥΧ" {
        return true;
    }

    let chars: Vec<char> = palavra_upper.chars().collect();
    let len = chars.len();
    if len == 0 {
        return false;
    }

    let ditongos = get_ditongos_gregos();
    let oclusivas = "ΠΒΦΚΓΧΤΔΘ";
    let liquida_nasal = "ΛΡΜΝ";
    let aspiradas = "ΦΧΘ";
    let dentais = "ΤΔΘ";

    // Rule 1: Terminação (Filtro Final de Strings)
    let ultimo = chars[len - 1];
    if !VOGAIS_GREGAS.contains(ultimo) {
        let finais_validas = "ΝΡΣΞΨ";
        if !finais_validas.contains(ultimo) {
            return false;
        }
    }

    // Rule 1B: Attack of the word (start of the word rules)
    if len >= 2 {
        let c1 = chars[0];
        let c2 = chars[1];
        let is_v1 = VOGAIS_GREGAS.contains(c1);
        let is_v2 = VOGAIS_GREGAS.contains(c2);

        // If word starts with two consonants:
        if !is_v1 && !is_v2 {
            // Líquida ou Nasal + Qualquer Consoante: If first is in Λ, Μ, Ν, Ρ, second must be a vowel
            if "ΛΜΝΡ".contains(c1) {
                return false;
            }

            // A "Lei do Rô Inicial" (ρ) - ΡΡ at the start is blocked
            if c1 == 'Ρ' && c2 == 'Ρ' {
                return false;
            }

            // Oclusiva + Oclusiva Incompatíveis
            if oclusivas.contains(c1) && oclusivas.contains(c2) {
                let start_cluster: String = [c1, c2].iter().collect();
                if start_cluster != "ΠΤ" && start_cluster != "ΚΤ" && start_cluster != "ΒΔ" {
                    return false;
                }
            }
        }
    }

    // Rule 1C: Coda silábica final: Encontro consonantal no final de palavra é 100% proibido.
    if len >= 2 {
        let last1 = chars[len - 1];
        let last2 = chars[len - 2];
        if !VOGAIS_GREGAS.contains(last1) && !VOGAIS_GREGAS.contains(last2) {
            return false;
        }
    }

    // Rule 2 & 3: Adjacency (Encontros Consonantais e Vocálicos)
    for i in 0..len.saturating_sub(1) {
        let c1 = chars[i];
        let c2 = chars[i + 1];

        let is_v1 = VOGAIS_GREGAS.contains(c1);
        let is_v2 = VOGAIS_GREGAS.contains(c2);

        if is_v1 && is_v2 {
            // Rule 3: Contraction (Encontros Vocálicos)
            // EE, EO, OE, OO, AE, AO must contract and are prohibited
            let pair: String = [c1, c2].iter().collect();
            if pair == "ΕΕ" || pair == "ΕΟ" || pair == "ΟΕ" || pair == "ΟΟ" || pair == "ΑΕ" || pair == "ΑΟ" {
                return false;
            }
        } else if !is_v1 && !is_v2 {
            // Rule 2: Restrições de Encontros Consonantais

            // Geminação / Duplicadas proibidas: only duplicate ΛΛ, ΜΜ, ΝΝ, ΠΠ, ΡΡ, ΣΣ, ΤΤ are allowed
            if c1 == c2 {
                let dup_allowed = "ΛΜΝΠΡΣΤ";
                if !dup_allowed.contains(c1) {
                    return false;
                }
            }

            // Qualquer par onde a primeira letra seja τ, δ, θ (DENTAIS) e a segunda seja outra consoante,
            // exceto se for líquida/nasal (Λ, Ρ, Μ, Ν)
            if dentais.contains(c1) && !liquida_nasal.contains(c2) {
                return false;
            }

            // Oclusivas iguais classes: Duas oclusivas diferentes da mesma classe não podem se tocar
            let labiais = "ΠΒΦ";
            let velars = "ΚΓΧ";
            if labiais.contains(c1) && labiais.contains(c2) && c1 != c2 {
                return false;
            }
            if velars.contains(c1) && velars.contains(c2) && c1 != c2 {
                // Exception: Gamma Nasal (γ antes de outra velar is nasal, so ΓΚ or ΓΧ are allowed)
                if !(c1 == 'Γ' && (c2 == 'Κ' || c2 == 'Χ')) {
                    return false;
                }
            }
            if dentais.contains(c1) && dentais.contains(c2) && c1 != c2 {
                return false;
            }

            // Bloqueio de Aspiradas: Duas consoantes aspiradas nunca ficam juntas (ΦΧΘ)
            if aspiradas.contains(c1) && aspiradas.contains(c2) {
                return false;
            }

            // Oclusiva + Líquida/Nasal: Só permitida se oclusiva vier antes: Liquid/Nasal followed by Oclusiva is forbidden
            if liquida_nasal.contains(c1) && oclusivas.contains(c2) {
                return false;
            }

            // Assimilação obrigatória: Se ocorrer o padrão não-assimilado, impede
            // Before Σ: Labials (ΠΒΦ)+Σ => Ψ, Velars (ΚΓΧ)+Σ => Ξ, Dentals (ΤΔΘ)+Σ => disappear
            if c2 == 'Σ' {
                if labiais.contains(c1) || velars.contains(c1) || "ΤΔΘΝ".contains(c1) {
                    return false;
                }
            }
            // Before Μ: Labials (ΠΒΦ)+Μ => ΜΜ, Velars (ΚΧ)+Μ => ΓΜ, Dentals (ΤΔΘ)+Μ => ΣΜ
            if c2 == 'Μ' {
                if labiais.contains(c1) || "ΚΧ".contains(c1) || dentais.contains(c1) {
                    return false;
                }
            }
        }

        // Sibilante Intervocálica (σ entre vogais)
        if i > 0 && i < len - 1 && chars[i] == 'Σ' {
            let is_prev_v = VOGAIS_GREGAS.contains(chars[i - 1]);
            let is_next_v = VOGAIS_GREGAS.contains(chars[i + 1]);
            if is_prev_v && is_next_v {
                return false;
            }
        }
    }

    // Rule 4: Estrutura Silábica - check syllable attack at start of word and consecutive consonant length
    let mut nuclei = Vec::new();
    let mut idx = 0;
    while idx < len {
        if VOGAIS_GREGAS.contains(chars[idx]) {
            if idx + 1 < len {
                let potential_ditongo: String = chars[idx..idx+2].iter().collect();
                if ditongos.contains(&potential_ditongo) {
                    nuclei.push((idx, idx + 1));
                    idx += 2;
                    continue;
                }
            }
            nuclei.push((idx, idx));
            idx += 1;
        } else {
            idx += 1;
        }
    }

    if nuclei.is_empty() {
        return false; // must contain at least one vowel/nucleus
    }

    // Attack check: consonants before first vowel
    let atk_len = nuclei[0].0;
    if atk_len > 3 {
        return false;
    }
    if atk_len == 3 {
        // First is Σ, second is Oclusiva, third is Líquida
        if chars[0] != 'Σ' {
            return false;
        }
        if !oclusivas.contains(chars[1]) {
            return false;
        }
        if !liquida_nasal.contains(chars[2]) {
            return false;
        }
    }

    // Max consecutive consonants limit
    let mut consecutive_consonants = 0;
    for &c in &chars {
        if !VOGAIS_GREGAS.contains(c) {
            consecutive_consonants += 1;
            if consecutive_consonants > max_consonantes {
                return false;
            }
        } else {
            consecutive_consonants = 0;
        }
    }

    // Max 3 consecutive vowels limit, and never 3 identical consecutive vowels
    let mut consecutive_vowels_count = 0;
    for &c in &chars {
        if VOGAIS_GREGAS.contains(c) {
            consecutive_vowels_count += 1;
            if consecutive_vowels_count > 3 {
                return false;
            }
        } else {
            consecutive_vowels_count = 0;
        }
    }

    for i in 0..len.saturating_sub(2) {
        let c1 = chars[i];
        let c2 = chars[i + 1];
        let c3 = chars[i + 2];
        if VOGAIS_GREGAS.contains(c1) && c1 == c2 && c2 == c3 {
            return false;
        }
    }

    true
}
