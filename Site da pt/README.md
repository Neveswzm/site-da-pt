# 🎯 Portugal FC - Site Oficial

## Configuração do Servidor (Tempo Real)

Este projeto usa um servidor **Node.js com Express** para sincronizar seguidores e comentários em **tempo real** entre todos os utilizadores.

### Pré-requisitos
- **Node.js 14+** (verifica com `node -v`)
- **npm** (vem com Node.js)

### Instalação

#### Opção 1: Via Prompt de Comando (Windows CMD)
1. Abre o **Prompt de Comando (CMD)** na pasta do projeto
2. Executa: `npm install`
3. Depois: `npm start`

#### Opção 2: Usar o arquivo install.bat
1. Double-click em `install.bat`
2. Depois de instalar, executa `npm start`

#### Opção 3: Terminal do VS Code
1. Abre o terminal integrado no VS Code (Ctrl+`)
2. Executa: `npm install`
3. Depois: `npm start`

### Iniciar o Servidor

Depois de instalar, inicia o servidor:
```bash
npm start
```

Vais ver:
```
🎯 Servidor rodando em http://localhost:3000
📝 Dados guardados em data.json
```

### Abrir o Site

Depois de o servidor estar a correr:
1. Abre: `http://localhost:3000`
2. Ou clica no arquivo `index.html`

### Como Funciona

- **Seguidores**: Começam em 0 e aumentam quando um utilizador segue
- **Comentários**: Aparecem em tempo real para todos os utilizadores
- **Dados**: Guardados no arquivo `data.json` no servidor

### Parar o Servidor

Pressiona **Ctrl+C** no terminal onde está a correr o servidor.

---

## 🚀 Fazer o servidor ficar público para os teus amigos

Se queres que os comentários e seguidores sejam os mesmos para todos, o servidor precisa estar disponível online, não apenas no teu computador.

### Opção rápida: usar o teu computador com ngrok
1. Instala o ngrok: https://ngrok.com/
2. Executa `npm start`
3. Executa `ngrok http 3000`
4. Copia o URL `https://xxxxxx.ngrok.io`
5. Define `window.API_BASE_URL = 'https://xxxxxx.ngrok.io'` em `index.html` ou usa esse URL no teu site GitHub Pages.

### Melhor opção: Deploy em Render / Railway / Fly
1. Cria uma conta em Render, Railway ou Fly
2. Liga o teu repositório GitHub
3. Define a `build command` como `npm install`
4. Define a `start command` como `npm start`
5. Adiciona variáveis de ambiente no serviço:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_REDIRECT_URI=http://SEU_DOMINIO/auth/discord/callback`
   - `SESSION_SECRET=uma_string_secreta`
6. Copia o URL público gerado e usa-o como `API_BASE_URL` no teu `index.html`.

### Porquê isto é importante
- `localhost:3000` funciona apenas no teu PC
- Os teus amigos precisam de um URL público para ver os mesmos comentários e seguidores
- O site GitHub Pages pode usar a mesma API se apontar para esse URL

---

### 📁 Estrutura de Arquivos

- `index.html` - Site principal
- `server.js` - Servidor Node.js (Express)
- `package.json` - Dependências do projeto
- `data.json` - Dados sincronizados (criado automaticamente)
- `install.bat` - Script de instalação rápida

---

### ✅ Funcionalidades

✅ Seguir/Deixar de Seguir Jogadores  
✅ Contador de Seguidores em Tempo Real  
✅ Sistema de Comentários Compartilhados  
✅ Notificações de Jogadores Seguidos  
✅ Sincronização entre Utilizadores  

---

**Pronto!** 🚀 O sistema agora é totalmente compartilhado em tempo real!
