//! Build script: embute as wordlists da comunidade (dictionaries/registry.json)
//! no binário via include_str!, sem que contribuidores precisem tocar em Rust.
//! Gera $OUT_DIR/wordlists_registry.rs com os metadados + conteúdo embutido.

use std::env;
use std::fs;
use std::path::Path;

fn rust_string(s: &str) -> String {
    // Escapa para literal Rust "...".
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if c.is_control() => out.push_str(&format!("\\u{{{:x}}}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

fn main() {
    let manifest_dir = env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR");
    let root = Path::new(&manifest_dir)
        .parent()
        .expect("repo root")
        .to_path_buf();
    let registry_path = root.join("dictionaries/registry.json");

    println!("cargo:rerun-if-changed={}", registry_path.display());

    let out_dir = env::var("OUT_DIR").expect("OUT_DIR");
    let out_path = Path::new(&out_dir).join("wordlists_registry.rs");

    let mut code = String::from(
        "// Gerado por shemot-rust/build.rs a partir de dictionaries/registry.json.\n\
         #[allow(dead_code)]\n\
         pub struct WordlistMeta {\n\
         \x20   pub id: &'static str,\n\
         \x20   pub name: &'static str,\n\
         \x20   pub version: &'static str,\n\
         \x20   pub words: &'static str,\n\
         }\n\
         #[allow(dead_code)]\n\
         pub static WORDLISTS: &[WordlistMeta] = &[\n",
    );

    let mut count = 0;
    if let Ok(text) = fs::read_to_string(&registry_path) {
        if let Ok(reg) = serde_json::from_str::<serde_json::Value>(&text) {
            if let Some(list) = reg.get("wordlists").and_then(|v| v.as_array()) {
                for w in list {
                    let id = w.get("id").and_then(|v| v.as_str()).unwrap_or("");
                    let name = w.get("name").and_then(|v| v.as_str()).unwrap_or(id);
                    let version = w.get("version").and_then(|v| v.as_str()).unwrap_or("0.0.0");
                    let file = w.get("file").and_then(|v| v.as_str()).unwrap_or("");
                    if id.is_empty() || file.is_empty() {
                        continue;
                    }
                    let abs = root.join("dictionaries").join(file);
                    println!("cargo:rerun-if-changed={}", abs.display());
                    // include_str! com caminho via CARGO_MANIFEST_DIR (vale em desktop e Android).
                    code.push_str(&format!(
                        "    WordlistMeta {{ id: {}, name: {}, version: {}, words: include_str!(concat!(env!(\"CARGO_MANIFEST_DIR\"), \"/../dictionaries/{}\")) }},\n",
                        rust_string(id),
                        rust_string(name),
                        rust_string(version),
                        file.replace('\\', "/"),
                    ));
                    count += 1;
                }
            }
        }
    }

    code.push_str("];\n");
    fs::write(&out_path, code).expect("write wordlists_registry.rs");
    println!("cargo:warning=wordlists embutidas: {count} (dictionaries/registry.json)");
}
