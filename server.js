const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err.message);
  } else {
    console.log("Подключено к базе данных SQLite");
  }
});

// Создаём таблицу пользователей (если не существует)
db.run(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT UNIQUE,
    balance INTEGER DEFAULT 0
  )`
);

// Получить баланс пользователя по Telegram ID.
// Если пользователь не найден, создаём запись с балансом 0.
app.get("/balance/:telegram_id", (req, res) => {
  const { telegram_id } = req.params;
  db.get("SELECT balance FROM users WHERE telegram_id = ?", [telegram_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      // Пользователь найден – возвращаем баланс
      res.json({ balance: row.balance });
    } else {
      // Пользователь не найден – создаём запись с балансом 0
      db.run("INSERT INTO users (telegram_id, balance) VALUES (?, 0)", [telegram_id], (err2) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }
        res.json({ balance: 0 });
      });
    }
  });
});

// Добавить или обновить баланс пользователя (при нажатии кнопки)
app.post("/balance", (req, res) => {
  const { telegram_id, amount } = req.body;
  if (!telegram_id || typeof amount !== "number") {
    return res.status(400).json({ error: "Неверные данные" });
  }
  db.run(
    "INSERT INTO users (telegram_id, balance) VALUES (?, ?) ON CONFLICT(telegram_id) DO UPDATE SET balance = balance + ?",
    [telegram_id, amount, amount],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});