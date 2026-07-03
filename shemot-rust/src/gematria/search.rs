/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use std::collections::HashSet;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use super::alphabets::{
    get_tabela_hebraica, get_tabela_grega, get_pares_permitidos,
    get_pares_iniciais_permitidos, VOGAIS_LATINO,
};
use super::rules_latin::{
    regras_basicas_latino, regras_foneticas_latino, apply_estilo,
    apply_filtro_avancado, LatinoEstilo, LatinoAvancado, valor_palavra_latino,
};
use super::rules_greek::{regras_basicas_grego, VOGAIS_GREGAS};
use super::rules_hebrew::{format_hebrew_word, get_transliter_hebraica};

/// Real-time phonetic and stylistic pruning check during Latino backtracking.
pub fn can_proceed_latino_in_dfs(
    partial_word: &[char],
    use_estilo: bool,
    estilo: &LatinoEstilo,
    use_avancado: bool,
    avancado: &LatinoAvancado,
) -> bool {
    let len = partial_word.len();
    if len == 0 {
        return true;
    }

    // 1. Basic rules: no 3 consecutive identical letters
    if len >= 3 {
        if partial_word[len - 1] == partial_word[len - 2]
            && partial_word[len - 2] == partial_word[len - 3]
        {
            return false;
        }
    }

    // 2. Basic rules: twin letters are only allowed for RR or SS
    if len >= 2 {
        if partial_word[len - 1] == partial_word[len - 2] {
            let twin: String = [partial_word[len - 2], partial_word[len - 1]]
                .iter()
                .collect();
            if twin != "RR" && twin != "SS" {
                return false;
            }
            // Flank vowel on the left
            if len >= 3 && !VOGAIS_LATINO.contains(partial_word[len - 3]) {
                return false;
            }
        }
    }

    // 3. Phonetic rules: no more than 2 consecutive consonants
    if len >= 3 {
        let is_c3 = !VOGAIS_LATINO.contains(partial_word[len - 3]);
        let is_c2 = !VOGAIS_LATINO.contains(partial_word[len - 2]);
        let is_c1 = !VOGAIS_LATINO.contains(partial_word[len - 1]);
        if is_c3 && is_c2 && is_c1 {
            return false;
        }
    }

    // 4. Phonetic rules: adjacent consonants are only allowed if in PARES_PERMITIDOS
    if len >= 2 {
        let is_c2 = !VOGAIS_LATINO.contains(partial_word[len - 2]);
        let is_c1 = !VOGAIS_LATINO.contains(partial_word[len - 1]);
        if is_c2 && is_c1 {
            let pair: String = [partial_word[len - 2], partial_word[len - 1]]
                .iter()
                .collect();
            let pares_permitidos = get_pares_permitidos();
            if !pares_permitidos.contains(&pair) {
                return false;
            }
        }
    }

    // 5. Stylistic rules: max consecutive vowels in use_estilo
    if use_estilo && len >= (estilo.max_v_seq as usize + 1) {
        let mut all_vowels = true;
        for k in 1..=(estilo.max_v_seq as usize + 1) {
            if !VOGAIS_LATINO.contains(partial_word[len - k]) {
                all_vowels = false;
                break;
            }
        }
        if all_vowels {
            return false;
        }
    }

    // 6. Advanced rules: start with consonant
    if use_avancado && avancado.iniciar_com_consoante {
        if VOGAIS_LATINO.contains(partial_word[0]) {
            return false;
        }
    }

    // 7. Advanced rules: restrict initial consonant cluster if first two letters are consonants
    if use_avancado && avancado.restringir_inicio_consonantal && len >= 2 {
        let c0 = !VOGAIS_LATINO.contains(partial_word[0]);
        let c1 = !VOGAIS_LATINO.contains(partial_word[1]);
        if c0 && c1 {
            let first_pair: String = [partial_word[0], partial_word[1]].iter().collect();
            let pares_iniciais = get_pares_iniciais_permitidos();
            if !pares_iniciais.contains(&first_pair) {
                return false;
            }
        }
    }

    true
}

/// Specifications for locked positions and wildcards inside custom searches.
#[derive(Debug, Clone)]
pub struct WildcardSpec {
    pub char: char,
    pub min_idx: usize,
    pub max_idx: usize,
}

