// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbfYVwTnL3ue6KyixZkj5rH_3GBkdxwiQ",
  authDomain: "litetees-dbfdf.firebaseapp.com",
  projectId: "litetees-dbfdf",
  storageBucket: "litetees-dbfdf.firebasestorage.app",
  messagingSenderId: "696217624330",
  appId: "1:696217624330:web:bdc26c5dc9dd7521f164f3",
  measurementId: "G-F4FMLJ79RN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Function to get auth headers
async function getAuthHeaders() {
  const user = auth.currentUser;
  if (user) {
    const idToken = await user.getIdToken();
    return {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    };
  }
  return {};
}

// Function to fetch analytics data from backend
async function getAnalyticsData() {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/analytics", { headers });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return { visits: 0, sales: 0, items_sold: 0, link_clicks: 0, order_count: 0 };
  }
}

// Function to get all products from backend
async function getAllProducts() {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/products", { headers });
    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Function to handle login
async function login() {
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    alert("Login failed: " + error.message);
  }
}

// Function to handle logout
function logout() {
  auth.signOut();
}

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("analytics-section").style.display = "block";
    document.getElementById("logout-btn").style.display = "inline-block";
    renderCharts();
    renderExistingProducts();
    loadOrders();
  } else {
    document.getElementById("login-section").style.display = "block";
    document.getElementById("analytics-section").style.display = "none";
    document.getElementById("logout-btn").style.display = "none";
  }
});

// Function to compute order analytics from backend
async function computeOrderAnalytics() {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/orders", { headers });
    const orders = await response.json();
    const statusCounts = { pending: 0, paid: 0, delivered: 0 };
    orders.forEach((order) => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
    });
    return statusCounts;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { pending: 0, paid: 0, delivered: 0 };
  }
}

// Function to render pie charts
async function renderCharts() {
  const analyticsData = await getAnalyticsData();

  // Visits chart (now link clicks)
  const visitsCtx = document.getElementById("visits-chart").getContext("2d");
  new Chart(visitsCtx, {
    type: "pie",
    data: {
      labels: ["Link Clicks"],
      datasets: [
        {
          data: [analyticsData.link_clicks],
          backgroundColor: ["#f9733e"],
        },
      ],
    },
  });

  // Sales chart (now order count)
  const salesCtx = document.getElementById("sales-chart").getContext("2d");
  new Chart(salesCtx, {
    type: "pie",
    data: {
      labels: ["Total Orders"],
      datasets: [
        {
          data: [analyticsData.order_count],
          backgroundColor: ["#f9733e"],
        },
      ],
    },
  });

  // Items chart
  const itemsCtx = document.getElementById("items-chart").getContext("2d");
  new Chart(itemsCtx, {
    type: "pie",
    data: {
      labels: ["Sold Items", "Available Items"],
      datasets: [
        {
          data: [
            analyticsData.items_sold * 0.6,
            analyticsData.items_sold * 0.4,
          ],
          backgroundColor: ["#f9733e", "#e05a1a"],
        },
      ],
    },
  });

  // Orders chart
  const orderAnalytics = await computeOrderAnalytics();
  const ordersCtx = document.getElementById("orders-chart").getContext("2d");
  new Chart(ordersCtx, {
    type: "pie",
    data: {
      labels: ["Pending", "Paid", "Delivered"],
      datasets: [
        {
          data: [
            orderAnalytics.pending,
            orderAnalytics.paid,
            orderAnalytics.delivered,
          ],
          backgroundColor: ["#f9733e", "#e05a1a", "#d44a00"],
        },
      ],
    },
  });
}

