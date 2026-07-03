/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

pub mod alphabets;
pub mod rules_latin;
pub mod rules_greek;
pub mod rules_hebrew;

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
