const API_URL = 'http://localhost:4000/api/menu';
const ORDERS_URL = 'http://localhost:4000/api/orders';

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
    cargarOrdenes();

    setInterval(cargarOrdenes, 15000);

    document.getElementById('menu-form').addEventListener('submit', agregarPlatillo);
    const clearBtn = document.getElementById('clear-form');
    if (clearBtn) clearBtn.addEventListener('click', () => document.getElementById('menu-form').reset());
});


//Funcion que carga las ordenes
async function cargarOrdenes() {
    try {
        const respuesta = await fetch(ORDERS_URL);
        if (!respuesta.ok) {
            console.error("Error al obtener las órdenes del servidor");
            return;
        }

        const ordenes = await respuesta.json();
        const tbody = document.getElementById('tabla-ordenes-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (ordenes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No hay órdenes pendientes ☕</td></tr>`;
            return;
        }

        ordenes.forEach(orden => {
            // 1. OBTENER EL ARREGLO DE PRODUCTOS (Soporta 'productos' o 'items')
            const arregloProductos = orden.productos || orden.items;
            let listaProductos = 'Sin productos';

            if (arregloProductos && arregloProductos.length > 0) {
                listaProductos = arregloProductos.map(p => {
                    const nombreProd = p.nombre || p.name || 'Producto';
                    const cantidadProd = p.cantidad || p.qty || 1;
                    return `${nombreProd} (${cantidadProd})`;
                }).join(', ');
            }

            // 2. OBTENER EL NOMBRE DEL CLIENTE
            const nombreCliente = orden.cliente || orden.studentName || 'Invitado';

            // 3. OBTENER EL ESTADO
            const estadoActual = orden.status || orden.estado || 'pendiente';

            // Configuración de colores de los badges de Bootstrap para el estado
            let colorBadge = 'bg-secondary';
            if (estadoActual === 'pendiente') colorBadge = 'bg-warning text-dark';
            if (estadoActual === 'preparacion' || estadoActual === 'preparando') colorBadge = 'bg-primary';
            if (estadoActual === 'lista' || estadoActual === 'listo') colorBadge = 'bg-success';
            if (estadoActual === 'recogido') colorBadge = 'bg-info';

            // 🔴 NUEVA LÓGICA: Validar método y estado del pago de forma estricta
            const esTarjeta = orden.paymentIntentId !== null && orden.paymentIntentId !== undefined && orden.paymentIntentId !== '';
            const pagoTexto = esTarjeta ? '🟢 Tarjeta (Stripe)' : '🟡 Efectivo (Cobrar)';
            const pagoClase = esTarjeta ? 'bg-success' : 'bg-warning text-dark';

            const selectEstado = `
                <select class="form-select form-select-sm" onchange="cambiarEstadoOrden('${orden.id}', this.value)">
                    <option value="pendiente" ${estadoActual === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="preparacion" ${estadoActual === 'preparacion' || estadoActual === 'preparando' ? 'selected' : ''}>En preparación</option>
                    <option value="lista" ${estadoActual === 'lista' || estadoActual === 'listo' ? 'selected' : ''}>Lista</option>
                    <option value="recogido" ${estadoActual === 'recogido' ? 'selected' : ''}>Recogido</option>
                </select>
            `;

            const fila = document.createElement('tr');

            // 4. RENDERIZADO (Agregamos la columna del estado del pago antes del estado de preparación)
            fila.innerHTML = `
                <td><strong>#${orden.id ? orden.id.slice(-4) : '????'}</strong></td>
                <td>${nombreCliente}</td>
                <td>${listaProductos}</td>
                <td><strong>$${Number(orden.total || 0).toFixed(2)}</strong></td>
                <td>
                    <span class="badge ${pagoClase}">${pagoTexto}</span>
                </td>
                <td>
                    <span class="badge ${colorBadge} text-capitalize">${estadoActual}</span>
                </td>
                <td>${selectEstado}</td>
            `;
            tbody.appendChild(fila);
        });

    } catch (error) {
        console.error("Error en la solicitud GET de órdenes:", error);
    }
}
//==================================================
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


window.cambiarDisponibilidad = async function (id, nuevoEstado) {
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
window.cambiarEstadoOrden = async function (id, nuevoEstado) {
    try {
        // Si el estado es "recogido", eliminamos la orden para todos
        if (nuevoEstado === 'recogido') {
            const confirmacion = confirm('¿Está seguro que desea eliminar esta orden? Se borrará para el staff y para el estudiante.');
            if (!confirmacion) return;

            const respuesta = await fetch(`${ORDERS_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (respuesta.ok) {
                cargarOrdenes(); // Refresca la lista de comandos automáticamente
                alert('✅ Orden eliminada exitosamente');
            } else {
                alert('Error al eliminar la orden');
            }
        } else {
            // Para otros estados, solo actualizar lo que corresponde
            const respuesta = await fetch(`${ORDERS_URL}/${id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (respuesta.ok) {
                cargarOrdenes(); 
            }
        }
    } catch (error) {
        console.error("Error al actualizar el estado de la orden:", error);
    }
};