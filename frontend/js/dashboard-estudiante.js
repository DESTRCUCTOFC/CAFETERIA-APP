import { readCart, addToCart, updateQty, removeItem, clearCart, renderCartHTML, cartTotals } from './cart.js';

const API_URL = 'http://localhost:3000/api/menu';
const ORDERS_KEY = 'ug_orders_v1';
let allPlatillos = [];
let cart = readCart();

function readOrders() {
    try {
        const data = JSON.parse(localStorage.getItem(ORDERS_KEY));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveOrder(order) {
    const orders = readOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return orders;
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
            if (!estaAgotado) {
                tarjeta.style.cursor = 'pointer';
                tarjeta.onclick = () => {
                    cart = addToCart({
                        id: item.id,
                        name: item.nombre,
                        price: item.precio,
                        imageUrl: item.imagenUrl
                    });
                    paintCart();
                };
            } else {
                tarjeta.style.cursor = 'not-allowed';
            }

            tarjeta.innerHTML = `
                <img src="${imagenUrl}" alt="${item.nombre}" class="menu-img">
                <div class="menu-info">
                    <h3 class="menu-title">
                        ${item.nombre} 
                        ${etiquetaAgotado}
                    </h3>
                    <p class="menu-desc">${item.descripcion || ''}</p>
                    <div class="menu-footer">
                        <span class="badge-categoria">${item.categoria || ''}</span>
                        <span class="menu-price">$${Number(item.precio).toFixed(2)}</span>
                    </div>
                </div>
            `;
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
        if (!estaAgotado) {
            tarjeta.style.cursor = 'pointer';
            tarjeta.onclick = () => {
                cart = addToCart({
                    id: item.id,
                    name: item.nombre,
                    price: item.precio,
                    imageUrl: item.imagenUrl
                });
                paintCart();
            };
        } else {
            tarjeta.style.cursor = 'not-allowed';
        }
        tarjeta.innerHTML = `
            <img src="${imagenUrl}" alt="${item.nombre}" class="menu-img">
            <div class="menu-info">
                <h3 class="menu-title">
                    ${item.nombre} 
                    ${etiquetaAgotado}
                </h3>
                <p class="menu-desc">${item.descripcion || ''}</p>
                <div class="menu-footer">
                    <span class="badge-categoria">${item.categoria || ''}</span>
                    <span class="menu-price">$${Number(item.precio).toFixed(2)}</span>
                </div>
            </div>
        `;
        container.appendChild(tarjeta);
    });
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
    if (checkoutBtn) checkoutBtn.onclick = () => {
        if (!cart.length) {
            alert('Carrito vacío');
            return;
        }

        const userData = JSON.parse(localStorage.getItem('user')) || {};
        const { total } = cartTotals(cart);
        const now = new Date();
        const order = {
            id: `ORD-${Date.now().toString().slice(-6)}`,
            studentName: userData.name || 'Invitado',
            studentEmail: userData.email || '',
            createdAt: now.toISOString(),
            status: 'pendiente',
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                qty: item.qty,
                imageUrl: item.imageUrl || ''
            })),
            total: Number(total.toFixed(2)),
            notes: ''
        };

        saveOrder(order);
        cart = clearCart();
        paintCart();
        alert('Tu orden quedó registrada. El staff ya puede verla.');
    };
});