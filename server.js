const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" })); // Разрешаем доступ отовсюду
app.use(bodyParser.json());

// 📌 Раздача статических файлов (HTML, CSS, JS) из папки public
app.use(express.static(path.join(__dirname, "public")));

// Подключение к базе данных SQLite
const db = new sqlite3.Database("./database.sqlite", (err) => {
    if (err) {
        console.error("Ошибка подключения к БД:", err.message);
    } else {
        console.log("✅ Подключено к базе данных SQLite");
    }
});

// Создание таблицы, если её нет
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE,
        balance INTEGER DEFAULT 0
    )
`);

// 📌 Отдаём HTML-страницу при GET-запросе на "/"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 📌 Получение баланса пользователя
app.get("/balance/:user_id", (req, res) => {
    const { user_id } = req.params;  // Извлекаем user_id из URL

    // Ищем пользователя в базе данных
    db.get(
        "SELECT balance FROM users WHERE user_id = ?",
        [user_id],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (row) {
                // Если пользователь найден — возвращаем его баланс
                res.json({ balance: row.balance });
            } else {
                // Если пользователя нет — создаем его с нулевым балансом
                db.run(
                    "INSERT INTO users (user_id, balance) VALUES (?, ?)",
                    [user_id, 0],
                    function (err) {
                        if (err) {
                            res.status(500).json({ error: err.message });
                        } else {
                            res.json({ balance: 0 });
                        }
                    }
                );
            }
        }
    );
});

// 📌 Обновление баланса пользователя
app.post("/balance/update", (req, res) => {
    const { user_id, balance } = req.body;  // Получаем данные из тела запроса

    // Обновляем баланс пользователя в базе данных
    db.run(
        "UPDATE users SET balance = ? WHERE user_id = ?",
        [balance, user_id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ success: true });
            }
        }
    );
});

// 📌 Запуск сервера
app.listen(port, () => {
    console.log(`✅ Сервер запущен на http://localhost:${port}`);
});
