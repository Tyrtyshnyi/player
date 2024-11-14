window.addEventListener('scroll', function() {
    var tabContainer = document.querySelector('.search-bar');
    if (window.scrollY > 0) {
        tabContainer.classList.add('fixed');
    } else {
        tabContainer.classList.remove('fixed');
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const defaultTabButton = document.querySelector('.all-tracks');
    const slider = document.querySelector('.timecode-slider');
    const timecodeStart = document.querySelector('.timecode-start');
    const timecodeEnd = document.querySelector('.timecode-end');
    audioList = document.querySelector('.track-list');

    if (defaultTabButton) openTab({ currentTarget: defaultTabButton }, 'all-tracks');

    // Настройка прогресс-бара
    if (slider && timecodeStart && timecodeEnd) {
        let totalDuration = 196; // Общее время трека в секундах

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
        const { title, artist, picture } = metadata.common;

        const audioItem = document.createElement('div');
        audioItem.classList.add('item-track');
        audioItem.innerHTML = `
            <div class="item-cover">
                ${picture ? `<img src="data:image/jpeg;base64,${Buffer.from(picture[0].data).toString('base64')}" />` : ''}
            </div>
            <div class="item-info">
                <div class="item-title">${title || path.basename(filePath)}</div>
                <div class="item-artist">${artist || 'Unknown Artist'}</div>
            </div>
        `;

        audioItem.addEventListener('click', () => playAudio(filePath, metadata));

        if (audioList) {
            audioList.appendChild(audioItem);
        } else {
            console.error("Ошибка: элемент track-list не найден для добавления");
        }
    } catch (error) {
        console.error("Ошибка чтения метаданных:", error);
    }
}

function playAudio(filePath, metadata) {
    const audioElement = new Audio(filePath);
    audioElement.play();

    const titleElement = document.getElementById('title');
    const artistElement = document.getElementById('artist');
    const coverElement = document.getElementById('cover');

    if (titleElement && artistElement && coverElement) {
        titleElement.textContent = metadata.common.title || 'Unknown Title';
        artistElement.textContent = metadata.common.artist || 'Unknown Artist';

        if (metadata.common.picture) {
            const coverData = metadata.common.picture[0].data;
            coverElement.src = `data:image/jpeg;base64,${Buffer.from(coverData).toString('base64')}`;
        } else {
            coverElement.src = '';
        }
    } else {
        console.error("Элементы title, artist или cover не найдены");
    }
}

