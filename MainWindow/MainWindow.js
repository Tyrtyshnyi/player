const audio = document.getElementById('audio');
const playButton = document.getElementById('play');
const pauseButton = document.getElementById('pause');
const stopButton = document.getElementById('stop');
const nextButton = document.getElementById('next');
const prevButton = document.getElementById('prev');
const audioSource = document.getElementById('audioSource');

const tracks = [
    { title: 'Трек 1', src: 'path/to/track1.mp3' }, // Укажите правильный путь к вашим аудиофайлам
    { title: 'Трек 2', src: 'path/to/track2.mp3' },
    { title: 'Трек 3', src: 'path/to/track3.mp3' }
];

let currentTrackIndex = 0;

// Заполнение плейлиста
const trackList = document.getElementById('trackList');
tracks.forEach((track, index) => {
    const li = document.createElement('li');
    li.textContent = track.title;
    li.addEventListener('click', () => loadTrack(index));
    trackList.appendChild(li);
});

// Загрузка трека
function loadTrack(index) {
    currentTrackIndex = index;
    audioSource.src = tracks[index].src;
    audio.load();
}

// Управление кнопками
playButton.addEventListener('click', () => audio.play());
pauseButton.addEventListener('click', () => audio.pause());
stopButton.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
});
nextButton.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
});
prevButton.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
});