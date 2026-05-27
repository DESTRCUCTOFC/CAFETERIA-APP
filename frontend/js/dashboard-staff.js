
const API_URL = 'http://localhost:4000/api/menu';
const ORDERS_URL = 'http://localhost:4000/api/orders';

function showAlert(message, texto, error = true) {
    if (!message) return;
    if (!texto || texto.trim() === '') {
        message.style.display = "none";
        message.innerText = "";
        return;
    }
    message.style.padding = "10px 20px";
    message.style.borderRadius = "12px";
    message.style.fontWeight = "bold";
    message.style.textAlign = "center";
    message.style.marginTop = "15px";
    message.style.display = "block";
    message.style.width = "fit-content";
    message.style.maxWidth = "400px";
    message.style.margin = "15px auto 0 auto";
    if (error) {
        message.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        message.style.color = "white";
        message.innerText = texto;
    } else {
        // Estilo para éxito (verde translúcido o sólido)
        message.style.backgroundColor = "rgba(40, 167, 69, 0.2)";
        message.style.color = "#155724";
        message.innerText = texto;
    }
}


//Botones de agregar elementos al menu
const btnVisualAddMenu = document.getElementById("btn-visual-addMenu");
const btnCerrarMenu = document.getElementById('btn-ocultar-formulario');
const modalMenu = document.getElementById('modal-formulario-menu');

btnVisualAddMenu?.addEventListener("click", () => {
    modalMenu?.classList.add('mostrar');
});
btnCerrarMenu?.addEventListener("click", () => {
    const alertaAddMenu = document.getElementById('alertAddMenu')
    showAlert(alertaAddMenu, '')
    modalMenu?.classList.remove('mostrar');
});
modalMenu?.addEventListener("click", (e) => {
    if (e.target === modalMenu) {
        modalMenu.classList.remove('mostrar');
    }
});




document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const alert = document.getElementById('alertTry')

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
            //Lista de Productos
            const arregloProductos = orden.productos || orden.items;
            listaProductos = `
                  <ul class="lista-productos">
                     ${arregloProductos.map(p => {
                const nombreProd = p.nombre || p.name || 'Producto';
                const cantidadProd = p.cantidad || p.qty || 1;
                return `
                <li>
                    <span>${nombreProd}</span>
                    <strong>x${cantidadProd}</strong>
                </li>
                `;
            }).join('')}
                    </ul>
                `;

            // NOMBRE DEL CLIENTE
            const nombreCliente = orden.cliente || orden.studentName || 'Invitado';

            // 3. OBTENER EL ESTADO
            const estadoActual = orden.status || orden.estado || 'pendiente';

            // Configuración de colores de los badges de Bootstrap para el estado
            let colorBadge = 'bg-secondary';
            if (estadoActual === 'pendiente') colorBadge = 'bg-warning text-dark';
            if (estadoActual === 'preparacion' || estadoActual === 'preparando') colorBadge = 'bg-primary';
            if (estadoActual === 'lista' || estadoActual === 'listo') colorBadge = 'bg-success';
            if (estadoActual === 'recogido') colorBadge = 'bg-info';


            const esTarjeta = orden.paymentIntentId !== null && orden.paymentIntentId !== undefined && orden.paymentIntentId !== '';
            const pagoTexto = esTarjeta ? '💳Tarjeta ' : '💵Efectivo ';
            const pagoClase = esTarjeta ? 'bg-success' : 'bg-warning text-dark';

            // clases para  lista de cambio de estado
            if (estadoActual === 'pendiente') {
                claseEstado = 'select-pendiente';
            }

            else if (estadoActual === 'preparacion' || estadoActual === 'preparando') {
                claseEstado = 'select-preparacion';
            }

            else if (estadoActual === 'lista' || estadoActual === 'listo') {
                claseEstado = 'select-lista';
            }

            else if (estadoActual === 'recogido') {
                claseEstado = 'select-recogido';
            }

            const selectEstado = `
            <select class="estado-select ${claseEstado}"onchange="cambiarEstadoOrden('${orden.id}', this.value)">
                <option value="pendiente" ${estadoActual === 'pendiente' ? 'selected' : ''}>
                    Pendiente
                </option>

                <option value="preparacion" ${estadoActual === 'preparacion' || estadoActual === 'preparando' ? 'selected' : ''}>
                    En preparación
                </option>

                <option value="lista" ${estadoActual === 'lista' || estadoActual === 'listo' ? 'selected' : ''}>
                    Lista
                </option>
                <option value="recogido" ${estadoActual === 'recogido' ? 'selected' : ''}>
                    Recogido
                </option>
            </select>
            `;

            const fila = document.createElement('tr');

            // Se rendereiza  lo anteriormente establecido
            fila.innerHTML = `
                <td><strong>#${orden.id ? orden.id.slice(-4) : '????'}</strong></td>
                <td>${nombreCliente}</td>
                <td>${listaProductos}</td>
                <td><strong>$${Number(orden.total || 0).toFixed(2)}</strong></td>
                <td>
                    <span class="badge ${pagoClase}">${pagoTexto}</span>
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
                        <small style="color: var(--ug-primary);">${item.descripcion}</small>
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
    const alertaAddMenu = document.getElementById('alertAddMenu')

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
            showAlert(alertaAddMenu, "¡Platillo agregado exitosamente!", false)
            form.reset();
            cargarMenu();
        } else {
            const errorData = await respuesta.json();
            showAlert(alertaAddMenu, errorData.msg)

        }
    } catch (error) {
        console.error("Error en la solicitud POST:", error);
    } finally {
        showAlert(alertaAddMenu, '')
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