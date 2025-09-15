document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const totalPriceElement = document.getElementById('total-price');
  const shippingForm = document.getElementById('shipping-form');

  function formatPrice(price) {
    return '$' + price.toFixed(2);
  }

  function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
      totalPriceElement.textContent = formatPrice(0);
      return;
    }

    cart.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.classList.add('cart-item');

      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-details">
          <div class="size">Size: ${item.size || 'M'}</div>
          <div class="name">${item.name}</div>
          <div class="price">${formatPrice(item.price)}</div>
        </div>
        <div class="cart-item-quantity">
          Quantity: ${item.quantity}
        </div>
      `;

      cartItemsContainer.appendChild(cartItem);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalPriceElement.textContent = formatPrice(total);
  }

  shippingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(shippingForm);
    const shippingInfo = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city')
    };

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const order = {
      shippingInfo,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: 'pending',
      orderDate: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      if (response.ok) {
        alert('Order placed successfully! Thank you for your purchase.');
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
      } else {
        alert('Error placing order.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order.');
    }
  });

  loadCart();
});