/// Internal recursive helper for wildcards matching.
fn matches_wildcards(
    word_chars: &[char],
    specs: &[WildcardSpec],
    fixas: &std::collections::HashMap<usize, char>,
    spec_idx: usize,
    last_word_idx: i32,
) -> bool {
    if spec_idx == specs.len() {
        return true;
    }

    let spec = &specs[spec_idx];
    let start = std::cmp::max(last_word_idx + 1, spec.min_idx as i32) as usize;
    let end = spec.max_idx;

    for i in start..=end {
        if fixas.contains_key(&i) {
            continue; // Must be a free position
        }
        if i < word_chars.len() && word_chars[i] == spec.char {
            if matches_wildcards(word_chars, specs, fixas, spec_idx + 1, i as i32) {
                return true;
            }
        }
    }
    false
}

/// Backtracking search engine for Latino Alphabet under Etimologico mode.
pub fn backtrack_latino_etimologico(
    target_value: u32,
    total_length: usize,
    prefix: &str,
    suffix: &str,
    radical: &str,
    modo_radical: &str, // "fixed" or "palindrome"
    use_estilo: bool,
    estilo: &LatinoEstilo,
    use_avancado: bool,
    avancado: &LatinoAvancado,
    cancel_flag: Arc<AtomicBool>,
    on_iteration: &mut dyn FnMut(u64, usize), // (tested_count, found_count)
) -> Vec<String> {
    let mut results = Vec::new();
    let mut found_set = HashSet::new();
    let mut tested_count: u64 = 0;

    let pfx = prefix.to_uppercase();
    let sfx = suffix.to_uppercase();
    let rad = radical.to_uppercase();

    let pfx_val = valor_palavra_latino(&pfx);
    let sfx_val = valor_palavra_latino(&sfx);
    let rad_val = valor_palavra_latino(&rad);
    let fixo_val = pfx_val + sfx_val + rad_val;

    let is_pal = modo_radical == "palindrome";
    let mut letras_livres = total_length as i32 - pfx.len() as i32 - sfx.len() as i32 - rad.len() as i32;
    if is_pal {
        letras_livres = (total_length as i32 - rad.len() as i32) / 2;
    }

    if letras_livres < 0 {
        return vec!["Erro: O tamanho das partes físicas inseridas excede o tamanho total da palavra!".to_string()];
    }

    let target_meio_val;
    if is_pal {
        if target_value < rad_val || (target_value - rad_val) % 2 != 0 {
            return results;
        }
        target_meio_val = (target_value - rad_val) / 2;
    } else {
        if target_value < fixo_val {
            return results;
        }
        target_meio_val = target_value - fixo_val;
    }

    let letras_livres = letras_livres as usize;
    let alfabeto: Vec<char> = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".chars().collect();

    let mut current_meio = vec![' '; letras_livres];

    // Helper closure / recursive backtrack
    fn dfs(
        idx: usize,
        soma_atual: u32,
        current_meio: &mut [char],
        letras_livres: usize,
        target_meio_val: u32,
        is_pal: bool,
        pfx: &str,
        rad: &str,
        sfx: &str,
        total_length: usize,
        target_value: u32,
        use_estilo: bool,
        estilo: &LatinoEstilo,
        use_avancado: bool,
        avancado: &LatinoAvancado,
        alfabeto: &[char],
        cancel_flag: &AtomicBool,
        tested_count: &mut u64,
        found_set: &mut HashSet<String>,
        results: &mut Vec<String>,
        on_iteration: &mut dyn FnMut(u64, usize),
    ) {
        if cancel_flag.load(Ordering::Relaxed) {
            return;
        }

        if idx == letras_livres {
            *tested_count += 1;

            let meio_join: String = current_meio.iter().collect();
            let palavra_completa = if is_pal {
                let meio_invertido: String = current_meio.iter().rev().collect();
                format!("{}{}{}", meio_join, rad, meio_invertido)
            } else {
                format!("{}{}{}{}", pfx, rad, meio_join, sfx)
            };

            if palavra_completa.len() == total_length && valor_palavra_latino(&palavra_completa) == target_value {
                if regras_basicas_latino(&palavra_completa) && regras_foneticas_latino(&palavra_completa) {
                    if apply_estilo(&palavra_completa, use_estilo, estilo)
                        && apply_filtro_avancado(&palavra_completa, use_avancado, avancado)
                    {
                        if !found_set.contains(&palavra_completa) {
                            found_set.insert(palavra_completa.clone());
                            results.push(palavra_completa);
                        }
                    }
                }
            }

            if *tested_count % 50000 == 0 {
                on_iteration(*tested_count, results.len());
            }
            return;
        }

        // Gematria weight pruning
        let faltam = (letras_livres - idx) as u32;
        if soma_atual + (faltam * 1) > target_meio_val || soma_atual + (faltam * 26) < target_meio_val {
            return;
        }

        // Live phonetic pruning
        if idx > 0 {
            let mut partial = Vec::new();
            if !is_pal {
                partial.extend(pfx.chars());
                partial.extend(rad.chars());
                partial.extend_from_slice(&current_meio[..idx]);
            } else {
                partial.extend_from_slice(&current_meio[..idx]);
            }

            if !can_proceed_latino_in_dfs(&partial, use_estilo, estilo, use_avancado, avancado) {
                return;
            }
        }

        for &letter in alfabeto {
            let weight = (letter as u32 - 'A' as u32) + 1;
            current_meio[idx] = letter;
            dfs(
                idx + 1,
                soma_atual + weight,
                current_meio,
                letras_livres,
                target_meio_val,
                is_pal,
                pfx,
                rad,
                sfx,
                total_length,
                target_value,
                use_estilo,
                estilo,
                use_avancado,
                avancado,
                alfabeto,
                cancel_flag,
                tested_count,
                found_set,
                results,
                on_iteration,
            );
        }
    }

    if letras_livres > 0 {
        for &letter in &alfabeto {
            if cancel_flag.load(Ordering::Relaxed) {
                break;
            }
            let weight = (letter as u32 - 'A' as u32) + 1;
            current_meio[0] = letter;

            dfs(
                1,
                weight,
                &mut current_meio,
                letras_livres,
                target_meio_val,
                is_pal,
                &pfx,
                &rad,
                &sfx,
                total_length,
                target_value,
                use_estilo,
                estilo,
                use_avancado,
                avancado,
                &alfabeto,
                &cancel_flag,
                &mut tested_count,
                &mut found_set,
                &mut results,
                on_iteration,
            );
            on_iteration(tested_count, results.len());
        }
    } else {
        dfs(
            0,
            0,
            &mut current_meio,
            letras_livres,
            target_meio_val,
            is_pal,
            &pfx,
            &rad,
            &sfx,
            total_length,
            target_value,
            use_estilo,
            estilo,
            use_avancado,
            avancado,
            &alfabeto,
            &cancel_flag,
            &mut tested_count,
            &mut found_set,
            &mut results,
            on_iteration,
        );
    }

    on_iteration(tested_count, results.len());
    results
}

