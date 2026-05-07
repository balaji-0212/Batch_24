const API_URL = "https://fakestoreapi.com/products/";
let allProducts = []; 

const EXCHANGE_RATE = 83; 

let cart = JSON.parse(localStorage.getItem('cart')) || []; 
document.getElementById('cart-count').innerText = cart.length;

const productContainer = document.getElementById('product-container');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal-btn');

function fetchProducts() {
    productContainer.innerHTML = `<div class="message">Loading...</div>`;

    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            allProducts = data;
            extractCategories(data);
            displayProducts(data); 
        })
        .catch(error => {
            console.error("API Error:", error);
            productContainer.innerHTML = `<div class="message error">Failed to load data</div>`;
        });
}

function displayProducts(products) {
    productContainer.innerHTML = ""; 

    if (products.length === 0) {
        productContainer.innerHTML = `<div class="message">No products found.</div>`;
        return;
    }

    products.forEach(product => {
        const shortTitle = product.title.length > 50 
            ? product.title.substring(0, 50) + "..." 
            : product.title;
        
        const shortDesc = product.description.length > 60 
            ? product.description.substring(0, 60) + "..." 
            : product.description;

        const localPrice = product.price * EXCHANGE_RATE;

        const card = document.createElement('div');
        card.className = "card";
        
        card.innerHTML = `
            <img src="${product.image}" alt="Product Image">
            <div class="card-title">${shortTitle}</div>
            <div class="card-price">₹${localPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="card-desc">${shortDesc}</div>
            <div class="btn-group">
                <button class="btn-view" onclick="openModal(${product.id})">View More</button>
                <button class="btn-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;

        productContainer.appendChild(card);
    });
}

function extractCategories(data) {
    const categories = [...new Set(data.map(item => item.category))];
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
        categorySelect.appendChild(option);
    });
}

function applyFilters() {
    let filtered = [...allProducts];

    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm));
    }

    const category = categorySelect.value;
    if (category !== "all") {
        filtered = filtered.filter(p => p.category === category);
    }

    const sortMethod = sortSelect.value;
    if (sortMethod === "low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortMethod === "high") {
        filtered.sort((a, b) => b.price - a.price);
    }

    displayProducts(filtered);
}

searchInput.addEventListener('input', applyFilters);
categorySelect.addEventListener('change', applyFilters);
sortSelect.addEventListener('change', applyFilters);

window.addToCart = function(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart));
        document.getElementById('cart-count').innerText = cart.length;
        alert(`Added to cart: ${product.title}`);
    }
};

window.openModal = function(productId) {
    const product = allProducts.find(p => p.id === productId);
    if(product) {
        document.getElementById('modal-img').src = product.image;
        document.getElementById('modal-title').innerText = product.title;
        
        const localPrice = product.price * EXCHANGE_RATE;
        document.getElementById('modal-price').innerText = `₹${localPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        document.getElementById('modal-desc').innerText = product.description;
        
        modalOverlay.style.display = 'flex';
    }
};

function closeModal() {
    modalOverlay.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

fetchProducts();