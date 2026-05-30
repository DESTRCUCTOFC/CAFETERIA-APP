import { readCart, addToCart, updateQty, removeItem, clearCart, renderCartHTML, cartTotals } from './cart.js';

const API_URL = 'http://localhost:4000/api/menu';
const ORDERS_URL = 'http://localhost:4000/api/orders';
const ORDERS_KEY = 'ug_orders_v1';
let allPlatillos = [];
let cart = readCart();

function getGuestId() {
    let guestId = localStorage.getItem('guest_id');
    if (!guestId) {
        guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
        localStorage.setItem('guest_id', guestId);
    }
    return guestId;
}

function readOrders() {
    try {
        const data = JSON.parse(localStorage.getItem(ORDERS_KEY));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}
// antes de que se borre el carrito se guarda la orden para que
// el invitado pueda visualizarlas
function saveGuestOrderLocally(order) {
    const localOrders = readOrders();
    localOrders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(localOrders));
}
// saveOrder 
/**
 * Guarda una orden localmente y la envía al servidor.
 * @param {Object} order - Objeto orden con campos: id, studentName, studentEmail, items, total, notes, etc.
 * @returns {Array} - El arreglo actualizado de órdenes en localStorage.
 */
async function saveOrder(order) {
    const user = JSON.parse(localStorage.getItem('user'));
    const isGuest = !user || !user.email;

    // Si es invitado, asignar guestId y limpiar email
    if (isGuest) {
        order.guestId = getGuestId();
        order.studentEmail = null;          // maybe ponerle un  'invitado@example.com'
        order.studentName = user?.name || 'Invitado';
    }

    // 1. Guardado local inmediato (para que el usuario vea su orden)
    const orders = readOrders();
    orders.unshift(order);                  // las más recientes al inicio
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    // 2. Envío al servidor (fire-and-forget, pero con log de errores)
    try {
        const response = await fetch('http://localhost:4000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)     // envía el mismo objeto (tu backend acepta cualquier JSON)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Orden guardada en el servidor. ID Firebase:', data.id);
        } else {
            console.error('❌ Error del servidor al guardar orden:', response.status, await response.text());
        }
    } catch (error) {
        console.error('❌ Error de conexión al enviar orden al servidor:', error);
    }

    return orders;
}

function truncarTexto(texto, maxLen = 210) {
    if (!texto || texto.length <= maxLen) return texto;
    let truncado = texto.slice(0, maxLen);
    const lastSpace = truncado.lastIndexOf(' ');
    if (lastSpace > 0) truncado = truncado.slice(0, lastSpace);
    return truncado + '...';
}

function setupCartEvents() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    cartItemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove]');
        if (btn) {
            const id = btn.getAttribute('data-remove');
            cart = removeItem(id);
            paintCart();
        }
    });


    cartItemsContainer.addEventListener('change', (e) => {
        const input = e.target.closest('[data-qty]');
        if (input) {
            const id = input.getAttribute('data-qty');
            let newQty = parseInt(input.value);
            if (isNaN(newQty) || newQty < 1) newQty = 1;
            input.value = newQty;
            cart = updateQty(id, newQty);
            paintCart();
        }
    });
}
function paintCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    const cartEmptyDiv = document.getElementById('cartEmpty');
    const cartTotalSpan = document.getElementById('cartTotal');
    const cartCountSpan = document.getElementById('cartCount');
    if (cartItemsDiv) {
        renderCartHTML(cartItemsDiv, cartEmptyDiv, cartTotalSpan, cartCountSpan, cart);
    }
}
async function cargarMenuEstudiante() {
    try {
        const respuesta = await fetch(API_URL);
        const platillos = await respuesta.json();
        allPlatillos = platillos;

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
            const imagenUrl = item.imagenUrl || 'https://via.placeholder.com/300x200?text=Sin+imagen';

            const tarjeta = document.createElement('div');
            tarjeta.className = claseTarjeta;
            tarjeta.innerHTML = `
                <img src="${imagenUrl}" alt="${item.nombre}" class="menu-img">
                <div class="menu-info">
                    <h3 class="menu-title">${item.nombre} ${etiquetaAgotado}</h3>
                    <p class="menu-desc">
    ${(() => {
        const desc = item.descripcion || '';
        const truncada = truncarTexto(desc);
        if (desc.length <= 210) return truncada;
        return `${truncada} <a href="#" class="ver-mas-link" data-desc="${desc.replace(/"/g, '&quot;')}">ver más</a>`;
    })()}
