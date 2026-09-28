#!/bin/bash

# Shemot Automation Script
# Este script atualiza o repositório, instala as dependências se necessário e inicia o Shemot.

# Detectar se estamos dentro da pasta do shemot ou se precisamos entrar nela
TARGET_DIR="shemot-gematria-calculator"

if [ -d "$TARGET_DIR" ]; then
    echo "⚙️  Entrando na pasta $TARGET_DIR..."
    cd "$TARGET_DIR"
elif [ -f "package.json" ]; then
    echo "⚙️  Já estamos na raiz do projeto Shemot."
else
    # Se o usuário rodou o script de fora e a pasta não existe, tenta clonar se houver internet
    echo "⚠️  Pasta do Shemot não encontrada localmente."
    echo "⚙️  Tentando clonar o repositório do GitHub..."
    git clone https://github.com/HonoravelMacho/shemot-gematria-calculator.git
    if [ $? -eq 0 ]; then
        cd "$TARGET_DIR"
    else
        echo "❌ Erro: Não foi possível clonar o repositório. Verifique se ele está público no GitHub!"
        exit 1
    fi
fi

# 1. Atualizar com as últimas modificações do GitHub
echo "🔄 Sincronizando com as últimas atualizações do GitHub..."
git pull origin principal || git pull origin main || echo "⚠️  Não foi possível conectar ao GitHub. Iniciando com os arquivos locais..."

# 2. Garantir que as dependências do npm estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Node modules não encontrados. Instalando dependências..."
    npm install
else
    echo "📦 Dependências já instaladas. Verificando atualizações de pacotes..."
    npm install --loglevel=error
fi

# 3. Iniciar o servidor local Vite e tentar abrir o navegador automaticamente
echo "🚀 Iniciando o motor de Gematria Shemot em segundo plano na porta 3000..."

# Detecta sistema operacional para abrir o navegador
function open_browser() {
    sleep 2 # Espera 2 segundos para o Vite subir
    URL="http://localhost:3000"
    if command -v xdg-open > /dev/null; then
        xdg-open "$URL"
    elif command -v open > /dev/null; then
        open "$URL"
    elif command -v explorer.exe > /dev/null; then
        explorer.exe "$URL"
    else
        echo "🌐 Servidor pronto! Abra o seguinte endereço no seu navegador: $URL"
    fi
}

open_browser &
npm run dev
