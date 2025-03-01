document.addEventListener("DOMContentLoaded", async () => {
    try {
        window.Telegram.WebApp.ready();

        // Получаем данные пользователя из Telegram WebApp API
        const userData = window.Telegram.WebApp.initDataUnsafe;
        const telegram_id = userData?.user?.id;

        console.log("Ваш Telegram ID:", telegram_id);

        if (!telegram_id) {
            throw new Error("Не удалось получить Telegram ID");
        }

        // Отправляем Telegram ID на сервер для сохранения и получения баланса
        const response = await fetch('https://samsbazoy-real-server.up.railway.app/save-telegram-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram_id })
        });

        if (!response.ok) {
            throw new Error("Ошибка при получении данных от сервера");
        }

        const userDataFromServer = await response.json();

        // Вставляем данные в HTML
        const userInfoDiv = document.getElementById("userInfo");
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                <p><strong>Ваш ID:</strong> ${userDataFromServer.telegram_id}</p>
                <p><strong>Баланс:</strong> ${userDataFromServer.balance} ₽</p>
            `;
        }
    } catch (error) {
        console.error("Ошибка:", error.message);
        document.getElementById("userInfo").textContent = "Ошибка загрузки данных";
    }
});
