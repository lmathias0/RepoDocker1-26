import { fetchProducts, fetchProductDetail } from './api.js';
import { renderProducts, renderProductDetail, renderCartDrawer } from './ui.js';

let cart = [];
let currentFilters = { search: '', category: 'Tous', sort: 'default', sale: false };

const initApp = async () => {
    loadProducts();
    setupEventListeners();
};

const loadProducts = async () => {
    const products = await fetchProducts(currentFilters);
    renderProducts(products, handleOpenDetail, handleAddToCart);
};

const handleOpenDetail = async (id) => {
    const data = await fetchProductDetail(id);
    if (!data) return;

    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    renderProductDetail(data, handleAddToCart, handleOpenDetail);
};

const handleAddToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    renderCartDrawer(cart, handleUpdateQty, handleDeleteCartItem);
    openCartDrawer();
};

const handleUpdateQty = (id, action) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    if (action === 'plus') item.quantity += 1;
    if (action === 'minus') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    renderCartDrawer(cart, handleUpdateQty, handleDeleteCartItem);
};

const handleDeleteCartItem = (id) => {
    cart = cart.filter(i => i.id !== id);
    renderCartDrawer(cart, handleUpdateQty, handleDeleteCartItem);
};

const openCartDrawer = () => {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
};

const closeCartDrawer = () => {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
};

const setupEventListeners = () => {
    // Navigation retour accueil
    document.getElementById('home-link').addEventListener('click', () => {
        document.getElementById('detail-view').classList.add('hidden');
        document.getElementById('home-view').classList.remove('hidden');
        loadProducts();
    });

    document.getElementById('back-to-home').addEventListener('click', () => {
        document.getElementById('detail-view').classList.add('hidden');
        document.getElementById('home-view').classList.remove('hidden');
    });

    // Panier tiroir
    document.getElementById('open-cart').addEventListener('click', openCartDrawer);
    document.getElementById('close-cart').addEventListener('click', closeCartDrawer);
    document.getElementById('cart-overlay').addEventListener('click', closeCartDrawer);

    // Recherche
    document.getElementById('search-input').addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        loadProducts();
    });

    // Filtres catégories
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.category = e.target.dataset.cat;
            loadProducts();
        });
    });

    // Filtre soldes
    const saleBtn = document.getElementById('filter-sale');
    saleBtn.addEventListener('click', () => {
        currentFilters.sale = !currentFilters.sale;
        saleBtn.classList.toggle('active', currentFilters.sale);
        loadProducts();
    });

    // Tri prix
    document.getElementById('sort-select').addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        loadProducts();
    });
};

document.addEventListener('DOMContentLoaded', initApp);