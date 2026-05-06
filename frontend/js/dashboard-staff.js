document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // Solo dejar entrar si es Staff
    if (!user || user.role !== 'staff') {
        alert("Acceso denegado. Se requiere perfil de Staff.");
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('staff-info').innerText = `Sesión iniciada por: ${user.name}`;

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
});