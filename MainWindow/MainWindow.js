// MainWindow.js

// Переменные для плеера
let currentAudio = null;
let currentPlayingTrack = null;
let tracks = [];
let currentTrackIndex = -1; // Начинаем без выбранного трека
let isRepeat = true;
let isShuffle = false;

// Переменные для элементов управления
let playBtn, pauseBtn, prevBtn, nextBtn, repeatBtn, shuffleBtn, volumeIcon;
let timecodeSlider, timecodeStart, timecodeEnd;
let volumeBar, volumeLevel;
let coverImage, trackTitle, trackArtist;

// Переменная для отслеживания перетаскивания громкости
let isVolumeDragging = false;

// Импорт необходимых модулей
const fs = require('fs');
const path = require('path');
const { parseBuffer } = require('music-metadata-browser');
const audioDirectory = path.join('D:/Music'); // Укажите путь к вашей музыкальной папке

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Загрузка DOM контента...");
    // Получение элементов управления
    playBtn = document.getElementById('play-btn');
    pauseBtn = document.getElementById('pause-btn');
    prevBtn = document.getElementById('prev-btn');
    nextBtn = document.getElementById('next-btn');
    repeatBtn = document.getElementById('repeat-btn');
    shuffleBtn = document.getElementById('shuffle-btn');
    volumeIcon = document.getElementById('volume-icon');
    timecodeSlider = document.querySelector('.timecode-slider');
    timecodeStart = document.querySelector('.timecode-start');
    timecodeEnd = document.querySelector('.timecode-end');
    volumeBar = document.querySelector('.volume-bar');
    volumeLevel = document.querySelector('.volume-level');
    coverImage = document.getElementById('cover');
    trackTitle = document.getElementById('title');
    trackArtist = document.getElementById('artist');

    // Инициализация плеера
    console.log("Инициализация плеера...");
    initPlayer();

    // Загрузка аудиофайлов при загрузке приложения
    console.log("Загрузка аудиофайлов...");
    await loadAudioFiles(audioDirectory);

    // Устанавливаем вкладку по умолчанию активной при загрузке приложения
    const savedTabValue = localStorage.getItem("defaultTab") || "1";
    const defaultTabName = getTabNameByValue(savedTabValue);

    console.log(`Открытие вкладки по умолчанию: ${defaultTabName}`);
    openDefaultTab(defaultTabName);
});

function initPlayer() {
    console.log("Привязка обработчиков событий плеера...");
    // Привязка обработчиков событий
    playBtn.addEventListener('click', () => {
        console.log("Нажата кнопка 'Play'");
        if (currentAudio) {
            currentAudio.play();
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            currentPlayingTrack?.classList.add('playing');
            console.log(`Воспроизведение трека: ${trackTitle.textContent} - ${trackArtist.textContent}`);
        }
    });

    pauseBtn.addEventListener('click', () => {
        console.log("Нажата кнопка 'Pause'");
        if (currentAudio) {
            currentAudio.pause();
            playBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            console.log("Воспроизведение приостановлено");
        }
    });

    prevBtn.addEventListener('click', () => {
        console.log("Нажата кнопка 'Previous'");
        prevTrack();
    });

    nextBtn.addEventListener('click', () => {
        console.log("Нажата кнопка 'Next'");
        nextTrack();
    });

    repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
        console.log(`Режим повтора: ${isRepeat ? 'включен' : 'выключен'}`);
    });

    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        console.log(`Режим случайного воспроизведения: ${isShuffle ? 'включен' : 'выключен'}`);
    });

    // Управление прогрессбаром при перемотке
    timecodeSlider.addEventListener('input', () => {
        if (currentAudio) {
            currentAudio.currentTime = timecodeSlider.value;
            updateTime();
            console.log(`Перемотка на: ${formatTime(currentAudio.currentTime)}`);
        }
    });

    // Управление громкостью при клике и перетаскивании
    volumeBar.addEventListener('mousedown', (e) => {
        isVolumeDragging = true;
        setVolume(e);
    });

    document.addEventListener('mousemove', (e) => {
        if (isVolumeDragging) {
            setVolume(e);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isVolumeDragging) {
            isVolumeDragging = false;
        }
    });

    // Обновление иконки громкости
    volumeIcon.addEventListener('click', () => {
        if (currentAudio) {
            if (currentAudio.volume > 0) {
                currentAudio.volume = 0;
                volumeLevel.style.width = '0%';
                console.log("Звук выключен");
            } else {
                currentAudio.volume = 1;
                volumeLevel.style.width = '100%';
                console.log("Звук включен на 100%");
            }
            updateVolumeIcon();
        }
    });

    // Инициализация ползунка времени на 0
    timecodeSlider.value = 0;
    timecodeStart.textContent = '00:00';
    timecodeEnd.textContent = '00:00';
}

