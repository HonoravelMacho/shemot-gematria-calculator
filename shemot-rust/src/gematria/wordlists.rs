/*
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Wordlists da comunidade (ver dictionaries/README.md).
 * O build.rs embute cada wordlist do registry via include_str!;
 * este módulo normaliza (igual ao TS em dictLoader.ts) e expõe
 * consultas O(1) via HashSet com cache em OnceLock.
 */

// Gerado pelo build.rs a partir de dictionaries/registry.json.
include!(concat!(env!("OUT_DIR"), "/wordlists_registry.rs"));
use std::collections::{HashMap, HashSet};
use std::sync::OnceLock;

static SETS: OnceLock<HashMap<&'static str, HashSet<String>>> = OnceLock::new();

fn strip_latin_precomposed(c: char) -> Option<char> {
    // Equivalente ao NFD + remoção de \u0300-\u036f do TS para o alfabeto latino:
    // decompõe manualmente as pré-compostas com diacrítico; o resto passa
    // por lowercase intacto (ex.: ß, æ, ø ficam como estão, igual no TS).
    let base = match c {
        'à' | 'á' | 'â' | 'ã' | 'ä' | 'å' | 'ā' | 'ă' | 'ą' | 'ǎ' | 'ȁ' | 'ȃ' => 'a',
        'è' | 'é' | 'ê' | 'ë' | 'ē' | 'ĕ' | 'ė' | 'ę' | 'ě' | 'ȅ' | 'ȇ' => 'e',
        'ì' | 'í' | 'î' | 'ï' | 'ĩ' | 'ī' | 'ĭ' | 'į' | 'ǐ' | 'ȉ' | 'ȋ' => 'i',
        'ò' | 'ó' | 'ô' | 'õ' | 'ö' | 'ø' | 'ō' | 'ŏ' | 'ő' | 'ǒ' | 'ȍ' | 'ȏ'
        | 'ọ' | 'ỏ' | 'ố' | 'ồ' | 'ổ' | 'ỗ' | 'ộ' | 'ớ' | 'ờ' | 'ở' | 'ỡ' | 'ợ' => 'o',
        'ù' | 'ú' | 'û' | 'ü' | 'ũ' | 'ū' | 'ŭ' | 'ů' | 'ű' | 'ų' | 'ǔ' | 'ȕ' | 'ȗ'
        | 'ụ' | 'ủ' | 'ứ' | 'ừ' | 'ử' | 'ữ' | 'ự' => 'u',
        'ý' | 'ÿ' | 'ŷ' => 'y',
        'ç' | 'ć' | 'ĉ' | 'ċ' | 'č' => 'c',
        'ď' | 'đ' => 'd',
        'ĝ' | 'ğ' | 'ġ' | 'ģ' => 'g',
        'ĥ' | 'ħ' => 'h',
        'ĵ' => 'j',
        'ķ' => 'k',
        'ĺ' | 'ļ' | 'ľ' | 'ŀ' | 'ł' => 'l',
        'ñ' | 'ń' | 'ņ' | 'ň' => 'n',
        'ŕ' | 'ŗ' | 'ř' => 'r',
        'ś' | 'ŝ' | 'ş' | 'š' | 'ș' => 's',
        'ţ' | 'ť' | 'ŧ' | 'ț' => 't',
        'ŵ' => 'w',
        'ź' | 'ż' | 'ž' => 'z',
        _ => return None,
    };
    Some(base)
}

/// Normalização canônica de match: minúsculas + sem diacríticos + trim.
pub fn normalize_word(word: &str) -> String {
    let mut out = String::with_capacity(word.len());
    for c in word.trim().chars().flat_map(|c| c.to_lowercase()) {
        let u = c as u32;
        if (0x0300..=0x036f).contains(&u) {
            continue; // marca combinante (ex.: İ → i + ponto)
        }
        match strip_latin_precomposed(c) {
            Some(b) => out.push(b),
            None => out.push(c),
        }
    }
    out
}

fn sets() -> &'static HashMap<&'static str, HashSet<String>> {
    SETS.get_or_init(|| {
        let mut map = HashMap::new();
        for meta in WORDLISTS {
            let mut set = HashSet::new();
            for line in meta.words.lines() {
                let key = normalize_word(line);
                if !key.is_empty() {
                    set.insert(key);
                }
            }
            map.insert(meta.id, set);
        }
        map
    })
}

/// ids das wordlists embutidas.
pub fn wordlist_ids() -> Vec<&'static str> {
    WORDLISTS.iter().map(|m| m.id).collect()
}

/// true se a palavra (ex.: "CORAÇÃO", "Logos (LOGOS)") está na wordlist `id`.
pub fn wordlist_contains(id: &str, raw_word: &str) -> bool {
    let base = raw_word.split(' ').next().unwrap_or(raw_word);
    let key = normalize_word(base);
    sets().get(id).map(|s| s.contains(&key)).unwrap_or(false)
}

/// ids de todas as wordlists que contêm a palavra.
pub fn matched_wordlists(raw_word: &str) -> Vec<String> {
    let base = raw_word.split(' ').next().unwrap_or(raw_word);
    let key = normalize_word(base);
    let map = sets();
    let mut out = Vec::new();
    for meta in WORDLISTS {
        if map.get(meta.id).map(|s| s.contains(&key)).unwrap_or(false) {
            out.push(meta.id.to_string());
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalization_matches_typescript() {
        assert_eq!(normalize_word("Coração"), "coracao");
        assert_eq!(normalize_word("  CORACAO  "), "coracao");
        assert_eq!(normalize_word("Aarão"), "aarao");
        assert_eq!(normalize_word("naïve"), "naive");
        assert_eq!(normalize_word("Œuvre"), "œuvre");
        assert_eq!(normalize_word("Straße"), "straße");
    }

    #[test]
    fn registry_embeds_ptbr() {
        assert!(wordlist_ids().contains(&"pt-BR"));
    }

    #[test]
    fn ptbr_contains_common_words() {
        assert!(wordlist_contains("pt-BR", "AMOR"));
        assert!(wordlist_contains("pt-BR", "coração"));
        assert!(wordlist_contains("pt-BR", "Alquimia (ALQUIMIA)"));
        assert!(!wordlist_contains("pt-BR", "XQZKWJQQ"));
        assert!(!wordlist_contains("pt-BR", ""));
    }

    #[test]
    fn matched_lists_ptbr() {
        let m = matched_wordlists("DEUS");
        assert!(m.contains(&"pt-BR".to_string()));
        assert!(matched_wordlists("XQZKWJQQ").is_empty());
    }
}