/// Backtracking search engine for Latino Alphabet under Customizable structure.
pub fn backtrack_latino_custom(
    target_value: u32,
    total_length: usize,
    fixas: &std::collections::HashMap<usize, char>,
    wildcards: &[WildcardSpec],
    use_estilo: bool,
    estilo: &LatinoEstilo,
    use_avancado: bool,
    avancado: &LatinoAvancado,
    cancel_flag: Arc<AtomicBool>,
    on_iteration: &mut dyn FnMut(u64, usize),
) -> Vec<String> {
    let mut results = Vec::new();
    let mut found_set = HashSet::new();
    let mut tested_count: u64 = 0;

    let alfabeto: Vec<char> = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".chars().collect();
    let mut current_word = vec![' '; total_length];

    // Helper template for fast lookups
    let mut pal_template = vec!['\0'; total_length];
    for (&pos, &ch) in fixas {
        if pos < total_length {
            pal_template[pos] = ch;
        }
    }

    fn dfs_custom(
        idx: usize,
        soma_atual: u32,
        current_word: &mut [char],
        total_length: usize,
        target_value: u32,
        pal_template: &[char],
        fixas: &std::collections::HashMap<usize, char>,
        wildcards: &[WildcardSpec],
        use_estilo: bool,
        estilo: &LatinoEstilo,
        use_avancado: bool,
        avancado: &LatinoAvancado,
        alfabeto: &[char],
        cancel_flag: &AtomicBool,
        tested_count: &mut u64,
        found_set: &mut HashSet<String>,
        results: &mut Vec<String>,
        on_iteration: &mut dyn FnMut(u64, usize),
    ) {
        if cancel_flag.load(Ordering::Relaxed) {
            return;
        }

        if idx == total_length {
            *tested_count += 1;

            let palavra_completa: String = current_word.iter().collect();
            if soma_atual == target_value && regras_basicas_latino(&palavra_completa) {
                if regras_foneticas_latino(&palavra_completa) {
                    if apply_estilo(&palavra_completa, use_estilo, estilo)
                        && apply_filtro_avancado(&palavra_completa, use_avancado, avancado)
                    {
                        if matches_wildcards(current_word, wildcards, fixas, 0, -1) {
                            if !found_set.contains(&palavra_completa) {
                                found_set.insert(palavra_completa.clone());
                                results.push(palavra_completa);
                            }
                        }
                    }
                }
            }

            if *tested_count % 50000 == 0 {
                on_iteration(*tested_count, results.len());
            }
            return;
        }

        // Pruning weights
        let letras_faltantes = (total_length - idx) as u32;
        if soma_atual + (letras_faltantes * 1) > target_value || soma_atual + (letras_faltantes * 26) < target_value {
            return;
        }

        // Live phonetic pruning
        if idx > 0 {
            let partial = &current_word[..idx];
            if !can_proceed_latino_in_dfs(partial, use_estilo, estilo, use_avancado, avancado) {
                return;
            }
        }

        let locked_char = pal_template[idx];
        if locked_char != '\0' {
            let weight = (locked_char as u32 - 'A' as u32) + 1;
            current_word[idx] = locked_char;
            dfs_custom(
                idx + 1,
                soma_atual + weight,
                current_word,
                total_length,
                target_value,
                pal_template,
                fixas,
                wildcards,
                use_estilo,
                estilo,
                use_avancado,
                avancado,
                alfabeto,
                cancel_flag,
                tested_count,
                found_set,
                results,
                on_iteration,
            );
        } else {
            for &letter in alfabeto {
                let weight = (letter as u32 - 'A' as u32) + 1;
                current_word[idx] = letter;
                dfs_custom(
                    idx + 1,
                    soma_atual + weight,
                    current_word,
                    total_length,
                    target_value,
                    pal_template,
                    fixas,
                    wildcards,
                    use_estilo,
                    estilo,
                    use_avancado,
                    avancado,
                    alfabeto,
                    cancel_flag,
                    tested_count,
                    found_set,
                    results,
                    on_iteration,
                );
            }
            current_word[idx] = ' ';
        }
    }

    if total_length > 0 {
        let first_letter_template = pal_template[0];
        let candidates = if first_letter_template != '\0' {
            vec![first_letter_template]
        } else {
            alfabeto.clone()
        };

        for &letter in &candidates {
            if cancel_flag.load(Ordering::Relaxed) {
                break;
            }
            let weight = (letter as u32 - 'A' as u32) + 1;
            current_word[0] = letter;

            dfs_custom(
                1,
                weight,
                &mut current_word,
                total_length,
                target_value,
                &pal_template,
                fixas,
                wildcards,
                use_estilo,
                estilo,
                use_avancado,
                avancado,
                &alfabeto,
                &cancel_flag,
                &mut tested_count,
                &mut found_set,
                &mut results,
                on_iteration,
            );
            on_iteration(tested_count, results.len());
        }
    }

    on_iteration(tested_count, results.len());
    results
}

