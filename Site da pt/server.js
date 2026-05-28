require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static('.'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Arquivo de dados
const dataFile = path.join(__dirname, 'data.json');

// Inicializar arquivo de dados
function initDataFile() {
  if (!fs.existsSync(dataFile)) {
    const initialData = {
        followers: {},
        comments: {},
        profiles: {}
    };
    fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  const data = fs.readFileSync(dataFile, 'utf-8');
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

initDataFile();

// ── ROTAS DE SEGUIDORES ──
app.get('/api/players/:name/followers', (req, res) => {
  const { name } = req.params;
  const data = readData();
  const count = data.followers[name] || 0;
  res.json({ player: name, followers: count });
});

app.post('/api/players/:name/follow', (req, res) => {
  const { name } = req.params;
  const data = readData();
  
  if (!data.followers[name]) {
    data.followers[name] = 0;
  }
  data.followers[name]++;
  
  writeData(data);
  res.json({ player: name, followers: data.followers[name], action: 'followed' });
});

app.post('/api/players/:name/unfollow', (req, res) => {
  const { name } = req.params;
  const data = readData();
  
  if (!data.followers[name]) {
    data.followers[name] = 0;
  }
  data.followers[name] = Math.max(0, data.followers[name] - 1);
  
  writeData(data);
  res.json({ player: name, followers: data.followers[name], action: 'unfollowed' });
});

// ── ROTAS DE COMENTÁRIOS ──
app.get('/api/players/:name/comments', (req, res) => {
  const { name } = req.params;
  const data = readData();
  if (!data.comments[name]) data.comments[name] = [];
  // Normalizar comentários: garantir id e replies
  let changed = false;
  data.comments[name] = data.comments[name].map(c => {
    if (!c.id) { c.id = 'c_' + Date.now() + '_' + Math.floor(Math.random()*9999); changed = true; }
    if (!Array.isArray(c.replies)) { c.replies = []; changed = true; }
    if (!c.timestamp) c.timestamp = new Date().toLocaleString('pt-PT');
    // ensure replies have ids and timestamps
    c.replies = (c.replies || []).map(r => {
      if (!r.id) r.id = 'r_' + Date.now() + '_' + Math.floor(Math.random()*9999);
      if (!r.timestamp) r.timestamp = new Date().toLocaleString('pt-PT');
      return r;
    });
    return c;
  });
  if (changed) writeData(data);
  const comments = data.comments[name];
  res.json({ player: name, comments });
});

app.post('/api/players/:name/comments', (req, res) => {
  const { name } = req.params;
  const { author, text } = req.body;
  const data = readData();
  
  if (!data.comments[name]) {
    data.comments[name] = [];
  }
  // If user is authenticated, prefer session info (and include avatar + displayName override)
  let commentAuthor = author || 'Anónimo';
  let authorAvatar = null;
  let authorId = null;
  if (req.session && req.session.user) {
    const user = req.session.user;
    authorId = user.id;
    const profile = (data.profiles && data.profiles[user.id]) || {};
    commentAuthor = profile.displayName || (user.username ? `${user.username}${user.discriminator ? '#'+user.discriminator : ''}` : commentAuthor);
    if (user.avatar) authorAvatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    else if (user.discriminator) authorAvatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
  }

  const comment = {
    id: 'c_' + Date.now() + '_' + Math.floor(Math.random()*9999),
    author: commentAuthor,
    authorId: authorId || null,
    authorAvatar: authorAvatar,
    text,
    timestamp: new Date().toLocaleString('pt-PT'),
    replies: []
  };
  
  data.comments[name].unshift(comment);
  writeData(data);
  
  res.json({ player: name, comment, totalComments: data.comments[name].length });
});

// Rota para adicionar reply a um comentário
app.post('/api/players/:name/comments/:commentId/replies', (req, res) => {
  const { name, commentId } = req.params;
  const { author, text } = req.body;
  const data = readData();
  if (!data.comments[name]) data.comments[name] = [];
  const comment = data.comments[name].find(c => c.id === commentId);
  if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });
  let replyAuthor = author || 'Anónimo';
  let replyAvatar = null;
  if (req.session && req.session.user) {
    const user = req.session.user;
    const profile = (data.profiles && data.profiles[user.id]) || {};
    replyAuthor = profile.displayName || (user.username ? `${user.username}${user.discriminator ? '#'+user.discriminator : ''}` : replyAuthor);
    if (user.avatar) replyAvatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    else if (user.discriminator) replyAvatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
  }
  const reply = { id: 'r_' + Date.now() + '_' + Math.floor(Math.random()*9999), author: replyAuthor, authorAvatar: replyAvatar, text, timestamp: new Date().toLocaleString('pt-PT') };
  if (!Array.isArray(comment.replies)) comment.replies = [];
  comment.replies.push(reply);
  writeData(data);
  res.json({ player: name, commentId, reply });
});

// ── ROTA PARA DADOS TOTAIS ──
app.get('/api/data', (req, res) => {
  const data = readData();
  res.json(data);
});

// ── AUTENTICAÇÃO DISCORD (OAuth2) ──
app.get('/auth/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || '',
    redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback',
    response_type: 'code',
    scope: 'identify'
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
});

app.get('/auth/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect('/');
  try {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/auth/discord/callback'
    });

    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const access_token = tokenRes.data.access_token;
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    req.session.user = userRes.data;
    res.redirect('/');
  } catch (err) {
    console.error('Discord OAuth error', err?.response?.data || err.message || err);
    res.redirect('/?auth_error=1');
  }
});

app.get('/auth/status', (req, res) => {
  const data = readData();
  if (req.session && req.session.user) {
    const user = Object.assign({}, req.session.user);
    // attach saved display name if exists
    const profile = data.profiles && data.profiles[user.id];
    if (profile && profile.displayName) user.displayName = profile.displayName;
    return res.json({ user });
  }
  return res.json({ user: null });
});

// Atualizar nome de exibição no site (sobrepor nome Discord)
app.post('/auth/display-name', (req, res) => {
  const { displayName } = req.body || {};
  if (!req.session || !req.session.user) return res.status(401).json({ error: 'Not authenticated' });
  const data = readData();
  if (!data.profiles) data.profiles = {};
  data.profiles[req.session.user.id] = data.profiles[req.session.user.id] || {};
  data.profiles[req.session.user.id].displayName = displayName && displayName.trim() ? displayName.trim() : null;
  writeData(data);
  // reflect in session
  if (displayName && displayName.trim()) req.session.user.displayName = displayName.trim();
  else delete req.session.user.displayName;
  res.json({ ok: true, displayName: req.session.user.displayName || null });
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.listen(PORT, () => {
  console.log(`🎯 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 Dados guardados em ${dataFile}`);
});
