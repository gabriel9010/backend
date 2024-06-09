const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware per il parsing del body delle richieste
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connetti al database SQLite
let db = new sqlite3.Database('./app.db');

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

// Endpoint di registrazione
app.post('/register', (req, res) => {
  const { email, password, verificationToken } = req.body;

  if (!email || !password || !verificationToken) {
    return res.status(400).send('Dati mancanti');
  }

  db.run('INSERT INTO users (email, password, isVerified, verificationToken) VALUES (?, ?, ?, ?)', [email, password, 0, verificationToken], function(err) {
    if (err) {
      return res.status(500).send('Errore durante la registrazione');
    }

    res.send({ id: this.lastID });
  });
});

// Endpoint di login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Dati mancanti');
  }

  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) {
      return res.status(500).send('Errore nel server');
    }

    if (!row) {
      return res.status(400).send('Email o password non corretti');
    }

    if (row.isVerified !== 1) {
      return res.status(400).send('Email non verificata');
    }

    res.send({ id: row.id, email: row.email });
  });
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