/// Backtracking search engine for Hebrew Gematria.
pub fn backtrack_hebraico(
    target_value: u32,
    total_length: usize,
    use_regras: bool,
    cancel_flag: Arc<AtomicBool>,
    on_iteration: &mut dyn FnMut(u64, usize),
) -> Vec<String> {
    let mut results = Vec::new();
    let mut found_set = HashSet::new();
    let mut tested_count: u64 = 0;

    let tabela = get_tabela_hebraica();
    let keys: Vec<char> = "אבגדהוזחטיכלמנסעפצקרשת".chars().collect();
    let translit_map = get_transliter_hebraica();

    let mut current_combi = Vec::with_capacity(total_length);

    fn dfs_hebrew(
        combi: &mut Vec<char>,
        soma_atual: u32,
        total_length: usize,
        target_value: u32,
        use_regras: bool,
        keys: &[char],
        tabela: &std::collections::HashMap<char, u32>,
        translit_map: &std::collections::HashMap<char, &'static str>,
        cancel_flag: &AtomicBool,
        tested_count: &mut u64,
        found_set: &mut HashSet<String>,
        results: &mut Vec<String>,
        on_iteration: &mut dyn FnMut(u64, usize),
    ) {
        if cancel_flag.load(Ordering::Relaxed) {
            return;
        }

        if combi.len() == total_length {
            *tested_count += 1;

            if soma_atual == target_value {
                let palavra_crua: String = combi.iter().collect();
                let palavra_formatada = format_hebrew_word(&palavra_crua);

                let mut is_valid = true;
                if use_regras {
                    // Hebrew rules implementation:
                    // 1. Alef, He, Ayin, Het, Resh cannot be duplicated
                    // 2. Vav Conjuntivo (ו) followed by labials (ב, מ, פ) is invalid
                    let chars: Vec<char> = palavra_formatada.chars().collect();
                    let len = chars.len();
                    for i in 0..len.saturating_sub(1) {
                        if chars[i] == chars[i + 1] {
                            if "אהעחר".contains(chars[i]) {
                                is_valid = false;
                                break;
                            }
                        }
                    }
                    if len >= 2 && chars[0] == 'ו' && "במפ".contains(chars[1]) {
                        is_valid = false;
                    }
                }

                if is_valid {
                    let translit: String = palavra_formatada
                        .chars()
                        .map(|c| translit_map.get(&c).copied().unwrap_or(""))
                        .collect();
                    let key_word = format!("{} ({})", palavra_formatada, translit);
                    if !found_set.contains(&key_word) {
                        found_set.insert(key_word.clone());
                        results.push(key_word);
                    }
                }
            }

            if *tested_count % 50000 == 0 {
                on_iteration(*tested_count, results.len());
            }
            return;
        }

        // Weight pruning
        let faltantes = (total_length - combi.len()) as u32;
        if soma_atual + (faltantes * 1) > target_value || soma_atual + (faltantes * 400) < target_value {
            return;
        }

        for &ch in keys {
            let &val = tabela.get(&ch).unwrap_or(&0);
            combi.push(ch);
            dfs_hebrew(
                combi,
                soma_atual + val,
                total_length,
                target_value,
                use_regras,
                keys,
                tabela,
                translit_map,
                cancel_flag,
                tested_count,
                found_set,
                results,
                on_iteration,
            );
            combi.pop();
        }
    }

    if total_length > 0 {
        for &ch in &keys {
            if cancel_flag.load(Ordering::Relaxed) {
                break;
            }
            let &val = tabela.get(&ch).unwrap_or(&0);
            current_combi.push(ch);

            dfs_hebrew(
                &mut current_combi,
                val,
                total_length,
                target_value,
                use_regras,
                &keys,
                &tabela,
                &translit_map,
                &cancel_flag,
                &mut tested_count,
                &mut found_set,
                &mut results,
                on_iteration,
            );

            current_combi.pop();
            on_iteration(tested_count, results.len());
        }
    }

    on_iteration(tested_count, results.len());
    results
}