</p>
                    <div class="menu-footer">
                        <span class="badge-categoria">${item.categoria || ''}</span>
                        <span class="menu-price">$${Number(item.precio).toFixed(2)}</span>
                    </div>
                    ${!estaAgotado ? '<button class="btn btn-primary btn-agregar w-100 mt-2">Agregar al carrito</button>' : ''}    </div>
            `;

            if (!estaAgotado) {
                tarjeta.querySelector('.btn-agregar').onclick = () => {
                    cart = addToCart({ id: item.id, name: item.nombre, price: item.precio, imageUrl: item.imagenUrl });
                    paintCart();
                };
            }

            const verMas = tarjeta.querySelector('.ver-mas-link');
if (verMas) {
    verMas.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = new bootstrap.Modal(document.getElementById('modalDescripcionLarga'));
        const modalBody = document.querySelector('#modalDescripcionLarga .modal-body');
        modalBody.innerText = verMas.getAttribute('data-desc');
        modal.show();
    });
}
            container.appendChild(tarjeta);
        });
    } catch (error) {
        console.error("Error al cargar el menú:", error);
        document.getElementById('menu-container').innerHTML = '<p style="color:red;">Error al cargar el menú. Asegúrate de que el servidor esté encendido.</p>';
    }
}
function aplicarFiltros() {
    if (!allPlatillos.length) return;
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const sortBy = document.getElementById('sortSelect')?.value || 'name_asc';
    let filtrados = [...allPlatillos];
    if (searchTerm) {
        filtrados = filtrados.filter(p =>
            p.nombre.toLowerCase().includes(searchTerm) ||
            (p.categoria && p.categoria.toLowerCase().includes(searchTerm))
        );
    }
    if (sortBy === 'name_asc') filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    else if (sortBy === 'price_asc') filtrados.sort((a, b) => a.precio - b.precio);
    else if (sortBy === 'price_desc') filtrados.sort((a, b) => b.precio - a.precio);
    renderMenuFiltrado(filtrados);
}

function renderMenuFiltrado(platillos) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';
    if (platillos.length === 0) {
        container.innerHTML = '<p>No hay platillos que coincidan con tu búsqueda.</p>';
        return;
    }
    platillos.forEach(item => {
        const estaAgotado = !item.disponible;
        const claseTarjeta = estaAgotado ? 'menu-card agotado' : 'menu-card';
        const etiquetaAgotado = estaAgotado ? '<span class="badge-agotado">Agotado</span>' : '';
        const imagenUrl = item.imagenUrl || 'https://via.placeholder.com/300x200?text=Sin+imagen';

        const tarjeta = document.createElement('div');
        tarjeta.className = claseTarjeta;
        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="${item.nombre}" class="menu-img">
            <div class="menu-info">
                <h3 class="menu-title">${item.nombre} ${etiquetaAgotado}</h3>
                <p class="menu-desc">
    ${(() => {
        const desc = item.descripcion || '';
        const truncada = truncarTexto(desc);
        if (desc.length <= 210) return truncada;
        return `${truncada} <a href="#" class="ver-mas-link" data-desc="${desc.replace(/"/g, '&quot;')}">ver más</a>`;
    })()}
