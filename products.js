// Load products from backend and render them
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    const collectionSection = document.querySelector('.collection-section');

    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-product-id', product.id);
      card.setAttribute('data-product-name', product.name);
      card.setAttribute('data-product-price', product.price);
      card.setAttribute('data-product-image', `./images/${product.image}`);
      card.setAttribute('data-product-sizes', JSON.stringify(product.sizes || []));
      card.setAttribute('data-product-quantity', product.quantity || 0);

      card.innerHTML = `
        <div class="card-img">
          <img src="./images/${product.image}" alt="${product.name}" />
        </div>
        <div class="card-info">
          <strong>${product.name}</strong>
          <br />
          <b>₦${product.price}</b>
          <br />
          <br />
          <button class="btn add-to-cart-btn">Add to Cart</button>
        </div>
      `;

      collectionSection.appendChild(card);
    });

    // Attach event listeners to the newly created add to cart buttons
    if (window.attachAddToCartListeners) {
      window.attachAddToCartListeners();
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Call loadProducts on page load
document.addEventListener('DOMContentLoaded', loadProducts);
