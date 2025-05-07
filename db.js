const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // vazio no XAMPP
  database: 'agendamento_luaris',
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('✅ Conectado ao MySQL via XAMPP!');
  }
});

module.exports = db;
