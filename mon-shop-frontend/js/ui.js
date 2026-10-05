export const renderProducts = (products, onProductClick, onAddToCart) => {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted);">Aucune pièce trouvée.</p>';
        return;
    }

    products.forEach((product) => {
        const card = document.createElement('div');
        card.className = 'product-card interactive';
        
        card.innerHTML = `
            <div class="image-wrapper">
                ${product.is_sale ? '<span class="sale-tag">SOLDE</span>' : ''}
                <img src="${product.image}" alt="${product.name}">
            </div>
            <h3 class="product-title">${product.name}</h3>
            <div class="price-box">
                <span class="product-price">${Number(product.price).toFixed(2).replace('.', ',')} €</span>
                ${product.old_price ? `<span class="old-price">${Number(product.old_price).toFixed(2).replace('.', ',')} €</span>` : ''}
            </div>
        `;

        // Clic sur la carte pour voir les détails
        card.addEventListener('click', () => onProductClick(product.id));
        grid.appendChild(card);
    });

    initCursor();
};

export const renderProductDetail = (data, onAddToCart, onRecoClick) => {
    const content = document.getElementById('product-detail-content');
    const { product, recommendations } = data;

    content.innerHTML = `
        <div class="detail-container">
            <div class="detail-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="detail-info">
                <h2>${product.name}</h2>
                <div class="price-box" style="font-size: 1.2rem;">
                    <span class="product-price">${Number(product.price).toFixed(2).replace('.', ',')} €</span>
                    ${product.old_price ? `<span class="old-price">${Number(product.old_price).toFixed(2).replace('.', ',')} €</span>` : ''}
                </div>
                <p class="detail-desc">${product.description}</p>
                <button class="add-btn interactive" id="detail-add-bag">Ajouter au panier</button>
            </div>
        </div>

        <div class="reco-section">
            <h3>Vous aimerez aussi</h3>
            <div class="product-grid" id="reco-grid"></div>
        </div>
    `;

    document.getElementById('detail-add-bag').addEventListener('click', () => onAddToCart(product));

    // Afficher les recommandations
    const recoGrid = document.getElementById('reco-grid');
    recommendations.forEach(reco => {
        const card = document.createElement('div');
        card.className = 'product-card interactive';
        card.innerHTML = `
            <div class="image-wrapper"><img src="${reco.image}" alt="${reco.name}"></div>
            <h3 class="product-title">${reco.name}</h3>
            <span class="product-price">${Number(reco.price).toFixed(2).replace('.', ',')} €</span>
        `;
        card.addEventListener('click', () => onRecoClick(reco.id));
        recoGrid.appendChild(card);
    });

    initCursor();
};

export const renderCartDrawer = (cart, onUpdateQty, onDeleteItem) => {
    const container = document.getElementById('cart-drawer-items');
    const countBadge = document.getElementById('cart-count');
    const totalPriceEl = document.getElementById('cart-total-price');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    countBadge.textContent = totalCount;

    const totalSum = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    totalPriceEl.textContent = `${totalSum.toFixed(2).replace('.', ',')} €`;

    if (cart.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align:center; margin-top: 40px;">Votre panier est vide.</p>';
        return;
    }

    container.innerHTML = '';
    cart.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${Number(item.price).toFixed(2).replace('.', ',')} €</div>
                <div class="cart-item-actions">
                    <button class="qty-btn interactive" data-id="${item.id}" data-action="minus">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn interactive" data-id="${item.id}" data-action="plus">+</button>
                    <button class="remove-item interactive" data-id="${item.id}">Supprimer</button>
                </div>
            </div>
        `;
        container.appendChild(el);
    });

    // Événements du panier
    container.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            const action = e.target.dataset.action;
            onUpdateQty(id, action);
        });
    });

    container.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            onDeleteItem(id);
        });
    });

    initCursor();
};

const initCursor = () => {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('.interactive, button, .product-card, input, select').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
};