/// Helper function to check consecutive consonants in a Greek string.
fn excesso_consoantes_grego(pal: &str, max: u32) -> bool {
    let mut consecutivas = 0;
    for c in pal.chars() {
        if VOGAIS_GREGAS.contains(c) {
            consecutivas = 0;
        } else {
            consecutivas += 1;
            if consecutivas > max {
                return true;
            }
        }
    }
    false
}

/// Backtracking search engine for Greek Isopsefia.
pub fn backtrack_grego(
    target_value: u32,
    total_length: usize,
    use_finais: bool,
    use_inicios_proibidos: bool,
    greek_max_consonantes: u32,
    use_koine_filter: bool,
    cancel_flag: Arc<AtomicBool>,
    on_iteration: &mut dyn FnMut(u64, usize),
) -> Vec<String> {
    let mut results = Vec::new();
    let mut found_set = HashSet::new();
    let mut tested_count: u64 = 0;

    let tabela = get_tabela_grega();
    // Letters to test (ordered alphabetically or standard)
    let keys: Vec<char> = "ΑΒΓΔΕϚΖΗΘΙΚΛΜΝΞΟΠϘΡΣΤΥΦΧΨΩϠ".chars().collect();

    // Mapping for transliteration
    let mut translit_map = std::collections::HashMap::new();
    let gr_trans = [
        ('Α', "A"), ('Β', "B"), ('Γ', "G"), ('Δ', "D"), ('Ε', "E"), ('Ϛ', "ST"), ('Ζ', "Z"), ('Η', "E"), ('Θ', "TH"),
        ('Ι', "I"), ('Κ', "K"), ('Λ', "L"), ('Μ', "M"), ('Ν', "N"), ('Ξ', "X"), ('Ο', "O"), ('Π', "P"), ('Ϙ', "Q"),
        ('Ρ', "R"), ('Σ', "S"), ('Τ', "T"), ('Υ', "Y"), ('Φ', "PH"), ('Χ', "CH"), ('Ψ', "PS"), ('Ω', "O"), ('Ϡ', "TS")
    ];
    for (g, t) in gr_trans {
        translit_map.insert(g, t);
    }

    let finais_validas = "ΝΡΣΞΨ";
    let inicios_proibidos = vec!["ΒΓ", "ΒΔ", "ΚΘ", "ΤΚ", "ΔΧ", "ΓΘ"];

    let mut current_combi = Vec::with_capacity(total_length);

    fn dfs_greek(
        combi: &mut Vec<char>,
        soma_atual: u32,
        total_length: usize,
        target_value: u32,
        use_finais: bool,
        use_inicios_proibidos: bool,
        greek_max_consonantes: u32,
        use_koine_filter: bool,
        finais_validas: &str,
        inicios_proibidos: &[&str],
        keys: &[char],
        tabela: &std::collections::HashMap<char, u32>,
        translit_map: &std::collections::HashMap<char, &'static str>,
        cancel_flag: &AtomicBool,
        tested_count: &mut u64,
        found_set: &mut HashSet<String>,
        results: &mut Vec<String>,
        on_iteration: &mut dyn FnMut(u64, usize),
    ) {
        if cancel_flag.load(Ordering::Relaxed) {
            return;
        }

        if combi.len() == total_length {
            *tested_count += 1;

            if soma_atual == target_value {
                let palavra_completa: String = combi.iter().collect();

                let mut is_valid = true;
                if use_finais {
                    if let Some(u) = palavra_completa.chars().last() {
                        if !finais_validas.contains(u) && !VOGAIS_GREGAS.contains(u) {
                            is_valid = false;
                        }
                    }
                }

                if is_valid && use_inicios_proibidos && palavra_completa.len() >= 2 {
                    let init = &palavra_completa[0..2];
                    if inicios_proibidos.contains(&init) {
                        is_valid = false;
                    }
                }

                if is_valid && excesso_consoantes_grego(&palavra_completa, greek_max_consonantes) {
                    is_valid = false;
                }

                if is_valid && use_koine_filter {
                    if !regras_basicas_grego(&palavra_completa, greek_max_consonantes) {
                        is_valid = false;
                    }
                }

                if is_valid {
                    let translit: String = palavra_completa
                        .chars()
                        .map(|c| translit_map.get(&c).copied().unwrap_or(""))
                        .collect();
                    let key_word = format!("{} ({})", palavra_completa, translit);
                    if !found_set.contains(&key_word) {
                        found_set.insert(key_word.clone());
                        results.push(key_word);
                    }
                }
            }

            if *tested_count % 50000 == 0 {
                on_iteration(*tested_count, results.len());
            }
            return;
        }

        // Weight pruning
        let faltantes = (total_length - combi.len()) as u32;
        if soma_atual + (faltantes * 1) > target_value || soma_atual + (faltantes * 900) < target_value {
            return;
        }

        for &ch in keys {
            let &val = tabela.get(&ch).unwrap_or(&0);
            combi.push(ch);
            dfs_greek(
                combi,
                soma_atual + val,
                total_length,
                target_value,
                use_finais,
                use_inicios_proibidos,
                greek_max_consonantes,
                use_koine_filter,
                finais_validas,
                inicios_proibidos,
                keys,
                tabela,
                translit_map,
                cancel_flag,
                tested_count,
                found_set,
                results,
                on_iteration,
            );
            combi.pop();
        }
    }

    if total_length > 0 {
        for &ch in &keys {
            if cancel_flag.load(Ordering::Relaxed) {
                break;
            }
            let &val = tabela.get(&ch).unwrap_or(&0);
            current_combi.push(ch);

            dfs_greek(
                &mut current_combi,
                val,
                total_length,
                target_value,
                use_finais,
                use_inicios_proibidos,
                greek_max_consonantes,
                use_koine_filter,
                finais_validas,
                &inicios_proibidos,
                &keys,
                &tabela,
                &translit_map,
                &cancel_flag,
                &mut tested_count,
                &mut found_set,
                &mut results,
                on_iteration,
            );

            current_combi.pop();
            on_iteration(tested_count, results.len());
        }
    }

    on_iteration(tested_count, results.len());
    results
}