function setVolume(e) {
    const rect = volumeBar.getBoundingClientRect();
    let volume = (e.clientX - rect.left) / rect.width;
    volume = Math.max(0, Math.min(volume, 1)); // Ограничиваем диапазон от 0 до 1
    if (currentAudio) {
        currentAudio.volume = volume;
        console.log(`Установлена громкость: ${Math.round(volume * 100)}%`);
    }
    volumeLevel.style.width = `${volume * 100}%`;
    updateVolumeIcon();
}

// Функция для открытия вкладки по умолчанию при загрузке приложения
function openDefaultTab(tabName) {
    const defaultTabButton = document.querySelector(`.left-panel-button[data-tab="${tabName}"]`);
    if (defaultTabButton) {
        console.log(`Кнопка для вкладки "${tabName}" найдена. Открываем вкладку...`);
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

function openTab(evt, tabName) {
    console.log(`Открытие вкладки: ${tabName}`);
    let tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    let tabButtons = document.getElementsByClassName("left-panel-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    document.getElementById(tabName)?.classList.add("active");
    evt?.currentTarget?.classList.add('active');

    if (tabName === 'all-tracks') {
        displayTracks();
    }
}

// Рекурсивная функция для загрузки аудиофайлов из директории и её поддиректорий
async function loadAudioFiles(directory) {
    console.log(`Чтение директории: ${directory}`);
    try {
        const files = await fs.promises.readdir(directory, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(directory, file.name);

            if (file.isDirectory()) {
                console.log(`Обнаружена поддиректория: ${fullPath}`);
                await loadAudioFiles(fullPath);
            } else {
                const ext = path.extname(file.name).toLowerCase();
                if (['.mp3', '.wav', '.flac', '.ogg'].includes(ext)) {
                    console.log(`Обнаружен аудиофайл: ${fullPath}`);
                    const trackInfo = await loadAudioMetadata(fullPath);
                    if (trackInfo) {
                        const index = tracks.length;
                        trackInfo.index = index;
                        tracks.push(trackInfo);
                        console.log(`Добавлен трек: ${trackInfo.title} - ${trackInfo.artist}`);
                    }
                }
            }
        }

        // После загрузки всех аудиофайлов проверяем наличие сохраненного трека
        const lastPlayedIndex = localStorage.getItem('lastPlayedTrackIndex');
        if (lastPlayedIndex !== null && tracks.length > 0) {
            currentTrackIndex = parseInt(lastPlayedIndex, 10);
            if (currentTrackIndex >= 0 && currentTrackIndex < tracks.length) {
                const track = tracks[currentTrackIndex];
                // Инициализируем плеер без автоматического воспроизведения
                loadTrackIntoPlayer(track.src, track.metadata, currentTrackIndex, track.filename);
            }
        }
    } catch (err) {
        console.error("Ошибка чтения папки:", err);
    }
}

// Функция для загрузки метаданных аудиофайла
async function loadAudioMetadata(filePath) {
    console.log(`Загрузка метаданных для файла: ${filePath}`);
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const metadata = await parseBuffer(fileBuffer, { mimeType: 'audio/mpeg', size: fileBuffer.length });
        let { title, artist, picture } = metadata.common;

        if (!title || !artist) {
            const extracted = extractTitleAndArtistFromFilename(path.basename(filePath));
            title = title || extracted.title;
            artist = artist || extracted.artist;
            console.log(`Извлечены данные из имени файла: ${artist} - ${title}`);
        }

        const cover = picture && picture.length > 0
            ? `data:image/jpeg;base64,${Buffer.from(picture[0].data).toString('base64')}`
            : './1.png'; // Обновите путь при необходимости

        return {
            title,
            artist,
            src: filePath,
            cover,
            metadata,
            filename: path.basename(filePath)
        };
    } catch (error) {
        console.error("Ошибка чтения метаданных:", error);
        return null;
    }
}

// Функция для отображения списка треков
function displayTracks() {
    console.log("Отображение списка треков...");
    const audioList = document.querySelector('.track-list');
    if (!audioList) {
        console.error("Элемент .track-list не найден");
        return;
    }

    // Очищаем предыдущий список, если есть
    audioList.innerHTML = '';

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const index = i;

        // Создаем элемент списка треков
        const audioItem = document.createElement('div');
        audioItem.classList.add('item-track');
        audioItem.dataset.index = index; // Сохраняем индекс трека

        audioItem.innerHTML = `
            <div class="item-cover">
                <img alt="Cover Image" src="${track.cover}" />
            </div>
            <div class="item-info">
                <div class="item-title">${track.title}</div>
                <div class="item-artist">${track.artist}</div>
            </div>
        `;

        audioItem.addEventListener('click', () => {
            console.log(`Выбран трек: ${track.title} - ${track.artist}`);
            if (currentTrackIndex === index) {
                togglePlayPause();
            } else {
                playTrackByIndex(index);
            }
        });

        audioList.appendChild(audioItem);
    }
}

// Функция для извлечения названия и исполнителя из имени файла
function extractTitleAndArtistFromFilename(filename) {
    console.log(`Извлечение информации из имени файла: ${filename}`);
    const baseName = filename.replace(/\.[^/.]+$/, "");
    const parts = baseName.split(" - ");
    if (parts.length >= 2) {
        const artist = parts[0].trim();
        const title = parts.slice(1).join(" - ").trim();
        return { artist, title };
    }
    return { artist: "Unknown Artist", title: baseName };
}

// Функция для воспроизведения трека по индексу
function playTrackByIndex(index) {
    console.log(`Воспроизведение трека с индексом: ${index}`);
    const track = tracks[index];
    if (track) {
        currentTrackIndex = index;
        playAudio(track.src, track.metadata, index, track.filename);
        localStorage.setItem('lastPlayedTrackIndex', index); // Сохраняем индекс последнего трека
    } else {
        console.error(`Трек с индексом ${index} не найден.`);
    }
}

function togglePlayPause() {
    if (currentAudio) {
        if (currentAudio.paused) {
            console.log("Продолжение воспроизведения");
            currentAudio.play().catch(error => console.error("Ошибка при возобновлении воспроизведения:", error));
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            currentPlayingTrack?.classList.add('playing');
        } else {
            console.log("Пауза воспроизведения");
            currentAudio.pause();
            playBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            currentPlayingTrack?.classList.remove('playing');
        }
    }
}

function playAudio(filePath, metadata, index, filename) {
    console.log(`Запуск воспроизведения: ${filename}`);
    if (currentAudio) {
        currentAudio.pause();
        console.log("Остановка текущего трека");
    }

    currentAudio = new Audio(filePath);
    currentAudio.play().catch(error => console.error("Ошибка при воспроизведении аудио:", error));

    // Обновление UI
    updatePlayerUI(metadata, filePath, filename);

    // Обновление кнопок воспроизведения
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';

    // Обновление текущего трека
    if (currentPlayingTrack) {
        currentPlayingTrack.classList.remove('playing');
    }
    currentPlayingTrack = document.querySelector(`.item-track[data-index="${index}"]`);
    if (currentPlayingTrack) {
        currentPlayingTrack.classList.add('playing');
    }

    // Обновление времени окончания после загрузки метаданных
    currentAudio.addEventListener('loadedmetadata', () => {
        console.log('Событие loadedmetadata сработало');
        timecodeEnd.textContent = formatTime(currentAudio.duration);
        timecodeSlider.max = currentAudio.duration || 0;
        timecodeSlider.value = 0;
        updateTime();
    });




    // Обновление прогрессбара во время воспроизведения
    currentAudio.addEventListener('timeupdate', updateTime);

    // Обновление времени при паузе
    currentAudio.addEventListener('pause', updateTime);

    // Обработчик окончания трека
    currentAudio.addEventListener('ended', () => {
        console.log("Трек завершён");
        if (isRepeat) {
            console.log("Повтор трека");
            currentAudio.currentTime = 0;
            currentAudio.play();
        } else {
            nextTrack();
        }
    });

    // Обновление громкости при старте трека
    if (currentAudio) {
        currentAudio.volume = parseFloat(volumeLevel.style.width) / 100 || 1;
        currentAudio.addEventListener('volumechange', updateVolumeIcon);
        console.log(`Громкость установлена на: ${Math.round(currentAudio.volume * 100)}%`);
    }
}

function loadTrackIntoPlayer(filePath, metadata, index, filename) {
    console.log(`Загрузка трека в плеер без воспроизведения: ${filename}`);
    if (currentAudio) {
        currentAudio.pause();
    }

    currentAudio = new Audio(filePath);

    // Обновление UI
    updatePlayerUI(metadata, filePath, filename);

    // Обновление текущего трека
    if (currentPlayingTrack) {
        currentPlayingTrack.classList.remove('playing');
    }
    currentPlayingTrack = document.querySelector(`.item-track[data-index="${index}"]`);
    if (currentPlayingTrack) {
        currentPlayingTrack.classList.add('playing');
    }

    // Обновление времени окончания после загрузки метаданных
    currentAudio.addEventListener('loadedmetadata', () => {
        timecodeEnd.textContent = formatTime(currentAudio.duration);
        timecodeSlider.max = currentAudio.duration || 0;
        updateTime(); // Обновляем время сразу после загрузки метаданных
        console.log(`Длительность трека: ${formatTime(currentAudio.duration)}`);
    });

    // Обновление громкости при загрузке трека
    if (currentAudio) {
        currentAudio.volume = parseFloat(volumeLevel.style.width) / 100 || 1;
        currentAudio.addEventListener('volumechange', updateVolumeIcon);
        console.log(`Громкость установлена на: ${Math.round(currentAudio.volume * 100)}%`);
    }
}

function updatePlayerUI(metadata, filePath, filename) {
    console.log("Обновление интерфейса плеера...");
    let title = metadata.common.title;
    let artist = metadata.common.artist;

    if (!title || !artist) {
        const extracted = extractTitleAndArtistFromFilename(filename);
        title = title || extracted.title;
        artist = artist || extracted.artist;
    }

    trackTitle.textContent = title || filename || 'Unknown Title';
    trackArtist.textContent = artist || 'Unknown Artist';
    console.log(`Текущий трек: ${trackTitle.textContent} - ${trackArtist.textContent}`);

    if (metadata.common.picture && metadata.common.picture.length > 0) {
        const coverData = metadata.common.picture[0].data;
        coverImage.src = `data:image/jpeg;base64,${Buffer.from(coverData).toString('base64')}`;
        console.log("Обложка трека обновлена");
    } else {
        coverImage.src = './1.png'; // Обновите путь при необходимости
        console.log("Установлена обложка по умолчанию");
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60) || 0;
    const secs = Math.floor(seconds % 60) || 0;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTime() {
    if (currentAudio && timecodeStart && timecodeSlider) {
        timecodeStart.textContent = formatTime(currentAudio.currentTime);
        timecodeSlider.value = currentAudio.currentTime;
        const progressPercent = (currentAudio.currentTime / currentAudio.duration) * 100 || 0;
        timecodeSlider.style.background = `linear-gradient(to right, #00dcff ${progressPercent}%, #707070 ${progressPercent}%)`;
        // console.log(`Обновление времени: ${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`);
    }
}

function prevTrack() {
    console.log("Переключение на предыдущий трек");
    if (tracks.length === 0) return;
    if (isShuffle) {
        playRandomTrack();
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        playTrackByIndex(currentTrackIndex);
    }
}

function nextTrack() {
    console.log("Переключение на следующий трек");
    if (tracks.length === 0) return;
    if (isShuffle) {
        playRandomTrack();
    } else {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        playTrackByIndex(currentTrackIndex);
    }
}

function updateVolumeIcon() {
    if (currentAudio.volume === 0) {
        volumeIcon.textContent = '🔇';
        console.log("Иконка громкости: звук выключен");
    } else if (currentAudio.volume < 0.5) {
        volumeIcon.textContent = '🔉';
        console.log("Иконка громкости: низкая громкость");
    } else {
        volumeIcon.textContent = '🔊';
        console.log("Иконка громкости: высокая громкость");
    }
}

function playRandomTrack() {
    console.log("Воспроизведение случайного трека");
    if (tracks.length === 0) return;
    let randomIndex = Math.floor(Math.random() * tracks.length);
    while (randomIndex === currentTrackIndex && tracks.length > 1) {
        randomIndex = Math.floor(Math.random() * tracks.length);
    }
    currentTrackIndex = randomIndex;
    playTrackByIndex(currentTrackIndex);
}

// Экспортируем функции в глобальную область видимости
window.openTab = openTab;
window.displayTracks = displayTracks;
window.getTabNameByValue = getTabNameByValue;
