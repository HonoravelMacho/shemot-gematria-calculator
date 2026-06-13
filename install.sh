#!/bin/bash

# Shemot - Instalador e Configuração do Comando Global 'shemot'
# Este script clona o repositório correto, instala dependências e configura o comando 'shemot' no terminal.

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}    🕯️  INSTALANDO MOTOR DE GEMATRIA SHEMOT  🕯️    ${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Definir e garantir a pasta de destino correta
TARGET_DIR="$HOME/shemot-gematria-calculator"
REPO_URL="https://github.com/HonoravelMacho/shemot-gematria-calculator.git"

if [ -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}🔄 Pasta do Shemot já existe no seu computador.${NC}"
    echo -e "Entrando em ${TARGET_DIR} e obtendo atualizações..."
    cd "$TARGET_DIR" || exit 1
    git pull origin principal || git pull origin main
else
    echo -e "📂 Clonando o repositório público do GitHub..."
    git clone "$REPO_URL" "$TARGET_DIR"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Clonado com sucesso!${NC}"
        cd "$TARGET_DIR" || exit 1
    else
        echo -e "${RED}❌ Erro: Não foi possível clonar o repositório.${NC}"
        echo -e "Verifique sua conexão com a internet ou se o nome do repositório no seu perfil está como: ${YELLOW}shemot-gematria-calculator${NC}"
        exit 1
    fi
fi

# 2. Verificar se o Node.js e o npm estão instalados
echo -e "\n🔍 Verificando requisitos de sistema..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ O Node.js/npm não está instalado no seu sistema.${NC}"
    echo -e "Por favor, instale o Node.js antes de continuar. Você pode baixá-lo em: ${BLUE}https://nodejs.org/${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js e npm detectados! (Versão: $(node -v))${NC}"
fi

# 3. Dar permissão de execução ao script de inicialização do terminal
chmod +x shemot.sh

# 4. Instalar as dependências do projeto
echo -e "\n📦 Instalando e verificando dependências (este passo pode levar alguns segundos)..."
npm install --loglevel=error
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Todas as dependências foram instaladas com sucesso!${NC}"
else
    echo -e "${RED}❌ Falha ao instalar dependências. Tente executar 'npm install' manualmente na pasta.${NC}"
fi

# 5. Criar o comando global 'shemot' no terminal do usuário
echo -e "\n⚙️  Configurando o comando fácil '${YELLOW}shemot${NC}' no seu terminal..."

ALIAS_CMD="alias shemot='bash $TARGET_DIR/shemot.sh'"
CONFIGURED=false

# Configurar para o Bash (.bashrc ou .bash_profile)
for BASH_FILE in "$HOME/.bashrc" "$HOME/.bash_profile"; do
    if [ -f "$BASH_FILE" ]; then
        if ! grep -q "alias shemot=" "$BASH_FILE"; then
            echo "" >> "$BASH_FILE"
            echo "# Comando de inicialização do Shemot" >> "$BASH_FILE"
            echo "$ALIAS_CMD" >> "$BASH_FILE"
            CONFIGURED=true
            echo -e "${GREEN}✅ Configurado no arquivo: $BASH_FILE${NC}"
        else
            CONFIGURED=true
        fi
    fi
done

# Configurar para o Zsh (.zshrc) - Padrão em muitos Linux e macOS
if [ -f "$HOME/.zshrc" ]; then
    if ! grep -q "alias shemot=" "$HOME/.zshrc"; then
        echo "" >> "$HOME/.zshrc"
        echo "# Comando de inicialização do Shemot" >> "$HOME/.zshrc"
        echo "$ALIAS_CMD" >> "$HOME/.zshrc"
        CONFIGURED=true
        echo -e "${GREEN}✅ Configurado no arquivo: $HOME/.zshrc${NC}"
    else
        CONFIGURED=true
    fi
fi

if [ "$CONFIGURED" = true ]; then
    echo -e "\n${GREEN}🎉 INSTALAÇÃO FINALIZADA COM SUCESSO! 🎉${NC}"
    echo -e "---------------------------------------------------"
    echo -e "Para aplicar a alteração AGORA, execute o comando:"
    echo -e "👉 ${BLUE}source ~/.bashrc${NC}  (ou de acordo com seu terminal: ${BLUE}source ~/.zshrc${NC})"
    echo -e "---------------------------------------------------"
    echo -e "Depois disso, você poderá iniciar o software de qualquer lugar simplesmente digitando:"
    echo -e "👉 ${YELLOW}shemot${NC}"
    echo -e "---------------------------------------------------"
    echo -e "O comando irá atualizar automaticamente o Shemot do GitHub, instalar novas dependências se eu adicionar e abrir o painel!"
else
    echo -e "${YELLOW}⚠️  A instalação foi concluída, mas não encontramos arquivos de configuração comuns (~/.zshrc ou ~/.bashrc) para criar o comando global auto-start.${NC}"
    echo -e "Sempre que quiser iniciar o Shemot, basta rodar:"
    echo -e "👉 ${BLUE}cd $TARGET_DIR && bash shemot.sh${NC}"
fi
