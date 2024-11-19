document.addEventListener("DOMContentLoaded", () => {
    // Получаем элементы
    const playlistsContainer = document.querySelector('.playlists-container');
    const playlistItems = document.querySelectorAll('.playlist-item');
    const playlistContent = document.querySelector('.playlist-content');
    const backToPlaylistsBtn = document.getElementById('back-to-playlists-btn');

    // Добавляем обработчики событий для плейлистов
    playlistItems.forEach((item) => {
        item.addEventListener('click', () => {
            // Скрываем контейнер с плейлистами
            playlistsContainer.style.display = 'none';
            // Показываем содержимое выбранного плейлиста
            playlistContent.style.display = 'block';
        });
    });

    // Обработчик для кнопки "Назад"
    backToPlaylistsBtn.addEventListener('click', () => {
        // Показываем контейнер с плейлистами
        playlistsContainer.style.display = 'flex';
        // Скрываем содержимое плейлиста
        playlistContent.style.display = 'none';
    });
});