// Function to add product
async function addProduct(event) {
  event.preventDefault();

  const name = document.getElementById("product-name").value;
  const sizes = Array.from(
    document.querySelectorAll(".sizes input:checked")
  ).map((cb) => cb.value);
  const price = parseFloat(document.getElementById("product-price").value);
  const quantity = parseInt(document.getElementById("product-quantity").value);
  const imageFile = document.getElementById("product-image").files[0];

  if (!imageFile) {
    alert("Please select an image.");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("quantity", quantity);
  formData.append("sizes", sizes.join(","));
  formData.append("image", imageFile);

  try {
    const headers = await getAuthHeaders();
    // Remove Content-Type header to let browser set it for FormData
    if (headers['Content-Type']) {
      delete headers['Content-Type'];
    }
    const response = await fetch("/api/products", {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (response.ok) {
      alert("Product added successfully!");
      document.getElementById("add-product-form").reset();
      renderExistingProducts(); // Update the list immediately
    } else {
      alert("Error adding product.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error adding product.");
  }
}

// Function to render existing products
async function renderExistingProducts() {
  const container = document.getElementById("existing-products");
  container.innerHTML = "";

  const products = await getAllProducts();
  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.className = "existing-product";
    productDiv.innerHTML = `
      <img src="./images/${product.image}" alt="${product.name}" style="width: 300px; height: 300px; object-fit: contain;">
      <div>
        <strong>${product.name}</strong>
        <br>
        Price: $${product.price}
        <br>
        <button class="btn delete-btn" data-product-id="${product.id}">Delete Product</button>
      </div>
    `;
    container.appendChild(productDiv);
  });
}

// Function to load and display orders
async function loadOrders() {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch("/api/orders", { headers });
    const orders = await response.json();
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = "";

    if (orders.length === 0) {
      ordersList.innerHTML = "<p>No orders yet.</p>";
      return;
    }

    orders.forEach((order) => {
      const orderDiv = document.createElement("div");
      orderDiv.className = "order-item";
      orderDiv.innerHTML = `
        <h3>Order #${order.id}</h3>
        <p><strong>Customer:</strong> ${order.shippingInfo.fullName}</p>
        <p><strong>Email:</strong> ${order.shippingInfo.email}</p>
        <p><strong>Phone:</strong> ${order.shippingInfo.phone}</p>
        <p><strong>Address:</strong> ${order.shippingInfo.address}, ${
        order.shippingInfo.city
      }</p>
        <p><strong>Items:</strong></p>
        <ul>
          ${order.items
            .map(
              (item) =>
                `<li>${item.name} (Size: ${item.size || "M"}, Qty: ${
                  item.quantity
                }) - $${item.price}</li>`
            )
            .join("")}
        </ul>
        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        <p><strong>Order Date:</strong> ${new Date(
          order.orderDate
        ).toLocaleString()}</p>
        <label><strong>Status:</strong></label>
        <select class="order-status" data-order-id="${order.id}">
          <option value="pending" ${
            order.status === "pending" ? "selected" : ""
          }>Pending</option>
          <option value="paid" ${
            order.status === "paid" ? "selected" : ""
          }>Paid</option>
          <option value="delivered" ${
            order.status === "delivered" ? "selected" : ""
          }>Delivered</option>
        </select>
        <button class="btn update-status-btn" data-order-id="${
          order.id
        }">Update Status</button>
      `;
      ordersList.appendChild(orderDiv);
    });
  } catch (error) {
    console.error("Error loading orders:", error);
    document.getElementById("orders-list").innerHTML =
      "<p>Error loading orders.</p>";
  }
}

// Function to delete product
async function deleteProduct(productId) {
  if (
    !confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
      headers,
    });

    if (response.ok) {
      alert("Product deleted successfully!");
      renderExistingProducts(); // Refresh the list
    } else if (response.status === 404) {
      alert("Product not found.");
    } else {
      alert("Error deleting product.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error deleting product.");
  }
}

// Function to update order status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      alert(`Order #${orderId} status updated to: ${newStatus}`);
      loadOrders(); // Refresh the list
    } else {
      alert("Error updating order status.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error updating order status.");
  }
}

// Event listeners
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("logout-btn").addEventListener("click", logout);
document
  .getElementById("add-product-form")
  .addEventListener("submit", addProduct);

// Event delegation for update status buttons
document.getElementById("orders-list").addEventListener("click", (e) => {
  if (e.target.classList.contains("update-status-btn")) {
    const orderId = e.target.getAttribute("data-order-id");
    const statusSelect = document.querySelector(
      `.order-status[data-order-id="${orderId}"]`
    );
    const newStatus = statusSelect.value;
    updateOrderStatus(orderId, newStatus);
  }
});

// Event delegation for delete product buttons
document.getElementById("existing-products").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const productId = e.target.getAttribute("data-product-id");
    deleteProduct(productId);
  }
});
