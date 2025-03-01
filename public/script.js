document.addEventListener("DOMContentLoaded", async () => {
    try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();

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

         // Переключение вкладок
    const buttons = document.querySelectorAll(".nav-btn");
    const sections = document.querySelectorAll(".tab-content");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const target = button.getAttribute("data-target");

            // Убираем активный класс у всех кнопок
            buttons.forEach(btn => btn.classList.remove("active"));

            // Добавляем активный класс нажатой кнопке
            button.classList.add("active");
            console.log('кнопка нажата');
            
            // Скрываем все секции
            sections.forEach(section => section.classList.remove("active"));

            // Показываем нужную секцию
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.classList.add("active");
            } else {
                console.warn(`Секция с ID ${target} не найдена!`);
            }
        });
    });

        const userDataFromServer = await response.json();

        // Вставляем данные в HTML
        const userInfoDiv = document.getElementById("userInfo");
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `
                <p><strong>Ваш ID:</strong> ${userDataFromServer.telegram_id}</p>
                <p><strong>Баланс:</strong> ${userDataFromServer.balance} VITS</p>
            `;
        }
    } catch (error) {
        console.error("Ошибка:", error.message);
        document.getElementById("userInfo").textContent = "Ошибка загрузки данных";
    }

});
