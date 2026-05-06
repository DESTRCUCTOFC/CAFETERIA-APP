document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // Seguridad: Si no hay usuario, regresa al login
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('welcome-msg').innerText = `¡Hola, ${user.name}!`;

    // Botón de cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
});