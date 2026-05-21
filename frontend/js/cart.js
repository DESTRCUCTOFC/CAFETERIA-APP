const CART_KEY = 'ug_cart_v1';

export function readCart() {
    try {
        const data = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(data) ? data : [];
    } catch { return []; }
}
export function writeCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

export function addToCart(product) {
    const cart = readCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx >= 0) cart[idx].qty++;
    else cart.push({ ...product, qty: 1 });
    writeCart(cart);
    return cart;
}
export function updateQty(id, qty) {
    const cart = readCart();
    const item = cart.find(i => i.id === id);
    if (item) item.qty = Math.max(1, qty);
    writeCart(cart);
    return cart;
}
export function removeItem(id) {
    const cart = readCart().filter(i => i.id !== id);
    writeCart(cart);
    return cart;
}
export function clearCart() { writeCart([]); return []; }
export function cartTotals(cart = []) {
    const count = cart.reduce((a, i) => a + i.qty, 0);
    const total = cart.reduce((a, i) => a + i.qty * i.price, 0);
    return { count, total };
}


export function renderCartHTML(cartItemsEl, cartEmptyEl, cartTotalEl, cartCountEl, cart) {
    const { count, total } = cartTotals(cart);
    cartCountEl.textContent = count;
    cartTotalEl.textContent = `$${total.toFixed(2)}`;
    cartEmptyEl.classList.toggle("d-none", cart.length !== 0);
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '';
        return;
    }
    cartItemsEl.innerHTML = cart.map(item => `
        <div class="border rounded-3 p-2 bg-white d-flex gap-2 align-items-center">
            <img src="${item.imageUrl || 'https://via.placeholder.com/56'}" width="56" height="56" style="object-fit:cover" class="rounded-2">
            <div class="flex-grow-1">
                <div class="fw-semibold">${item.name}</div>
                <div class="text-muted small">$${Number(item.price).toFixed(2)} c/u</div>
            </div>
            <div class="d-flex align-items-center gap-2">
                <input class="form-control form-control-sm" style="width:72px" type="number" min="1" value="${item.qty}" data-qty="${item.id}">
                <button class="btn btn-outline-danger btn-sm" data-remove="${item.id}">✕</button>
            </div>
        </div>
    `).join("");
}


