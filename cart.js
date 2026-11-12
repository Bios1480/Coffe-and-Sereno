const CART_STORAGE_KEY = 'cafeCart';

let cartToastTimeout;

function readCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    renderCart(cart);
}

function formatCartPrice(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function renderCart(cart) {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const clearButton = document.getElementById('clearCartBtn');
    const checkoutButton = document.getElementById('checkoutBtn');

    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCount.textContent = String(itemCount);
    cartTotal.textContent = formatCartPrice(total);
    clearButton.disabled = itemCount === 0;
    checkoutButton.disabled = itemCount === 0;
    cartItems.replaceChildren();

    if (!cart.length) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'cart-empty';
        emptyMessage.textContent = 'Seu carrinho está vazio.';
        cartItems.appendChild(emptyMessage);
        return;
    }

    cart.forEach(item => {
        const row = document.createElement('article');
        row.className = 'cart-item';

        const info = document.createElement('div');
        info.className = 'cart-item-info';
        const name = document.createElement('strong');
        name.textContent = item.title;
        const price = document.createElement('span');
        price.textContent = `${formatCartPrice(item.price)} cada`;
        info.append(name, price);

        const controls = document.createElement('div');
        controls.className = 'cart-item-controls';
        controls.append(
            createCartActionButton('decrease', item.title, '−', 'Diminuir quantidade'),
            document.createTextNode(String(item.quantity)),
            createCartActionButton('increase', item.title, '+', 'Aumentar quantidade'),
            createCartActionButton('remove', item.title, 'Remover', 'Remover produto', 'cart-remove')
        );

        row.append(info, controls);
        cartItems.appendChild(row);
    });
}

function createCartActionButton(action, itemId, label, accessibleLabel, className = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.cartAction = action;
    button.dataset.cartId = String(itemId);
    button.setAttribute('aria-label', accessibleLabel);
    button.textContent = label;
    if (className) button.className = className;
    return button;
}

function showCartToast(message) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cartToast';
        toast.className = 'cart-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.remove('hidden');
    window.clearTimeout(cartToastTimeout);
    cartToastTimeout = window.setTimeout(() => toast.classList.add('hidden'), 2400);
}

document.addEventListener('DOMContentLoaded', () => {
    const cartDialog = document.getElementById('cartDialog');
    const cartView = document.getElementById('cartView');
    const checkoutSuccess = document.getElementById('checkoutSuccess');
    const cartButton = document.getElementById('cartButton');
    const closeCartButton = document.getElementById('closeCartBtn');
    const closeSuccessButton = document.getElementById('closeSuccessBtn');
    const returnToShopButton = document.getElementById('returnToShopBtn');
    const clearCartButton = document.getElementById('clearCartBtn');
    const checkoutButton = document.getElementById('checkoutBtn');

    renderCart(readCart());

    const showCartView = () => {
        cartView.hidden = false;
        checkoutSuccess.hidden = true;
        cartDialog.setAttribute('aria-labelledby', 'cartTitle');
    };

    cartButton.addEventListener('click', () => {
        showCartView();
        cartDialog.showModal();
    });
    closeCartButton.addEventListener('click', () => cartDialog.close());
    closeSuccessButton.addEventListener('click', () => cartDialog.close());
    returnToShopButton.addEventListener('click', () => cartDialog.close());
    cartDialog.addEventListener('close', showCartView);
    cartDialog.addEventListener('click', event => {
        if (event.target === cartDialog) cartDialog.close();
    });

    document.addEventListener('click', event => {
        const addButton = event.target.closest('[data-cart-add]');
        if (addButton) {
            const product = {
                title: addButton.dataset.productName,
                price: Number(addButton.dataset.productPrice),
                image: addButton.dataset.productImage || '',
                quantity: 1
            };
            const cart = readCart();
            const existingItem = cart.find(item => item.title === product.title);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push(product);
            }

            saveCart(cart);
            showCartToast(`${product.title} adicionado ao carrinho.`);
            return;
        }

        const actionButton = event.target.closest('[data-cart-action]');
        if (!actionButton) return;

        const cart = readCart();
        const item = cart.find(entry => entry.title === actionButton.dataset.cartId);
        if (!item) return;

        if (actionButton.dataset.cartAction === 'increase') item.quantity += 1;
        if (actionButton.dataset.cartAction === 'decrease') item.quantity -= 1;
        const updatedCart = actionButton.dataset.cartAction === 'remove' || item.quantity <= 0
            ? cart.filter(entry => entry.title !== actionButton.dataset.cartId)
            : cart;
        saveCart(updatedCart);
    });

     clearCartButton.addEventListener('click', () => saveCart([]));
    checkoutButton.addEventListener('click', () => {
        const cart = readCart();
        if (!cart.length) return;
        const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
        const orderTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        document.getElementById('orderReference').textContent = `CS-${Date.now().toString(36).toUpperCase()}`;
        document.getElementById('orderItemCount').textContent = String(itemCount);
        document.getElementById('orderTotal').textContent = formatCartPrice(orderTotal);
        saveCart([]);
        cartView.hidden = true;
        checkoutSuccess.hidden = false;
        cartDialog.setAttribute('aria-labelledby', 'checkoutTitle');
    });
});
