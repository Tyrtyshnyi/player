// MainWindow.js

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

document.addEventListener("DOMContentLoaded", () => {
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

    // Привязка обработчиков событий
    playBtn.addEventListener('click', () => {
        if (currentAudio) {
            currentAudio.play();
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            currentPlayingTrack?.classList.add('playing');
        }
    });

    pauseBtn.addEventListener('click', () => {
        if (currentAudio) {
            currentAudio.pause();
            playBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
        }
    });

    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
    });

    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
    });

    // Управление прогрессбаром при перемотке
    timecodeSlider.addEventListener('input', () => {
        if (currentAudio) {
            currentAudio.currentTime = timecodeSlider.value;
            updateTime();
        }
    });

    // Управление громкостью
    volumeBar.addEventListener('click', (e) => {
        const rect = volumeBar.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const volume = clickPosition / rect.width;
        if (currentAudio) {
            currentAudio.volume = volume;
        }
        volumeLevel.style.width = `${volume * 100}%`;
    });

    // Обновление иконки громкости
    volumeIcon.addEventListener('click', () => {
        if (currentAudio) {
            if (currentAudio.volume > 0) {
                currentAudio.volume = 0;
                volumeLevel.style.width = '0%';
            } else {
                currentAudio.volume = 1;
                volumeLevel.style.width = '100%';
            }
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const defaultTabButton = document.querySelector('.all-tracks');
    audioList = document.querySelector('.track-list');

    if (defaultTabButton) openTab({ currentTarget: defaultTabButton }, 'all-tracks');
});

function openTab(evt, tabName) {
    let tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    let tabButtons = document.getElementsByClassName("left-panel-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    document.getElementById(tabName)?.classList.add("active");
    evt.currentTarget.classList.add('active');

    if (tabName === 'all-tracks') {
        loadAudioFiles();
    }
}


// Функция для извлечения названия и исполнителя из имени файла
function extractTitleAndArtistFromFilename(filename) {
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
    const track = tracks[index];
    if (track) {
        currentTrackIndex = index;
        playAudio(track.src, track.metadata, index, track.filename);
    } else {
        console.error(`Трек с индексом ${index} не найден.`);
    }
}

function togglePlayPause() {
    if (currentAudio) {
        if (currentAudio.paused) {
            currentAudio.play().catch(error => console.error("Ошибка при возобновлении воспроизведения:", error));
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            currentPlayingTrack?.classList.add('playing');
        } else {
            currentAudio.pause();
            playBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
        }
    }
}

function playAudio(filePath, metadata, index, filename) {
    if (currentAudio) {
        currentAudio.pause();
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
    currentPlayingTrack = document.querySelector(`.item-track[data-index='${index}']`);
    if (currentPlayingTrack) {
        currentPlayingTrack.classList.add('playing');
    }

    // Обновление времени окончания после загрузки метаданных
    currentAudio.addEventListener('loadedmetadata', () => {
        timecodeEnd.textContent = formatTime(currentAudio.duration);
        timecodeSlider.max = currentAudio.duration;
    });

    // Обновление прогрессбара во время воспроизведения
    currentAudio.addEventListener('timeupdate', updateTime);

    // Обработчик окончания трека
    currentAudio.addEventListener('ended', () => {
        if (isRepeat) {
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
    }
}

function updatePlayerUI(metadata, filePath, filename) {
    let title = metadata.common.title;
    let artist = metadata.common.artist;

    if (!title || !artist) {
        const extracted = extractTitleAndArtistFromFilename(filename);
        title = title || extracted.title;
        artist = artist || extracted.artist;
    }

    trackTitle.textContent = title || filename || 'Unknown Title';
    trackArtist.textContent = artist || 'Unknown Artist';

    if (metadata.common.picture && metadata.common.picture.length > 0) {
        const coverData = metadata.common.picture[0].data;
        coverImage.src = `data:image/jpeg;base64,${Buffer.from(coverData).toString('base64')}`;
    } else {
        coverImage.src = path.join(__dirname, "1.png");
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
        const progressPercent = (currentAudio.currentTime / currentAudio.duration) * 100;
        timecodeSlider.style.background = `linear-gradient(to right, #00dcff ${progressPercent}%, #707070 ${progressPercent}%)`;
    }
}

function prevTrack() {
    if (tracks.length === 0) return;
    if (isShuffle) {
        playRandomTrack();
    } else {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        playTrackByIndex(currentTrackIndex);
    }
}

function nextTrack() {
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
    } else if (currentAudio.volume < 0.5) {
        volumeIcon.textContent = '🔉';
    } else {
        volumeIcon.textContent = '🔊';
    }
}

function playRandomTrack() {
    if (tracks.length === 0) return;
    let randomIndex = Math.floor(Math.random() * tracks.length);
    while (randomIndex === currentTrackIndex && tracks.length > 1) {
        randomIndex = Math.floor(Math.random() * tracks.length);
    }
    currentTrackIndex = randomIndex;
    playTrackByIndex(currentTrackIndex);
}
