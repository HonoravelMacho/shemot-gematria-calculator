/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use std::collections::{HashMap, HashSet};

/// Returns the standard Latin gematria letter value (A=1, B=2, ..., Z=26).
pub fn valor_letra_latino(c: char) -> u32 {
    let c_upper = c.to_ascii_uppercase();
    if c_upper >= 'A' && c_upper <= 'Z' {
        (c_upper as u32 - 'A' as u32) + 1
    } else {
        0
    }
}

/// Returns the Hebrew characters with their standard gematria values.
pub fn get_tabela_hebraica() -> HashMap<char, u32> {
    let mut m = HashMap::new();
    m.insert('א', 1);   // Alef
    m.insert('ב', 2);   // Beit
    m.insert('ג', 3);   // Gimel
    m.insert('ד', 4);   // Dalet
    m.insert('ה', 5);   // He
    m.insert('ו', 6);   // Vav
    m.insert('ז', 7);   // Zayin
    m.insert('ח', 8);   // Chet
    m.insert('ט', 9);   // Tet
    m.insert('י', 10);  // Yod
    m.insert('כ', 20);  // Kaf
    m.insert('ך', 20);  // Kaf Sofit
    m.insert('ל', 30);  // Lamed
    m.insert('מ', 40);  // Mem
    m.insert('ם', 40);  // Mem Sofit
    m.insert('נ', 50);  // Nun
    m.insert('ן', 50);  // Nun Sofit
    m.insert('ס', 60);  // Samech
    m.insert('ע', 70);  // Ayin
    m.insert('פ', 80);  // Pe
    m.insert('ף', 80);  // Pe Sofit
    m.insert('צ', 90);  // Tzadi
    m.insert('ץ', 90);  // Tzadi Sofit
    m.insert('ק', 100); // Kof
    m.insert('ר', 200); // Resh
    m.insert('ש', 300); // Shin
    m.insert('ת', 400); // Tav
    m
}

/// Returns the Greek characters with their standard gematria values.
pub fn get_tabela_grega() -> HashMap<char, u32> {
    let mut m = HashMap::new();
    m.insert('Α', 1);   // Alfa
    m.insert('Β', 2);   // Beta
    m.insert('Γ', 3);   // Gama
    m.insert('Δ', 4);   // Delta
    m.insert('Ε', 5);   // Epsilon
    m.insert('Ϛ', 6);   // Stigma
    m.insert('Ζ', 7);   // Zeta
    m.insert('Η', 8);   // Eta
    m.insert('Θ', 9);   // Theta
    m.insert('Ι', 10);  // Iota
    m.insert('Κ', 20);  // Kapa
    m.insert('Λ', 30);  // Lambda
    m.insert('Μ', 40);  // Mi
    m.insert('Ν', 50);  // Ni
    m.insert('Ξ', 60);  // Xi
    m.insert('Ο', 70);  // Omicron
    m.insert('Π', 80);  // Pi
    m.insert('Ϙ', 90);  // Koppa
    m.insert('Ρ', 100); // Ro
    m.insert('Σ', 200); // Sigma
    m.insert('Τ', 300); // Tau
    m.insert('Υ', 400); // Ipsilon
    m.insert('Φ', 500); // Fi
    m.insert('Χ', 600); // Chi
    m.insert('Ψ', 700); // Psi
    m.insert('Ω', 800); // Omega
    m.insert('Ϡ', 900); // Sampi
    m
}

/// Returns Latin characters to Hebrew mappings for keyboard inputs.
pub fn get_latin_to_hebrew_map() -> HashMap<char, char> {
    let mut m = HashMap::new();
    let mappings = [
        ('A', 'א'), ('B', 'ב'), ('G', 'ג'), ('D', 'ד'), ('H', 'ה'),
        ('V', 'ו'), ('W', 'ו'), ('Z', 'ז'), ('X', 'ח'), ('T', 'ט'),
        ('Y', 'י'), ('I', 'י'), ('K', 'כ'), ('L', 'ל'), ('M', 'מ'),
        ('N', 'נ'), ('S', 'ס'), ('E', 'ע'), ('P', 'פ'), ('F', 'פ'),
        ('C', 'צ'), ('Q', 'ק'), ('R', 'ר'), ('U', 'ש'), ('O', 'ת')
    ];
    for (lat, heb) in mappings {
        m.insert(lat, heb);
    }
    m
}

/// Returns Latin characters to Greek mappings for keyboard inputs.
pub fn get_latin_to_greek_map() -> HashMap<char, char> {
    let mut m = HashMap::new();
    let mappings = [
        ('A', 'Α'), ('B', 'Β'), ('G', 'Γ'), ('D', 'Δ'), ('E', 'Ε'),
        ('6', 'Ϛ'), ('Z', 'Ζ'), ('H', 'Η'), ('Q', 'Θ'), ('I', 'Ι'),
        ('K', 'Κ'), ('L', 'Λ'), ('M', 'Μ'), ('N', 'Ν'), ('X', 'Ξ'),
        ('O', 'Ο'), ('P', 'Π'), ('9', 'Ϙ'), ('R', 'Ρ'), ('S', 'Σ'),
        ('T', 'Τ'), ('U', 'Υ'), ('Y', 'Υ'), ('F', 'Φ'), ('C', 'Χ'),
        ('W', 'Ψ'), ('V', 'Ω'), ('8', 'Ϡ')
    ];
    for (lat, grk) in mappings {
        m.insert(lat, grk);
    }
    m
}

/// Standard Portuguese/Latin vowels.
pub const VOGAIS_LATINO: &str = "AEIOU";

/// Core consonant clusters permitted inside Latin words.
pub fn get_pares_permitidos() -> HashSet<String> {
    let mut s = HashSet::new();
    let pares = [
        "RR", "SS", "BR", "CR", "DR", "FR", "GR", "PR", "TR",
        "BL", "CL", "FL", "GL", "PL", "CH", "LH", "NH", "QU", "GU",
        "PT", "CT", "BT", "GN", "XC", "PS", "TZ", "TS", "NS", "ST", "RT"
    ];
    for p in pares {
        s.insert(p.to_string());
    }
    s
}

/// Consonant clusters permitted at the absolute start of Latin words.
pub fn get_pares_iniciais_permitidos() -> HashSet<String> {
    let mut s = HashSet::new();
    let pares = [
        "BR", "CR", "DR", "FR", "GR", "PR", "TR", "VR", "BL", "CL", "FL", "GL", "PL", "TL",
        "CH"
    ];
    for p in pares {
        s.insert(p.to_string());
    }
    s
}
