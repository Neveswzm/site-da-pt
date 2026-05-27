const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Arquivo de dados
const dataFile = path.join(__dirname, 'data.json');

// Inicializar arquivo de dados
function initDataFile() {
  if (!fs.existsSync(dataFile)) {
    const initialData = {
      followers: {},
      comments: {}
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
    if (!c.id) {
      c.id = 'c_' + Date.now() + '_' + Math.floor(Math.random()*9999);
      changed = true;
    }
    if (!Array.isArray(c.replies)) { c.replies = []; changed = true; }
    if (!c.timestamp) c.timestamp = new Date().toLocaleString('pt-PT');
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
  
  const comment = {
    id: 'c_' + Date.now() + '_' + Math.floor(Math.random()*9999),
    author: author || 'Anónimo',
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
  const reply = { id: 'r_' + Date.now() + '_' + Math.floor(Math.random()*9999), author: author || 'Anónimo', text, timestamp: new Date().toLocaleString('pt-PT') };
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

app.listen(PORT, () => {
  console.log(`🎯 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📝 Dados guardados em ${dataFile}`);
});
