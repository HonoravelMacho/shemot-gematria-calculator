/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use super::alphabets::get_tabela_hebraica;
use std::collections::HashMap;

/// Maps a standard Hebrew letter to its Sofit (final) version.
pub fn get_map_sofit() -> HashMap<char, char> {
    let mut m = HashMap::new();
    m.insert('כ', 'ך');
    m.insert('מ', 'ם');
    m.insert('נ', 'ן');
    m.insert('פ', 'ף');
    m.insert('צ', 'ץ');
    m
}

/// Translates Hebrew characters into Latin transliterated capitals.
pub fn get_transliter_hebraica() -> HashMap<char, &'static str> {
    let mut m = HashMap::new();
    m.insert('א', "A");  m.insert('ב', "B");  m.insert('ג', "G");
    m.insert('ד', "D");  m.insert('ה', "H");  m.insert('ו', "V");
    m.insert('ז', "Z");  m.insert('ח', "CH"); m.insert('ט', "T");
    m.insert('י', "Y");  m.insert('כ', "K");  m.insert('ך', "K");
    m.insert('ל', "L");  m.insert('מ', "M");  m.insert('ם', "M");
    m.insert('נ', "N");  m.insert('ן', "N");  m.insert('ס', "S");
    m.insert('ע', "A");  m.insert('פ', "P");  m.insert('ף', "P");
    m.insert('צ', "TZ"); m.insert('ץ', "TZ"); m.insert('ק', "Q");
    m.insert('ר', "R");  m.insert('ש', "SH"); m.insert('ת', "T");
    m
}

/// Computes the Gematria value of a Hebrew word.
pub fn valor_palavra_hebraico(palavra: &str) -> u32 {
    let tabela = get_tabela_hebraica();
    let mut sum = 0;
    for c in palavra.chars() {
        if let Some(&val) = tabela.get(&c) {
            sum += val;
        }
    }
    sum
}

/// Formats a Hebrew word, replacing its last character with its Sofit (final) form if applicable.
pub fn format_hebrew_word(palavra: &str) -> String {
    if palavra.is_empty() {
        return String::new();
    }
    let map_sofit = get_map_sofit();
    let mut chars: Vec<char> = palavra.chars().collect();
    let last_idx = chars.len() - 1;
    let ultimo_char = chars[last_idx];

    if let Some(&sofit_char) = map_sofit.get(&ultimo_char) {
        chars[last_idx] = sofit_char;
    }
    chars.into_iter().collect()
}
