const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const app = express();
const port = process.env.PORT || 3000; // Используем порт от Railway или 3000 по умолчанию

// Настройка body-parser для обработки JSON
app.use(express.json());

// Создание базы данных SQLite и таблицы (если не существует)
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error("Ошибка при подключении к базе данных: ", err.message);
    } else {
        console.log("Подключение к базе данных установлено.");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id TEXT UNIQUE
    )
`);

// Обработка POST запроса для сохранения telegram_id
app.post('/save-telegram-id', (req, res) => {
    console.log("Полученные данные:", req.body);  // Логируем тело запроса
    const { telegram_id } = req.body;
    
    if (!telegram_id) {
        return res.status(400).send("Telegram ID не предоставлен.");
    }

    const stmt = db.prepare("INSERT OR IGNORE INTO users (telegram_id) VALUES (?)");
    stmt.run(telegram_id, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Ошибка при сохранении Telegram ID.");
        }
        res.status(200).send({ message: "Telegram ID сохранен успешно." });
    });
});

// Настройка Express для обслуживания статических файлов
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
