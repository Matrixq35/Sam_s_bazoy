const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 8080;

// Подключаем CORS для работы с клиентом
app.use(cors());
app.use(express.json());

// Подключение к базе данных
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Ошибка при подключении к базе данных", err.message);
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

// Получить баланс пользователя по Telegram ID
app.get("/balance/:telegram_id", (req, res) => {
    const { telegram_id } = req.params;

    db.get(
        "SELECT balance FROM users WHERE telegram_id = ?",
        [telegram_id],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (row) {
                res.json({ balance: row.balance });
            } else {
                res.json({ balance: 0 }); // Если пользователя нет, баланс 0
            }
        }
    );
});

// Добавить или обновить баланс пользователя
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
                res.status(500).json({ error: err.message });
            } else {
                res.json({ success: true, newBalance: amount });
            }
        }
    );
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
