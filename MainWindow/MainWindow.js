let currentAudio = null;
let currentPlayingTrack = null;

document.addEventListener("DOMContentLoaded", () => {
    const defaultTabButton = document.querySelector('.all-tracks');
    const slider = document.querySelector('.timecode-slider');
    const timecodeStart = document.querySelector('.timecode-start');
    const timecodeEnd = document.querySelector('.timecode-end');
    audioList = document.querySelector('.track-list');

    if (defaultTabButton) openTab({ currentTarget: defaultTabButton }, 'all-tracks');

    if (slider && timecodeStart && timecodeEnd) {
        let totalDuration = 196;

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }

        timecodeEnd.textContent = formatTime(totalDuration);
        timecodeStart.textContent = formatTime(0);

        slider.addEventListener('input', () => {
            const value = slider.value;
            const percentage = `${value}%`;
            slider.style.background = `linear-gradient(to right, #707070 ${percentage}, #424242 ${percentage})`;
            const currentTime = (value / 100) * totalDuration;
            timecodeStart.textContent = formatTime(currentTime);
        });
    }
});

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
    evt.currentTarget.classList.add("active");

    if (tabName === 'all-tracks') {
        loadAudioFiles();
    }
}

const fs = require('fs');
const path = require('path');
const { parseBuffer } = require('music-metadata-browser');
let audioList = null;
const audioDirectory = path.join('D:/Music');

function loadAudioFiles() {
    if (!audioList) {
        console.error("Элемент .track-list не найден");
        return;
    }

    fs.readdir(audioDirectory, (err, files) => {
        if (err) {
            console.error("Ошибка чтения папки:", err);
            return;
        }

        const audioFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp3', '.wav', '.flac', '.ogg'].includes(ext);
        });

        audioFiles.forEach(file => {
            const filePath = path.join(audioDirectory, file);
            loadAudioMetadata(filePath);
        });
    });
}

async function loadAudioMetadata(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const metadata = await parseBuffer(fileBuffer, { mimeType: 'audio/mpeg', size: fileBuffer.length });
        let { title, artist, picture } = metadata.common;

        if (!title || !artist) {
            const extracted = extractTitleAndArtistFromFilename(path.basename(filePath));
            title = title || extracted.title;
            artist = artist || extracted.artist;
        }

        const audioItem = document.createElement('div');
        audioItem.classList.add('item-track');
        audioItem.innerHTML = `
            <div class="item-cover">
                ${picture ? `<img src="data:image/jpeg;base64,${Buffer.from(picture[0].data).toString('base64')}" />` : ''}
            </div>
            <div class="item-info">
                <div class="item-title">${title}</div>
                <div class="item-artist">${artist}</div>
            </div>
        `;

        if (!picture) {
            audioItem.querySelector('.item-cover').classList.add('default-cover');
        }

        audioItem.addEventListener('click', () => togglePlayPause(filePath, metadata, audioItem));

        if (audioList) {
            audioList.appendChild(audioItem);
        } else {
            console.error("Ошибка: элемент track-list не найден для добавления");
        }
    } catch (error) {
        console.error("Ошибка чтения метаданных:", error);
    }
}

function togglePlayPause(filePath, metadata, audioItem) {
    if (currentAudio && currentAudio.src === new URL(filePath, 'file://').href) {
        if (currentAudio.paused) {
            currentAudio.play().catch(error => console.error("Ошибка при возобновлении воспроизведения:", error));
            audioItem.classList.add('playing');
            document.body.classList.add('playing'); // Добавляем класс к body при воспроизведении
        } else {
            currentAudio.pause();
            audioItem.classList.remove('playing');
            document.body.classList.remove('playing'); // Убираем класс при паузе
        }
    } else {
        if (currentAudio) {
            currentAudio.pause();
            currentPlayingTrack?.classList.remove('playing');
            document.body.classList.remove('playing'); // Убираем класс для предыдущего трека
        }
        playAudio(filePath, metadata, audioItem);
    }
}

function playAudio(filePath, metadata, audioItem) {
    if (currentAudio) {
        currentAudio.pause();
    }

    currentAudio = new Audio(filePath);
    currentAudio.play().catch(error => console.error("Ошибка при воспроизведении аудио:", error));
    currentPlayingTrack = audioItem;
    audioItem.classList.add('playing');

    const titleElement = document.getElementById('title');
    const artistElement = document.getElementById('artist');
    const coverElement = document.getElementById('cover');

    if (titleElement && artistElement && coverElement) {
        const { title, artist } = metadata?.common?.title && metadata?.common?.artist
            ? { title: metadata.common.title, artist: metadata.common.artist }
            : extractTitleAndArtistFromFilename(path.basename(filePath));

        titleElement.textContent = title || 'Unknown Title';
        artistElement.textContent = artist || 'Unknown Artist';

        if (metadata?.common?.picture && metadata.common.picture.length > 0) {
            const coverData = metadata.common.picture[0].data;
            coverElement.src = `data:image/jpeg;base64,${Buffer.from(coverData).toString('base64')}`;
            coverElement.style.display = 'block';
        } else {
            coverElement.src = path.join(__dirname, "1.png");
            coverElement.style.display = 'block';
        }
    } else {
        console.error("Элементы title, artist или cover не найдены в плеере");
    }

    currentAudio.addEventListener('ended', () => {
        audioItem.classList.remove('playing');
    });
}
