

// Получаем элемент для вывода Telegram ID
const balanceUserHTML = document.getElementById("balanceUser");

window.Telegram.WebApp.ready();
window.Telegram.WebApp.expand();


// Получаем данные пользователя
const userData = window.Telegram.WebApp.initDataUnsafe;
const telegram_id = userData.user.id || "Неизвестный ID";



// Выводим ID, если элемент существует
if (telegram_id_HTML) {
    telegram_id_HTML.textContent = `Ваш ID: ${telegram_id}`;
} else {
    console.warn("Элемент #telegram_id не найден в HTML.");
}



// Отправка Telegram ID на сервер для сохранения
fetch('http://localhost:3000/save-telegram-id', {
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
