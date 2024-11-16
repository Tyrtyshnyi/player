window.addEventListener('scroll', function() {
    var tabContainer = document.querySelector('.search-bar');
    if (window.scrollY > 0) {
        tabContainer.classList.add('fixed');
    } else {
        tabContainer.classList.remove('fixed');
    }
});


