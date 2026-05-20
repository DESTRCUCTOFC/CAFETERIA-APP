const API_URL = 'http://localhost:4000/api/menu';

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

    cargarMenu();

    document.getElementById('menu-form').addEventListener('submit', agregarPlatillo);
    const clearBtn = document.getElementById('clear-form');
    if (clearBtn) clearBtn.addEventListener('click', () => document.getElementById('menu-form').reset());
});

async function cargarMenu() {
    try {
        const respuesta = await fetch(API_URL);
        const platillos = await respuesta.json();
        
        const tbody = document.getElementById('tabla-menu-body');
        tbody.innerHTML = ''; 
        
        platillos.forEach(item => {
            // Renderizado de la imagen o placeholder
            const imagenHTML = item.imagenUrl 
                ? `<img src="${item.imagenUrl}" class="menu-img" alt="${item.nombre}">` 
                : '<div class="menu-img" style="background:#eee; display:grid; place-items:center; font-size:10px;">Sin foto</div>';

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${imagenHTML}</td>
                <td>
                    <strong>${item.nombre}</strong><br>
                    <small style="color: #666;">${item.descripcion}</small>
                </td>
                <td>${item.categoria}</td>
                <td>$${Number(item.precio).toFixed(2)}</td>
                <td style="color: ${item.disponible ? 'green' : 'red'}; font-weight: bold;">
                    ${item.disponible ? 'Disponible' : 'Agotado'}
                </td>
                <td>
                    <button class="btn btn-outline-secondary btn-sm" onclick="cambiarDisponibilidad('${item.id}', ${!item.disponible})">
                        Marcar como ${item.disponible ? 'Agotado' : 'Disponible'}
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar el menú:", error);
    }
}

async function agregarPlatillo(e) {
    e.preventDefault(); 
    const form = e.target;
    
    const formData = new FormData();
    formData.append('nombre', document.getElementById('prod-nombre').value);
    formData.append('descripcion', document.getElementById('prod-descripcion').value);
    formData.append('categoria', document.getElementById('prod-categoria').value);
    formData.append('precio', document.getElementById('prod-precio').value);
    
    // Añadir archivo de imagen si existe
    const inputFile = document.getElementById('prod-imagen');
    if (inputFile.files.length > 0) {
        formData.append('imagen', inputFile.files[0]);
    }

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            body: formData 
        });

        if (respuesta.ok) {
            alert("¡Platillo agregado exitosamente!");
            form.reset(); 
            cargarMenu(); // Recargar la tabla para ver el nuevo platillo
        } else {
            const errorData = await respuesta.json();
            alert("Error: " + errorData.msg);
        }
    } catch (error) {
        console.error("Error en la solicitud POST:", error);
    }
}


window.cambiarDisponibilidad = async function(id, nuevoEstado) {
    try {
        const respuesta = await fetch(`${API_URL}/${id}/disponibilidad`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ disponible: nuevoEstado })
        });

        if (respuesta.ok) {
            cargarMenu(); 
        } else {
            alert("Error al actualizar la disponibilidad.");
        }
    } catch (error) {
        console.error("Error en la solicitud PATCH:", error);
    }
};