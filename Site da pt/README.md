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
