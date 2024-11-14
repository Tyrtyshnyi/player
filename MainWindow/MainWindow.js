document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.timecode-slider');
    const timecodeStart = document.querySelector('.timecode-start');
    const timecodeEnd = document.querySelector('.timecode-end');

    let totalDuration = 196; // Общее время трека в секундах

    // Функция форматирования времени в MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Инициализация времени
    timecodeEnd.textContent = formatTime(totalDuration);
    timecodeStart.textContent = formatTime(0);

    // Обновление background для отображения прогресса
    slider.addEventListener('input', () => {
        const value = slider.value;
        const percentage = `${value}%`;

        // Обновление заполненной и незаполненной части ползунка
        slider.style.background = `linear-gradient(to right, #707070 ${percentage}, #424242 ${percentage})`;

        // Обновляем отображение текущего времени
        const currentTime = (value / 100) * totalDuration;
        timecodeStart.textContent = formatTime(currentTime);
    });
});




// Устанавливаем вкладку по умолчанию при загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
    // Устанавливаем вкладку по умолчанию
    const defaultTabButton = document.querySelector('.settings'); // Замените 'home-button' на нужную кнопку
    openTab({ currentTarget: defaultTabButton }, 'settings');
});

function openTab(evt, tabName) {
    // Получаем все элементы с классом 'tab-content' и скрываем их
    let tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    // Получаем все кнопки с классом 'left-panel-button' и убираем класс 'active'
    let tabButtons = document.getElementsByClassName("left-panel-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // Показываем текущую вкладку и добавляем класс 'active' к кнопке
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");

}