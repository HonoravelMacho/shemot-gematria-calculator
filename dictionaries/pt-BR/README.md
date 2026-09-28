# Wordlist pt-BR (filtro)

- **Arquivo canônico:** `dictionaries/pt-BR/words.txt` (257.954 formas únicas, 2,7 MB)
- **Cópia servida ao frontend:** `public/dicts/pt-BR/words.txt` (idêntica; o frontend busca em runtime, fora do bundle JS)
- **Origem:** wordlist `brazilian` (pacote `wbrazilian`/ispell, dados DFSG-free presentes em
  `/usr/share/dict/brazilian` nos runners Debian/Ubuntu)
- **Processamento:** minúsculas + remoção de diacríticos via NFD + filtro `^[a-z]+$` + deduplicação.
  `a → a`, `coração → coracao`, `Aarão → aarao`. Nomes próprios mantidos de propósito.
- **Licença dos dados:** a lista é fato linguístico (palavras), sem descrições autorais;
  verbetes com descrição continuam no dicionário curado embutido no código.

Para regenerar: ver `dictionaries/README.md` (guia da comunidade).
