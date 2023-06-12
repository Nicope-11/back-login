const bcrypt = require('bcrypt');
const express = require("express");
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "xeneise12",
  database: "login"
});

app.get('/', (req, res) => {
  const sql = 'SELECT * FROM User';
  db.query(sql, (err, result) => {
    if (err) return res.json({ message: err });
    return res.json(result);
  });
});

app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  const sql = "SELECT * FROM User WHERE usuario = ?";
  db.query(sql, [usuario], (err, data) => {
    if (err) {
      return res.json(err);
    }
    if (data.length > 0) {
      const hashedPassword = data[0].password; // Obtén la contraseña hasheada almacenada en la base de datos
      bcrypt.compare(password, hashedPassword, (compareErr, result) => {
        if (compareErr) {
          return res.json(compareErr);
        }
        if (result) {
          return res.json("Success");
        } else {
          return res.json("Invalid credentials");
        }
      });
    } else {
      return res.json("Invalid credentials");
    }
  });
});

app.post('/api/users', (req, res) => {
  const { name, password } = req.body;

  // Verifica si el nombre de usuario ya existe en la base de datos
  const checkUserQuery = 'SELECT * FROM User WHERE usuario = ?';
  db.query(checkUserQuery, [name], (checkUserErr, checkUserData) => {
    if (checkUserErr) {
      return res.json(checkUserErr);
    }
    if (checkUserData.length > 0) {
      return res.json({ message: 'El nombre de usuario ya está en uso' });
    }

    // Genera el hash de la contraseña
    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        return res.json(hashErr);
      }

      // Inserta el nuevo usuario en la base de datos
      const insertUserQuery = 'INSERT INTO User (usuario, password) VALUES (?, ?)';
      db.query(insertUserQuery, [name, hashedPassword], (insertUserErr, insertUserResult) => {
        if (insertUserErr) {
          return res.json(insertUserErr);
        }
        return res.json({ message: 'Usuario creado exitosamente' });
      });
    });
  });
});

app.listen(8081, () => {
  console.log("Listening");
});
