document.addEventListener('DOMContentLoaded', () => {
  const cartIcon = document.querySelector('.cart-icon');
  const cartDropdown = document.querySelector('.cart-dropdown');
  const closeIcon = document.querySelector('.cart-dropdown .x-icon');
  const cartCountBadge = document.querySelector('.cart-count-badge');
  const cartItemsContainer = document.querySelector('.cart-items-container');
  const orderItemsContainer = document.querySelector('.order-items');
  const totalPriceElement = document.querySelector('.total-price');

  let cart = [];

  function formatPrice(price) {
    return '$' + price.toFixed(2);
  }

  function updateCartCount() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalCount;
    if (totalCount === 0) {
      cartCountBadge.style.display = 'none';
    } else {
      cartCountBadge.style.display = 'inline-block';
    }
  }

  function renderCartItems() {
    cartItemsContainer.innerHTML = '';
    orderItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          fill="none"
          stroke="#6b7280"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="feather feather-shopping-bag"
          viewBox="0 0 24 24"
          style="display: block; margin: 0 auto 1rem auto;"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h2 style="text-align: center; font-weight: 700; color: #111827; margin-bottom: 0.5rem;">Your cart is empty</h2>
        <p style="text-align: center; color: #6b7280; margin-bottom: 1.5rem;">
          Looks like you haven't added any items to your cart yet.
        </p>
        <a href="#" class="btn continue-shopping-btn" style="display: block; width: 100%; text-align: center; padding: 0.75rem 0; background-color: #f9733e; color: white; border-radius: 9999px; font-weight: 600; text-decoration: none;">
          Continue Shopping
        </a>
      `;
      totalPriceElement.textContent = formatPrice(0);
      return;
    }

    cart.forEach((item, index) => {
      // Cart item element
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');
      cartItem.style = 'display: flex; align-items: center; justify-content: space-between; background: #f9fafb; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;';

      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"/>
        <div style="flex-grow: 1; margin-left: 1rem;">
          <div style="color: #4b5563; font-size: 0.875rem;">Size: M</div>
          <div style="font-weight: 700; color: #111827;">${item.name}</div>
          <div style="color: #f9733e; font-weight: 700;">${formatPrice(item.price)}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="quantity-btn" data-index="${index}" data-action="decrease" style="background: white; border-radius: 9999px; border: none; width: 32px; height: 32px; font-size: 1.5rem; cursor: pointer;">−</button>
          <div style="min-width: 24px; text-align: center;">${item.quantity}</div>
          <button class="quantity-btn" data-index="${index}" data-action="increase" style="background: white; border-radius: 9999px; border: none; width: 32px; height: 32px; font-size: 1.5rem; cursor: pointer;">+</button>
          <button class="delete-btn" data-index="${index}" style="background: none; border: none; color: #ef4444; font-size: 1.5rem; cursor: pointer;">🗑️</button>
        </div>
      `;

      cartItemsContainer.appendChild(cartItem);

      // Order summary item
      const orderItem = document.createElement('div');
      orderItem.style = 'display: flex; justify-content: space-between; margin-bottom: 0.5rem;';
      orderItem.textContent = `${item.name} (M) × ${item.quantity}`;
      const priceSpan = document.createElement('span');
      priceSpan.style.color = '#f9733e';
      priceSpan.textContent = formatPrice(item.price * item.quantity);
      orderItem.appendChild(priceSpan);
      orderItemsContainer.appendChild(orderItem);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPriceElement.textContent = formatPrice(total);

    // Add event listeners for quantity buttons and delete buttons
    const quantityButtons = cartItemsContainer.querySelectorAll('.quantity-btn');
    quantityButtons.forEach(button => {
      button.addEventListener('click', () => {
        const index = parseInt(button.getAttribute('data-index'));
        const action = button.getAttribute('data-action');
        if (action === 'increase') {
          cart[index].quantity++;
        } else if (action === 'decrease') {
          if (cart[index].quantity > 1) {
            cart[index].quantity--;
          }
        }
        updateCartCount();
        renderCartItems();
      });
    });

    const deleteButtons = cartItemsContainer.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const index = parseInt(button.getAttribute('data-index'));
        cart.splice(index, 1);
        updateCartCount();
        renderCartItems();
      });
    });
  }

  function addToCart(product) {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity++;
    } else {
      cart.push({...product, quantity: 1});
    }
    updateCartCount();
    renderCartItems();
  }

  if (cartIcon && cartDropdown && closeIcon) {
    cartIcon.addEventListener('click', () => {
      if (cartDropdown.hasAttribute('hidden')) {
        cartDropdown.removeAttribute('hidden');
      } else {
        cartDropdown.setAttribute('hidden', '');
      }
    });

    closeIcon.addEventListener('click', () => {
      cartDropdown.setAttribute('hidden', '');
    });
  }

  // Add event listeners to all add to cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      const product = {
        id: card.getAttribute('data-product-id'),
        name: card.getAttribute('data-product-name'),
        price: parseFloat(card.getAttribute('data-product-price')),
        image: card.getAttribute('data-product-image')
      };
      addToCart(product);
    });
  });

  updateCartCount();
  renderCartItems();
});
