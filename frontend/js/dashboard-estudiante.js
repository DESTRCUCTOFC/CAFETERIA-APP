const API_URL = 'http://localhost:3000/api/menu';   

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // Seguridad: Si no hay usuario, regresa al login
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    if (user && user.name) {
        document.getElementById('welcome-msg').innerText = `¡Hola, ${user.name}!`;
    }

    document.getElementById('welcome-msg').innerText = `¡Hola, ${user.name}!`;

    // Botón de cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    cargarMenuEstudiante();
});

async function cargarMenuEstudiante() {
    try {
        const respuesta = await fetch(API_URL);
        const platillos = await respuesta.json();
        
        const container = document.getElementById('menu-container');
        container.innerHTML = ''; 
        
        if (platillos.length === 0) {
            container.innerHTML = '<p>No hay platillos disponibles en este momento.</p>';
            return;
        }

        platillos.forEach(item => {
            const estaAgotado = !item.disponible;
            const claseTarjeta = estaAgotado ? 'menu-card agotado' : 'menu-card';
            const etiquetaAgotado = estaAgotado ? '<span class="badge-agotado">Agotado</span>' : '';
            
            const imagenUrl = item.imagenUrl;

            const tarjeta = document.createElement('div');
            tarjeta.className = claseTarjeta;
            tarjeta.innerHTML = `
                <img src="${imagenUrl}" alt="${item.nombre}" class="menu-img">
                <div class="menu-info">
                    <h3 class="menu-title">
                        ${item.nombre} 
                        ${etiquetaAgotado}
                    </h3>
                    <p class="menu-desc">${item.descripcion}</p>
                    <div class="menu-footer">
                        <span class="badge-categoria">${item.categoria}</span>
                        <span class="menu-price">$${Number(item.precio).toFixed(2)}</span>
                    </div>
                </div>
            `;
            container.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al cargar el menú estudiantil:", error);
        document.getElementById('menu-container').innerHTML = '<p style="color:red;">Error al cargar el menú. Asegúrate de que el servidor esté encendido.</p>';
    }
}