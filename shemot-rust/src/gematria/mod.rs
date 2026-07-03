/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

pub mod alphabets;
pub mod rules_latin;
pub mod rules_greek;
pub mod rules_hebrew;
pub mod search;
pub mod dictionaries;

// Re-export core items for clean external access
pub use alphabets::valor_letra_latino;
pub use rules_latin::{
    valor_palavra_latino, regras_basicas_latino, regras_foneticas_latino,
    apply_estilo, apply_filtro_avancado, LatinoEstilo, LatinoAvancado,
};
pub use rules_greek::{
    valor_palavra_grega, regras_basicas_grego,
};
pub use rules_hebrew::{
    valor_palavra_hebraico, format_hebrew_word,
};
pub use search::{
    backtrack_latino_etimologico, backtrack_latino_custom,
    backtrack_hebraico, backtrack_grego, WildcardSpec,
};
pub use dictionaries::{
    Dictionary, DictionaryEntry, InMemoryDictionary, DictionaryManager,
    load_default_portuguese_dictionary, load_default_greek_dictionary,
    load_default_hebrew_dictionary,
};
