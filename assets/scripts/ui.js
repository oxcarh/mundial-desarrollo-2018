// Show burguer menu on mobile
var burger = document.querySelector('.navbar-burger');
var menu = document.querySelector('.navbar-menu');
if (burger !== null) {
    burger.addEventListener('click', function () {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
    });
}
