document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.querySelector('.progress-bar');
    const lineChild = document.querySelector('.lineChild');
    const currentTimeElement = document.getElementById('current-time');
    const totalTimeElement = document.getElementById('total-time');

    let totalDuration = 196; // Общее время трека в секундах (примерно 03:16)
    let currentTime = 0; // Начальное значение текущего времени



    // Функция обновления прогресс-бара и времени
    function updateProgressBar(current) {
        const progressPercentage = (current / totalDuration) * 100;
        lineChild.style.width = `${progressPercentage}%`;
        currentTimeElement.textContent = formatTime(current);
    }

    // Форматирование времени в MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Обновление прогресса при перемещении ползунка
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / progressBar.offsetWidth) * totalDuration;
        currentTime = newTime;
        updateProgressBar(currentTime);
    });

    // Логика для перетаскивания ползунка
    let isDragging = false;

    // Начало перетаскивания
    lineChild.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateFromEvent(e);
    });

    // Обработка события перетаскивания
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            updateFromEvent(e);
        }
    });

    // Завершение перетаскивания
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
        }
    });

    // Обновление значения при перетаскивании
    function updateFromEvent(e) {
        const rect = progressBar.getBoundingClientRect();
        let clickX = e.clientX - rect.left;

        // Ограничиваем значения от 0 до ширины прогресс-бара
        if (clickX < 0) clickX = 0;
        if (clickX > progressBar.offsetWidth) clickX = progressBar.offsetWidth;

        const newTime = (clickX / progressBar.offsetWidth) * totalDuration;
        currentTime = newTime;
        updateProgressBar(currentTime);
    }

    // Инициализация начального значения
    updateProgressBar(currentTime);
});


document.addEventListener('DOMContentLoaded', () => {
    const volumeBar = document.querySelector('.volume-bar');
    const volumeLevel = document.querySelector('.volume-level');
    const volumeIcon = document.getElementById('volume-icon');

    let volume = 50; // Начальное значение громкости (от 0 до 100)

    // Функция обновления полосы громкости и иконки
    function updateVolumeBar(currentVolume) {
        const volumePercentage = currentVolume; // Так как громкость в процентах (от 0 до 100)
        volumeLevel.style.width = `${volumePercentage}%`;
        updateVolumeIcon(currentVolume);
    }

    // Функция для обновления иконки громкости
    function updateVolumeIcon(currentVolume) {
        if (currentVolume === 0) {
            volumeIcon.textContent = '🔇'; // Иконка выключенной громкости
        } else if (currentVolume > 0 && currentVolume <= 50) {
            volumeIcon.textContent = '🔉'; // Иконка средней громкости
        } else {
            volumeIcon.textContent = '🔊'; // Иконка высокой громкости
        }
    }

    // Обновление громкости при клике на полосу громкости
    volumeBar.addEventListener('click', (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newVolume = (clickX / volumeBar.offsetWidth) * 100;
        volume = newVolume;
        updateVolumeBar(volume);
    });

    // Логика для перетаскивания бегунка громкости
    let isDraggingVolume = false;

    // Начало перетаскивания
    volumeLevel.addEventListener('mousedown', (e) => {
        isDraggingVolume = true;
        updateVolumeFromEvent(e);
    });

    // Обработка события перетаскивания
    document.addEventListener('mousemove', (e) => {
        if (isDraggingVolume) {
            updateVolumeFromEvent(e);
        }
    });

    // Завершение перетаскивания
    document.addEventListener('mouseup', () => {
        if (isDraggingVolume) {
            isDraggingVolume = false;
        }
    });

    // Обновление громкости при перетаскивании
    function updateVolumeFromEvent(e) {
        const rect = volumeBar.getBoundingClientRect();
        let clickX = e.clientX - rect.left;

        // Ограничиваем значения от 0 до ширины полосы громкости
        if (clickX < 0) clickX = 0;
        if (clickX > volumeBar.offsetWidth) clickX = volumeBar.offsetWidth;

        const newVolume = (clickX / volumeBar.offsetWidth) * 100;
        volume = newVolume;
        updateVolumeBar(volume);
    }

    // Инициализация начального значения громкости
    updateVolumeBar(volume);
});