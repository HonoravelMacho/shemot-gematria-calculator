/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

use serde::Deserialize;
use std::collections::{HashMap, HashSet};

/// Model for a dictionary entry loaded from JSON.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DictionaryEntry {
    /// Normalized word in UPPERCASE (no accents/diacritics for search)
    pub word: String,
    /// Original spelled word (with exact casings/accents/nikkud)
    pub original_word: String,
    /// Simple translation or title in Portuguese
    pub translation: String,
    /// Extended meaning/description in Portuguese
    pub description: String,
}

/// A trait defining the operations of a Dictionary.
/// This makes the architecture highly modular, allowing future replacements
/// with database-backed stores, lazy disk readers, or external APIs.
pub trait Dictionary {
    /// Fast check if a normalized word exists in the dictionary.
    fn contains(&self, word: &str) -> bool;

    /// Retrieves full entry details for a given word.
    fn lookup(&self, word: &str) -> Option<&DictionaryEntry>;

    /// Lists all words registered in this dictionary.
    fn list_words(&self) -> Vec<String>;

    /// Gets the inner map of words and their corresponding entries.
    fn entries(&self) -> &HashMap<String, DictionaryEntry>;
}

/// Direct in-memory dictionary storage backed by pre-parsed JSON data.
pub struct InMemoryDictionary {
    /// O(1) lookup set for fast existence matching during combinatorial search.
    word_set: HashSet<String>,
    /// Mappings from search key to rich dictionary entries.
    entry_map: HashMap<String, DictionaryEntry>,
}

impl InMemoryDictionary {
    /// Parses a JSON data string and creates an InMemoryDictionary.
    pub fn new(json_data: &str) -> Result<Self, serde_json::Error> {
        let entries: Vec<DictionaryEntry> = serde_json::from_str(json_data)?;
        let mut word_set = HashSet::with_capacity(entries.len());
        let mut entry_map = HashMap::with_capacity(entries.len());

        for entry in entries {
            let search_key = entry.word.to_uppercase();
            word_set.insert(search_key.clone());
            entry_map.insert(search_key, entry);
        }

        Ok(Self { word_set, entry_map })
    }
}

impl Dictionary for InMemoryDictionary {
    fn contains(&self, word: &str) -> bool {
        self.word_set.contains(&word.to_uppercase())
    }

    fn lookup(&self, word: &str) -> Option<&DictionaryEntry> {
        self.entry_map.get(&word.to_uppercase())
    }

    fn list_words(&self) -> Vec<String> {
        self.word_set.iter().cloned().collect()
    }

    fn entries(&self) -> &HashMap<String, DictionaryEntry> {
        &self.entry_map
    }
}

/// Loads the default Portuguese dictionary embedded in the binary.
pub fn load_default_portuguese_dictionary() -> InMemoryDictionary {
    let json = include_str!("../../dictionaries/portuguese.json");
    InMemoryDictionary::new(json).expect("Failed to parse embedded Portuguese dictionary")
}

/// Loads the default Greek dictionary embedded in the binary.
pub fn load_default_greek_dictionary() -> InMemoryDictionary {
    let json = include_str!("../../dictionaries/greek.json");
    InMemoryDictionary::new(json).expect("Failed to parse embedded Greek dictionary")
}

/// Loads the default Hebrew dictionary embedded in the binary.
pub fn load_default_hebrew_dictionary() -> InMemoryDictionary {
    let json = include_str!("../../dictionaries/hebrew.json");
    InMemoryDictionary::new(json).expect("Failed to parse embedded Hebrew dictionary")
}

/// Unified manager holding the standard dictionaries.
pub struct DictionaryManager {
    pub portuguese: InMemoryDictionary,
    pub greek: InMemoryDictionary,
    pub hebrew: InMemoryDictionary,
}

impl DictionaryManager {
    /// Instantiates the manager by embedding and parsing all default dictionaries.
    pub fn load_all() -> Self {
        Self {
            portuguese: load_default_portuguese_dictionary(),
            greek: load_default_greek_dictionary(),
            hebrew: load_default_hebrew_dictionary(),
        }
    }
}
