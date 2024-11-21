document.addEventListener("DOMContentLoaded", () => {
    // Получаем элементы
    const playlistsContainer = document.querySelector('.playlists-container');
    const playlistItems = document.querySelectorAll('.playlist-item');
    const playlistContent = document.querySelector('.playlist-content');
    const backToPlaylistsBtn = document.getElementById('back-to-playlists-btn');
    const blurAddPlaylistContainer = document.querySelector('.blur-add-playlist-container');

    // Добавляем обработчики событий для плейлистов
    playlistItems.forEach((item) => {
        item.addEventListener('click', () => {
            // Скрываем контейнер с плейлистами
            playlistsContainer.style.display = 'none';
            // Скрываем blur-add-playlist-container
            blurAddPlaylistContainer.style.display = 'none';
            // Показываем содержимое выбранного плейлиста
            playlistContent.style.display = 'block';
        });
    });

    // Обработчик для кнопки "Назад"
    backToPlaylistsBtn.addEventListener('click', () => {
        // Показываем контейнер с плейлистами
        playlistsContainer.style.display = 'flex';
        // Показываем blur-add-playlist-container
        blurAddPlaylistContainer.style.display = 'block';
        // Скрываем содержимое плейлиста
        playlistContent.style.display = 'none';
    });

    // Предотвращаем открытие плейлиста при клике на название
    const playlistNames = document.querySelectorAll('.playlist-name');
    playlistNames.forEach((name) => {
        name.addEventListener('click', (event) => {
            event.stopPropagation();
            // Здесь можно добавить дополнительную логику, если нужно
            console.log('Клик на название плейлиста');
        });
    });

    // Предотвращаем открытие плейлиста при клике на элементы внутри context-playlist-menu
    const contextMenuButtons = document.querySelectorAll('.context-playlist-menu, .context-playlist-menu *');
    contextMenuButtons.forEach((element) => {
        element.addEventListener('click', (event) => {
            event.stopPropagation();
            // Здесь можно добавить дополнительную логику, если нужно
            console.log('Клик на элемент контекстного меню');
        });
    });
});
