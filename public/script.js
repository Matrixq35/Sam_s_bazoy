document.addEventListener("DOMContentLoaded", () => {
window.Telegram.WebApp.ready();
window.Telegram.WebApp.expand();

// Получаем элемент для вывода Telegram ID
const telegram_id_HTML = document.getElementById("balanceUser");




// Получаем данные пользователя
const userData = window.Telegram.WebApp.initDataUnsafe;
const telegram_id = userData.user.id;
console.log('Ваш id: ', telegram_id);



// Выводим ID, если элемент существует
telegram_id_HTML.textContent = `Ваш ID: ${telegram_id}`;



// Отправка Telegram ID на сервер для сохранения
fetch('https://samsbazoy-real-server.up.railway.app/save-telegram-id', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ telegram_id: telegram_id })
})
.then(response => response.json())
.then(data => {
    console.log("Данные успешно сохранены:", data);
})
.catch(error => {
    console.error("Ошибка при отправке данных на сервер:", error);
});

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
});