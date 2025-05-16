const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('messages.db');

// initialize the table
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    time INTEGER NOT NULL
  )
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

app.post('/messages', (req, res) => {
  const { author, text } = req.body;
  const time = Date.now();
  db.run(
    `INSERT INTO messages (author, text, time) VALUES (?, ?, ?)`,
    [author, text, time],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.get('/messages', (req, res) => {
  db.all(
    `SELECT author, text, time FROM messages ORDER BY time DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
