# 🏆 Royal Cup - Portal do Campeonato

Este repositório contém o código-fonte da aplicação web "Royal Cup", uma plataforma moderna desenvolvida para o acompanhamento completo de um campeonato de futebol.

🔗 **Acesse a versão ao vivo:** [https://royal-cup-br.web.app/](https://royal-cup-br.web.app/)

## 📄 Sobre o Projeto

O Royal Cup é um portal centralizado que oferece a jogadores e torcedores uma forma fácil e intuitiva de acompanhar todas as emoções do campeonato. A plataforma foi construída com foco em performance, atualização em tempo real e uma experiência de usuário limpa e responsiva.

## ✨ Funcionalidades Principais

* **Resultados em Tempo Real:** Visualização dos placares das últimas partidas.
* **Tabela de Classificação:** Classificação automática e ordenada por pontos, saldo de gols e outros critérios.
* **Artilharia:** Ranking dos principais goleadores do torneio.
* **Páginas de Times:** Área dedicada para cada time, exibindo informações, elenco de jogadores e comissão técnica.
* **Design Responsivo:** Interface totalmente adaptada para uma experiência otimizada em desktops, tablets e smartphones.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando um stack de tecnologias modernas, visando alta performance e escalabilidade.

* **Front-End:**
    * **Vite:** Build tool de nova geração para um desenvolvimento rápido.
    * **JavaScript (ES6+):** Linguagem principal para toda a lógica da aplicação.
    * **TailwindCSS:** Framework CSS utility-first para uma estilização ágil e customizável.
    * **HTML5 Semântico**

* **Backend & Infraestrutura:**
    * **Firebase Realtime Database:** Utilizado como banco de dados NoSQL para armazenamento e sincronização de dados em tempo real.
    * **Firebase Hosting:** Plataforma de hospedagem para deploy contínuo, com suporte a canais de preview e alta performance global.

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Firebase

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/royal-cup-site.git
   cd royal-cup-site
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Copie o arquivo de exemplo
   cp env.example .env
   
   # Edite o arquivo .env com suas credenciais do Firebase
   ```

4. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative o Realtime Database
   - Copie as credenciais do projeto para o arquivo `.env`

5. **Execute o projeto**
   ```bash
   # Para desenvolvimento
   npm run dev
   
   # Para build de produção
   npm run build
   ```

### Estrutura do Projeto

```
royal-cup-site/
├── src/
│   ├── js/           # JavaScript principal
│   ├── css/          # Estilos CSS
│   └── assets/       # Imagens e recursos
├── dados_csv/        # Arquivos CSV com dados dos times
├── config/           # Configurações do Firebase
├── public/           # Arquivos públicos
└── dist/             # Build de produção (gerado automaticamente)
```

## 📜 Licença

Este projeto está licenciado sob a MIT License com Restrição Comercial. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

**Importante:** Este software é protegido por direitos autorais e não pode ser usado, copiado, modificado, mesclado, publicado, distribuído, sublicenciado e/ou vendido sem a permissão expressa por escrito do detentor dos direitos autorais.

© 2024 Royal Cup. Todos os direitos reservados. 