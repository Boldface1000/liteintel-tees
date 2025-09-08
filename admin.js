// Dummy data for analytics
const analyticsData = {
  visits: 1500,
  sales: 750,
  items: 300
};

// Function to get all products from localStorage
function getAllProducts() {
  return JSON.parse(localStorage.getItem('products')) || [];
}

// Password for admin login
const adminPassword = 'liteinteladmin';

// Function to handle login
function login() {
  const password = document.getElementById('admin-password').value;
  if (password === adminPassword) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('analytics-section').style.display = 'block';
    renderCharts();
    renderExistingProducts();
  } else {
    alert('Incorrect password. Please try again.');
  }
}

// Function to render pie charts
function renderCharts() {
  // Visits chart
  const visitsCtx = document.getElementById('visits-chart').getContext('2d');
  new Chart(visitsCtx, {
    type: 'pie',
    data: {
      labels: ['Unique Visits', 'Returning Visits'],
      datasets: [{
        data: [analyticsData.visits * 0.7, analyticsData.visits * 0.3],
        backgroundColor: ['#f9733e', '#e05a1a']
      }]
    }
  });

  // Sales chart
  const salesCtx = document.getElementById('sales-chart').getContext('2d');
  new Chart(salesCtx, {
    type: 'pie',
    data: {
      labels: ['Completed Sales', 'Pending Sales'],
      datasets: [{
        data: [analyticsData.sales * 0.8, analyticsData.sales * 0.2],
        backgroundColor: ['#f9733e', '#e05a1a']
      }]
    }
  });

  // Items chart
  const itemsCtx = document.getElementById('items-chart').getContext('2d');
  new Chart(itemsCtx, {
    type: 'pie',
    data: {
      labels: ['Sold Items', 'Available Items'],
      datasets: [{
        data: [analyticsData.items * 0.6, analyticsData.items * 0.4],
        backgroundColor: ['#f9733e', '#e05a1a']
      }]
    }
  });
}

// Function to add product
function addProduct(event) {
  event.preventDefault();

  const name = document.getElementById('product-name').value;
  const sizes = Array.from(document.querySelectorAll('.sizes input:checked')).map(cb => cb.value);
  const price = parseFloat(document.getElementById('product-price').value);
  const quantity = parseInt(document.getElementById('product-quantity').value);
  const imageFile = document.getElementById('product-image').files[0];

  if (!imageFile) {
    alert('Please select an image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const image = e.target.result;
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const id = Date.now(); // Simple ID

    const product = {
      id,
      name,
      sizes,
      image,
      price,
      quantity
    };

    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));

    alert('Product added successfully!');
    document.getElementById('add-product-form').reset();
    renderExistingProducts(); // Update the list immediately
  };
  reader.readAsDataURL(imageFile);
}

// Function to render existing products
function renderExistingProducts() {
  const container = document.getElementById('existing-products');
  container.innerHTML = '';

  const products = getAllProducts();
  products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'existing-product';
    productDiv.innerHTML = `
      <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover;">
      <div>
        <strong>${product.name}</strong>
        <br>
        Price: $${product.price}
      </div>
    `;
    container.appendChild(productDiv);
  });
}

// Event listeners
document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('add-product-form').addEventListener('submit', addProduct);
