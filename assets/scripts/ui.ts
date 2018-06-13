

// Show burguer menu on mobile
const burger = document.querySelector('.navbar-burger');
const menu = document.querySelector('.navbar-menu');
if (burger !== null) {
    burger.addEventListener('click', function() {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');

    });
}

