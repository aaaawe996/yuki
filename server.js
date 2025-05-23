const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data', 'threads.json');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// スレッド一覧を取得
app.get('/api/threads', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
  const threads = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json(threads);
});

// 新規スレッド作成
app.post('/api/threads', (req, res) => {
  const threads = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const newThread = {
    id: Date.now(),
    title: req.body.title,
    comments: [],
    deleted: false,
  };
  threads.unshift(newThread);
  fs.writeFileSync(DATA_FILE, JSON.stringify(threads, null, 2));
  res.json(newThread);
});

// コメント追加
app.post('/api/threads/:id/comments', (req, res) => {
  const threads = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const thread = threads.find(t => t.id == req.params.id);
  if (thread) {
    thread.comments.push({
      id: Date.now(),
      text: req.body.text,
      image: req.body.image || null,
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(threads, null, 2));
    res.json(thread);
  } else {
    res.status(404).send('Thread not found');
  }
});

// スレッド削除（論理削除）
app.delete('/api/threads/:id', (req, res) => {
  const threads = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const thread = threads.find(t => t.id == req.params.id);
  if (thread) {
    thread.deleted = true;
    fs.writeFileSync(DATA_FILE, JSON.stringify(threads, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).send('Thread not found');
  }
});

// スレッド完全削除
app.delete('/api/threads/:id/force', (req, res) => {
  let threads = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  threads = threads.filter(t => t.id != req.params.id);
  fs.writeFileSync(DATA_FILE, JSON.stringify(threads, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
