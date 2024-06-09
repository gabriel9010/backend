const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