</p>
                <div class="menu-footer">
                    <span class="badge-categoria">${item.categoria || ''}</span>
                    <span class="menu-price">$${Number(item.precio).toFixed(2)}</span>
                </div>
                ${!estaAgotado ? '<button class="btn btn-primary btn-agregar w-100 mt-2">Agregar al carrito</button>' : ''}
            </div>
        `;

        if (!estaAgotado) {
            const btn = tarjeta.querySelector('.btn-agregar');
            btn.onclick = (e) => {
                e.stopPropagation();
                cart = addToCart({
                    id: item.id,
                    name: item.nombre,
                    price: item.precio,
                    imageUrl: item.imagenUrl
                });
                paintCart();
            };
        }
        const verMas = tarjeta.querySelector('.ver-mas-link');
if (verMas) {
    verMas.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = new bootstrap.Modal(document.getElementById('modalDescripcionLarga'));
        const modalBody = document.querySelector('#modalDescripcionLarga .modal-body');
        modalBody.innerText = verMas.getAttribute('data-desc');
        modal.show();
    });
}

        container.appendChild(tarjeta);
    });
}


async function renderOrdersModal() {
    const user = JSON.parse(localStorage.getItem('user'));
    const container = document.getElementById('ordersListContainer');
    if (!container) return;

    if (!user) {
        container.innerHTML = '<p class="text-muted">No se encontró información del usuario.</p>';
        return;
    }

    container.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"></div><p>Cargando tus órdenes...</p></div>';

    try {
        const respuesta = await fetch('http://localhost:4000/api/orders');
        if (!respuesta.ok) throw new Error('Error al obtener órdenes');

        const todasLasOrdenes = await respuesta.json();
        
        let misOrdenes = [];
        if (user.email) {
            misOrdenes = todasLasOrdenes.filter(orden => orden.studentEmail === user.email);
        } else {
            const guestId = getGuestId();
            misOrdenes = todasLasOrdenes.filter(orden => orden.guestId === guestId);
        }

        if (misOrdenes.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Aún no tienes órdenes activas.</div>';
            return;
        }

        misOrdenes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        let html = '<div class="list-group">';
        misOrdenes.forEach(order => {
            const fecha = new Date(order.createdAt).toLocaleString();

            // Normalización de productos
            let items = [];
            if (Array.isArray(order.items)) {
                items = order.items;
            } else if (Array.isArray(order.productos)) {
                items = order.productos.map(p => ({
                    name: p.nombre || 'Producto',
                    qty: p.cantidad || 1,
                    price: p.precio || 0
                }));
            }

            const itemsCount = items.reduce((sum, item) => sum + (item.qty || 1), 0);

            // Obtener color del estado
            const estadoActual = order.status || 'pendiente';
            let colorBadge = 'bg-secondary';
            if (estadoActual === 'pendiente') colorBadge = 'bg-warning text-dark';
            if (estadoActual === 'preparacion' || estadoActual === 'preparando') colorBadge = 'bg-primary';
            if (estadoActual === 'lista' || estadoActual === 'listo') colorBadge = 'bg-success';
            if (estadoActual === 'recogido') colorBadge = 'bg-info';

            html += `
                <div class="list-group-item list-group-item-action flex-column align-items-start mb-2 rounded-3 shadow-sm">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1 fw-bold">Orden #${order.id || order._id || 'S/N'}</h6>
                        <small class="text-muted">${fecha}</small>
                    </div>
                    <p class="mb-1"><strong>Total:</strong> $${Number(order.total || 0).toFixed(2)}</p>
                    <p class="mb-1"><strong>Estado:</strong> <span class="badge ${colorBadge}">${estadoActual}</span></p>
                    <p class="mb-1"><strong>Items:</strong> ${itemsCount} producto(s)</p>
                    <p class="mb-0 small text-muted"><strong>Nota:</strong> ${order.notes || 'Sin nota'}</p>
                    <button class="btn btn-sm btn-outline-primary mt-2 toggle-items" data-order-id="${order.id}">Ver productos</button>
                    <div id="items-${order.id}" class="mt-2 small d-none">
                        <hr>
                        <ul class="mb-0">
                        ${items.map(item => {
                            const precioCalculado = (item.price || 0) * (item.qty || 1);
                            const textoPrecio = precioCalculado > 0 ? `- $${precioCalculado.toFixed(2)}` : '';
                            return `<li>${item.qty || 1} x ${item.name || 'Producto'} ${textoPrecio}</li>`;
                        }).join('')}    
                        </ul>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;

        // Re-agregar los event listeners para botones de "Ver productos"
        document.querySelectorAll('.toggle-items').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const orderId = btn.getAttribute('data-order-id');
                const itemsDiv = document.getElementById(`items-${orderId}`);
                if (itemsDiv) {
                    itemsDiv.classList.toggle('d-none');
                    btn.textContent = itemsDiv.classList.contains('d-none') ? 'Ver productos' : 'Ocultar productos';
                }
            });
        });

    } catch (error) {
        console.error('Error al cargar órdenes:', error);
        container.innerHTML = '<div class="alert alert-danger">Error al cargar tus órdenes. Intenta de nuevo más tarde.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return window.location.href = 'login.html';
    const welcome = document.getElementById('welcome-msg');
    if (welcome) welcome.innerText = `¡Hola, ${user.name || 'Invitado'}!`;
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
    const ordersModal = document.getElementById('ordersModal');
    if (ordersModal) {
        ordersModal.addEventListener('show.bs.modal', renderOrdersModal);
    }

    setupCartEvents();


    cargarMenuEstudiante().then(() => {
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortSelect');
        if (searchInput) searchInput.addEventListener('input', aplicarFiltros);
        if (sortSelect) sortSelect.addEventListener('change', aplicarFiltros);
        paintCart();
    });


    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (clearCartBtn) clearCartBtn.onclick = () => { cart = clearCart(); paintCart(); };

    // LÓGICA DE PAGOS

    const btnEfectivo = document.getElementById('btn-efectivo');
    const btnTarjeta = document.getElementById('btn-tarjeta');
    const modalTarjetaEl = document.getElementById('modalTarjeta');
    const btnConfirmarTarjeta = document.getElementById('submit-payment');

    // PAGO EN EFECTIVO 
    if (btnEfectivo) {
        btnEfectivo.addEventListener('click', async () => {
            const { total } = cartTotals(cart);
            if (total <= 0) {
                alert('Carrito vacío. Agrega comida a tu orden.');
                return;
            }

            const userData = JSON.parse(localStorage.getItem('user')) || {};
            const order = {
                id: `ORD-${Date.now().toString().slice(-6)}`,
                studentName: userData.name || 'Invitado',
                studentEmail: userData.email || '',
                createdAt: new Date().toISOString(),
                status: 'pendiente',
                items: cart.map(item => ({ ...item, price: Number(item.price) })),
                total: Number(total.toFixed(2)),
                notes: '💵 PAGO EN EFECTIVO (Cobrar en caja)'
            };

            await saveOrder(order);
            cart = clearCart();
            paintCart();
            alert('¡Orden registrada! Pasa a la caja de la cafetería a realizar tu pago en efectivo ¡BUEN DIA !.');
            window.location.reload();
        });
    }

    // PAGO CON TARJETA (STRIPE) 
    if (modalTarjetaEl && btnConfirmarTarjeta) {
        const stripe = Stripe('pk_test_51TEBCLI5Hs25VoV6fo3q1y5CXlEogTuGXi7nP1B9OeJ3JC54nitNNKtmwIUFHP2qTdmKMRQyftDGhqYlqb2goYTh00rcknGEPN');
        let elements, cardElement, clientSecretActual = '';

        modalTarjetaEl.addEventListener('show.bs.modal', async (event) => {
            const { total } = cartTotals(cart);
            if (total <= 0) {
                event.preventDefault();
                return alert('Carrito vacío. Agrega comida antes de pagar con tarjeta.');
            }

            btnConfirmarTarjeta.textContent = `Confirmar Pago de $${total.toFixed(2)}`;
            btnConfirmarTarjeta.disabled = true;

            try {
                if (!elements) {
                    elements = stripe.elements();
                    cardElement = elements.create('card', {
                        style: { base: { fontSize: '16px', color: '#32325d', fontFamily: 'Poppins, sans-serif' } }
                    });
                    cardElement.mount('#card-element');
                    cardElement.on('change', ({ error }) => {
                        document.getElementById('card-errors').textContent = error ? error.message : '';
                    });
                }

                const userData = JSON.parse(localStorage.getItem('user')) || {};
                const respuesta = await fetch('http://localhost:4000/api/payments/create-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: total, customerEmail: userData.email || "estudiante@uni.edu.mx" })
                });

                const resultado = await respuesta.json();
                if (!resultado.success) throw new Error(resultado.message);

                clientSecretActual = resultado.clientSecret;
                btnConfirmarTarjeta.disabled = false;
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('card-errors').textContent = 'Error al conectar con el servidor. Cierra e intenta de nuevo.';
            }
        });

        btnConfirmarTarjeta.addEventListener('click', async () => {
            btnConfirmarTarjeta.disabled = true;
            btnConfirmarTarjeta.textContent = 'Procesando pago... ⏳';

            const userData = JSON.parse(localStorage.getItem('user')) || {};
            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecretActual, {
                payment_method: {
                    card: cardElement,
                    billing_details: { name: userData.name || 'Estudiante UG' }
                }
            });

            if (error) {
                document.getElementById('card-errors').textContent = error.message;
                btnConfirmarTarjeta.disabled = false;
                btnConfirmarTarjeta.textContent = 'Reintentar Pago';
            } else if (paymentIntent.status === 'succeeded') {
                const { total } = cartTotals(cart);
                const order = {
                    id: `ORD-${Date.now().toString().slice(-6)}`,
                    studentName: userData.name || 'Invitado',
                    studentEmail: userData.email || '',
                    guestId: !userData.email ? getGuestId() : null, 
                    createdAt: new Date().toISOString(),
                    status: 'pendiente',
                    items: cart.map(item => ({ ...item, price: Number(item.price) })),
                    total: Number(total.toFixed(2)),
                    paymentIntentId: paymentIntent.id,
                    notes: '💳 PAGADO CON TARJETA (Stripe)'
                };

                const servidorGuardado = await saveOrder(order);
                if (servidorGuardado) {
                    if (!userData.email) saveGuestOrderLocally(order);
                    cart = clearCart();
                    paintCart();

                    const modalInstancia = bootstrap.Modal.getInstance(modalTarjetaEl);

                    if (modalInstancia) {
                        // el modal terminó de cerrarse 
                        modalTarjetaEl.addEventListener('hidden.bs.modal', () => {
                            alert('¡PAGO EXITOSO! 💸 Tu orden ya está en la cocina.');
                            window.location.reload();
                        }, { once: true }); //asegura que el evento se destruya 

                        modalInstancia.hide();
                    } else {
                        // Por si acaso el modal no existía como instancia, recargamos directo
                        alert('¡PAGO EXITOSO! 💸 Tu orden ya está en la cocina.');
                        window.location.reload();
                    }
                }
            }
        });
    }
});