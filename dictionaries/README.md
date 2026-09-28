# Dicionários da comunidade — SHEMOT

Este diretório é o **registro modular de wordlists**. Qualquer pessoa pode adicionar
um dicionário de filtro sem tocar na engine Rust nem no React: basta um arquivo de
palavras + uma entrada no `registry.json`.

## Formato de uma wordlist

- Arquivo `.txt`, **uma palavra por linha**, UTF-8.
- A normalização é aplicada no carregamento (não precisa pré-normalizar):
  minúsculas → NFD remove diacríticos → mantém `a-z` → descarta o resto.
  Ex.: `Coração`, `CORACAO` e `coração` viram a mesma chave `coracao`.
- Recomendado: formas plenas (com flexões) se o objetivo é **filtrar** combinações geradas.

## Passo a passo para contribuir

1. Crie `dictionaries/<id>/words.txt` (+ um `README.md` com fonte/licença dos dados).
2. Registre em `dictionaries/registry.json`:
   ```json
   {
     "id": "<id>",
     "name": "Nome legível",
     "lang": "pt-BR",
     "alphabet": "Latino | Hebraico | Grego",
     "kind": "filter",
     "version": "1.0.0",
     "file": "<id>/words.txt",
     "entries": 123,
     "normalization": "lowercase + NFD sem diacríticos (a-z)",
     "description": "...",
     "source": "...",
     "license": "..."
   }
   ```
3. Espelhe os arquivos em `public/dicts/` com a **mesma estrutura de pastas**
   (ex.: `public/dicts/<id>/words.txt` + `registry.json` atualizado) — o frontend
   descobre wordlists pelo registry em runtime.
4. Pronto. Sem rebuild da engine:
   - **Rust:** `shemot-rust/build.rs` lê o `registry.json` e embute cada wordlist
     (`include_str!`) automaticamente; `wordlists.rs` expõe `contains(id, palavra)`.
   - **Frontend:** `src/data/dictLoader.ts` baixa o registry + wordlists sob demanda
     (fora do bundle) e o filtro aparece na UI para o alfabeto correspondente.

## Regras

- `id` único, minúsculo, sem espaços (ex.: `pt-BR`, `latim-classico`).
- `kind: "filter"` = só filtragem (sem descrições). Verbetes **com descrição**
  continuam no dicionário curado embutido (`src/data/dictionaries.ts` /
  `shemot-rust/dictionaries/*.json`).
- Não commite arquivos gerados (`target/`, `dist/`). Wordlists grandes (>10 MB):
  abra uma issue antes para discutirmos fatiamento/lazy-load.
