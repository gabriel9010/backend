const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');  // Importa il middleware CORS
const app = express();
const port = 3000;

// Middleware per il parsing del corpo delle richieste JSON
app.use(bodyParser.json());
app.use(cors());  // Usa il middleware CORS

// Connetti al database SQLite
let db = new sqlite3.Database('./app.db', (err) => {
  if (err) {
    console.error('Errore durante la connessione al database:', err.message);
  } else {
    console.log('Connesso al database SQLite.');
  }
});

// Creazione delle tabelle se non esistono
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      isVerified INTEGER DEFAULT 0,
      verificationToken TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      amount REAL,
      date TEXT,
      type TEXT
    )
  `);
});

// Endpoint per la verifica dell'email
app.get('/verify', (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).send('Token mancante');
  }

  db.get('SELECT * FROM users WHERE verificationToken = ?', [token], (err, row) => {
    if (err) {
      return res.status(500).send('Errore nel server');
    }

    if (!row) {
      return res.status(400).send('Token non valido');
    }

    db.run('UPDATE users SET isVerified = 1, verificationToken = NULL WHERE id = ?', [row.id], function(err) {
      if (err) {
        return res.status(500).send('Errore nel server');
      }

      res.send('Email verificata con successo');
    });
  });
});

// Endpoint per la registrazione
app.post('/register', (req, res) => {
  const { email, password, verificationToken } = req.body;

  if (!email || !password || !verificationToken) {
    return res.status(400).send('Email, password e token di verifica sono obbligatori');
  }

  db.run('INSERT INTO users (email, password, verificationToken) VALUES (?, ?, ?)', 
    [email, password, verificationToken], function(err) {
    if (err) {
      return res.status(500).send('Errore nel server: ' + err.message);
    }

    res.json({ id: this.lastID });
  });
});

// Endpoint per il login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email e password sono obbligatorie');
  }

  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) {
      return res.status(500).send('Errore nel server');
    }

    if (!row) {
      return res.status(400).send('Email o password non validi');
    }

    if (!row.isVerified) {
      return res.status(400).send('Email non verificata');
    }

    res.send('Login avvenuto con successo');
  });
});

// Funzione per generare token di verifica
function generateToken() {
  return crypto.randomBytes(32).toString('base64url');
}

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
