// Переменные для управления плеером
const playButton = document.getElementById('play-btn');
const progressBar = document.getElementById('progress-bar');
const volumeBar = document.getElementById('volume-bar');
const currentTimeDisplay = document.getElementById('current-time');
const totalTimeDisplay = document.getElementById('total-time');
let isPlaying = false;
let currentTime = 86; // В секундах (примерно 01:26)
let totalTime = 196;  // В секундах (примерно 03:16)

// Обработчик кнопки воспроизведения/паузы
playButton.addEventListener('click', () => {
    if (isPlaying) {
        // Пауза
        playButton.textContent = '⏯️'; // Изменить на кнопку Play
        isPlaying = false;
    } else {
        // Воспроизведение
        playButton.textContent = '⏸️'; // Изменить на кнопку Pause
        isPlaying = true;
    }
});

// Обработчик для кнопок управления треками
document.getElementById('prev-btn').addEventListener('click', () => {
    console.log('Previous track');
});

document.getElementById('next-btn').addEventListener('click', () => {
    console.log('Next track');
});

document.getElementById('shuffle-btn').addEventListener('click', () => {
    console.log('Shuffle');
});

document.getElementById('repeat-btn').addEventListener('click', () => {
    console.log('Repeat');
});

// Обновление текущего времени и прогресс-бара
function updateProgress() {
    if (isPlaying) {
        currentTime++;
        if (currentTime >= totalTime) {
            currentTime = 0; // Сбросить в начало
            isPlaying = false;
            playButton.textContent = '⏯️'; // Вернуть значок play
        }
        const progressPercentage = (currentTime / totalTime) * 100;
        progressBar.value = progressPercentage;
        currentTimeDisplay.textContent = formatTime(currentTime);
    }
}

// Форматировать время в MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Запустить обновление прогресс-бара каждую секунду
setInterval(updateProgress, 1000);

// Обработка громкости
volumeBar.addEventListener('input', (e) => {
    console.log(`Volume: ${e.target.value}`);
});