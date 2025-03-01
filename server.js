const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Подключение к базе данных SQLite
const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Ошибка при подключении к базе данных:", err.message);
    } else {
        console.log("✅ Подключение к базе данных установлено.");
    }
});

// Создаем таблицу, если её нет
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE,
        balance INTEGER DEFAULT NULL
    )
`);

// **Эндпоинт для сохранения telegram_id и генерации balance**
app.post('/save-telegram-id', (req, res) => {
    const { telegram_id } = req.body;

    if (!telegram_id) {
        return res.status(400).json({ error: "Telegram ID не предоставлен." });
    }

    // Проверяем, существует ли пользователь в базе
    db.get('SELECT * FROM users WHERE telegram_id = ?', [telegram_id], (err, row) => {
        if (err) {
            console.error("Ошибка при проверке пользователя:", err.message);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        if (row) {
            // Если пользователь уже существует, просто возвращаем его данные
            return res.status(200).json({ telegram_id: row.telegram_id, balance: row.balance });
        }

        // Генерируем случайный баланс от 1 до 9999
        const balance = Math.floor(Math.random() * 9999) + 1;

        // Добавляем нового пользователя в базу данных
        const stmt = db.prepare("INSERT INTO users (telegram_id, balance) VALUES (?, ?)");
        stmt.run(telegram_id, balance, function (err) {
            if (err) {
                console.error("Ошибка при добавлении пользователя:", err.message);
                return res.status(500).json({ error: "Ошибка при сохранении Telegram ID." });
            }

            res.status(200).json({ telegram_id, balance });
        });
    });
});

// **Эндпоинт для получения баланса пользователя**
app.get('/user/:telegram_id', (req, res) => {
    const telegram_id = req.params.telegram_id;

    db.get('SELECT * FROM users WHERE telegram_id = ?', [telegram_id], (err, row) => {
        if (err) {
            console.error("Ошибка при получении пользователя:", err.message);
            return res.status(500).json({ error: "Ошибка сервера" });
        }

        if (!row) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        res.json({ telegram_id: row.telegram_id, balance: row.balance });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});
