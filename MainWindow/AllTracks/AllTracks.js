// AllTracks.js

let audioList = null;

// Импорт необходимых модулей
const fs = require('fs');
const path = require('path');
const { parseBuffer } = require('music-metadata-browser');
let audioDirectory = path.join('D:/Music');





async function loadAudioFiles() {
    if (!audioList) {
        console.error("Элемент .track-list не найден");
        return;
    }

    try {
        const files = await fs.promises.readdir(audioDirectory);

        const audioFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.mp3', '.wav', '.flac', '.ogg'].includes(ext);
        });

        for (let i = 0; i < audioFiles.length; i++) {
            const file = audioFiles[i];
            const filePath = path.join(audioDirectory, file);
            const trackInfo = await loadAudioMetadata(filePath);

            if (trackInfo) {
                const index = tracks.length; // Используем длину массива как индекс
                trackInfo.index = index;
                tracks.push(trackInfo);

                // Создаем элемент списка треков
                const audioItem = document.createElement('div');
                audioItem.classList.add('item-track');
                audioItem.dataset.index = index; // Сохраняем индекс трека
                audioItem.setAttribute('draggable', 'true'); // Добавляем возможность перетаскивания

                audioItem.innerHTML = `
                    <div class="item-cover">
                        ${trackInfo.cover ? `<img src="${trackInfo.cover}" />` : ''}
                    </div>
                    <div class="item-info">
                        <div class="item-title">${trackInfo.title}</div>
                        <div class="item-artist">${trackInfo.artist}</div>
                    </div>
                `;

                if (!trackInfo.cover) {
                    audioItem.querySelector('.item-cover').classList.add('default-cover');
                }

                audioItem.addEventListener('click', () => {
                    if (currentTrackIndex === index) {
                        togglePlayPause();
                    } else {
                        playTrackByIndex(index);
                    }
                });

                // Добавляем обработчики для перетаскивания
                audioItem.addEventListener('dragstart', handleDragStart);
                audioItem.addEventListener('dragover', handleDragOver);
                audioItem.addEventListener('drop', handleDrop);
                audioItem.addEventListener('dragend', handleDragEnd);

                if (audioList) {
                    audioList.appendChild(audioItem);
                } else {
                    console.error("Ошибка: элемент track-list не найден для добавления");
                }
            }
        }
    } catch (err) {
        console.error("Ошибка чтения папки:", err);
    }
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

        const cover = picture && picture.length > 0
            ? `data:image/jpeg;base64,${Buffer.from(picture[0].data).toString('base64')}`
            : path.join(__dirname, "1.png");

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

// Функции для перетаскивания треков
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    e.currentTarget.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    e.stopPropagation();
    if (draggedItem !== e.currentTarget) {
        draggedItem.parentNode.removeChild(draggedItem);
        const dropHTML = e.dataTransfer.getData('text/html');
        e.currentTarget.insertAdjacentHTML('beforebegin', dropHTML);
        const droppedElement = e.currentTarget.previousSibling;
        addDragAndDropHandlers(droppedElement);
        updateTrackIndices();
    }
    return false;
}

function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    saveTrackOrder();
}

function addDragAndDropHandlers(element) {
    element.addEventListener('dragstart', handleDragStart);
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('dragend', handleDragEnd);
}

function updateTrackIndices() {
    const items = document.querySelectorAll('.item-track');
    tracks = [];
    items.forEach((item, index) => {
        item.dataset.index = index;
        const track = {
            title: item.querySelector('.item-title').textContent,
            artist: item.querySelector('.item-artist').textContent,
            src: tracks[index]?.src || '',
            cover: item.querySelector('.item-cover img')?.src || '',
            metadata: tracks[index]?.metadata || {},
            filename: tracks[index]?.filename || ''
        };
        tracks.push(track);
    });
}

function saveTrackOrder() {
    const trackIds = Array.from(audioList.children).map(track => track.dataset.index);
    localStorage.setItem('trackOrder', JSON.stringify(trackIds));
}

function loadTrackOrder() {
    const trackOrder = JSON.parse(localStorage.getItem('trackOrder'));
    if (trackOrder) {
        trackOrder.forEach(index => {
            const track = document.querySelector(`.item-track[data-index='${index}']`);
            if (track) {
                audioList.appendChild(track);
            }
        });
    }
}

// Вызов загрузки порядка треков при загрузке страницы
document.addEventListener('DOMContentLoaded', loadTrackOrder);

module.exports = {
    loadAudioFiles
};
