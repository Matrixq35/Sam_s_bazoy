const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./database.sqlite", (err) => {
    if (err) {
        console.error("Ошибка подключения к БД:", err.message);
    } else {
        console.log("✅ Подключено к базе данных SQLite");
    }
});

// Создание таблицы (если её нет)
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE,
        balance INTEGER DEFAULT 0
    )
`);

// 📌 Получение баланса пользователя
app.get("/balance/:user_id", (req, res) => {
    const { user_id } = req.params;

    db.get("SELECT balance FROM users WHERE user_id = ?", [user_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.json({ balance: row.balance });
        } else {
            db.run("INSERT INTO users (user_id, balance) VALUES (?, ?)", [user_id, 0], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ balance: 0 });
            });
        }
    });
});

// 📌 Обновление баланса
app.post("/balance/update", (req, res) => {
    const { user_id, balance } = req.body;

    db.get("SELECT * FROM users WHERE user_id = ?", [user_id], (err, row) => {
        if (err) {
            console.error("Ошибка при поиске пользователя:", err.message);
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            console.error(`❌ Пользователь ${user_id} не найден в базе`);
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        db.run("UPDATE users SET balance = ? WHERE user_id = ?", [balance, user_id], function (err) {
            if (err) {
                console.error("Ошибка при обновлении баланса:", err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log(`✅ Баланс пользователя ${user_id} обновлен: ${balance}`);
            res.json({ success: true });
        });
    });
});

// 📌 Эндпоинт для скачивания базы данных
app.get("/download-db", (req, res) => {
    const filePath = path.join(__dirname, "database.sqlite");
    res.download(filePath, "database.sqlite", (err) => {
        if (err) {
            console.error("Ошибка при скачивании базы данных:", err);
            res.status(500).send("Ошибка при скачивании файла.");
        }
    });
});

// 📌 Запуск сервера
app.listen(port, () => {
    console.log(`✅ Сервер запущен на http://localhost:${port}`);
});
