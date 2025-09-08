// Initialize products in localStorage if empty
function initializeProducts() {
  const existingProducts = [
    { id: 1, name: 'Geometric Dreams', price: 29.99, image: './images/3875fb020edb1e7ecfddbf716566a31b.jpg' },
    { id: 2, name: 'Abstract Waves', price: 34.99, image: './images/3875fb020edb1e7ecfddbf716566a31b.jpg' }
  ];
  if (!localStorage.getItem('products')) {
    localStorage.setItem('products', JSON.stringify(existingProducts));
  }
}

// Load products from localStorage and render them
function loadProducts() {
  initializeProducts();
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const collectionSection = document.querySelector('.collection-section');

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-product-id', product.id);
    card.setAttribute('data-product-name', product.name);
    card.setAttribute('data-product-price', product.price);
    card.setAttribute('data-product-image', product.image);

    card.innerHTML = `
      <div class="card-img">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="card-info">
        <strong>${product.name}</strong>
        <br />
        <b>$${product.price}</b>
        <br />
        <br />
        <button class="btn add-to-cart-btn">Add to Cart</button>
      </div>
    `;

    collectionSection.appendChild(card);
  });
}

// Call loadProducts on page load
document.addEventListener('DOMContentLoaded', loadProducts);
