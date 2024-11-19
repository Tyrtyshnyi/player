document.addEventListener("DOMContentLoaded", () => {
    const openTabSelect = document.getElementById("openTabSelect");

    // Устанавливаем выбранное значение при загрузке страницы
    const savedTab = localStorage.getItem("defaultTab") || "1"; // "1" — вкладка по умолчанию
    openTabSelect.value = savedTab;

    // Устанавливаем выбранную вкладку при загрузке приложения
    setDefaultTab(savedTab);

    // Добавляем обработчик изменения выбора
    openTabSelect.addEventListener("change", (event) => {
        const selectedValue = event.target.value;
        localStorage.setItem("defaultTab", selectedValue);
        console.log(`Вкладка по умолчанию изменена на: ${getTabNameByValue(selectedValue)}`);
    });
});


function setDefaultTab(tabValue) {
    const tabName = getTabNameByValue(tabValue);
    console.log(`Попытка установить вкладку по умолчанию: ${tabName}`);

    const defaultTabButton = document.querySelector(`.left-panel-button[data-tab="${tabName}"]`);
    if (defaultTabButton) {
        console.log(`Кнопка для вкладки "${tabName}" найдена. Устанавливаем...`);
        openTab({ currentTarget: defaultTabButton }, tabName);
    } else {
        console.error(`Кнопка для вкладки "${tabName}" не найдена. Проверьте наличие атрибута data-tab.`);
    }
}

function getTabNameByValue(value) {
    switch (value) {
        case "1":
            return "home";
        case "2":
            return "all-tracks";
        case "3":
            return "playlists";
        case "4":
            return "favorite";
        case "5":
            return "search";
        default:
            console.warn(`Неизвестное значение вкладки: ${value}. Используем "home".`);
            return "home";
    }
}
