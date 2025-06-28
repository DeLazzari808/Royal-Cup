#!/bin/bash

# Script de Deploy para Royal Cup Site
echo "🚀 Iniciando deploy do Royal Cup Site..."

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Copie o arquivo env.example para .env e configure suas credenciais do Firebase"
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Deploy para Firebase
    echo "🔥 Fazendo deploy para Firebase..."
    firebase deploy
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deploy concluído com sucesso!"
        echo "🌐 Seu site está disponível em: https://royal-cup-br.web.app/"
    else
        echo "❌ Erro no deploy do Firebase"
        exit 1
    fi
else
    echo "❌ Erro no build do projeto"
    exit 1
fi 