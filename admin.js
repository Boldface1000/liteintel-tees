// Function to fetch analytics data from backend
async function getAnalyticsData() {
  try {
    const response = await fetch("/api/analytics");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return { visits: 0, sales: 0, items_sold: 0 };
  }
}

// Function to get all products from backend
async function getAllProducts() {
  try {
    const response = await fetch("/api/products");
    const products = await response.json();
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Password for admin login
const adminPassword = "liteinteladmin";

// Function to handle login
function login() {
  const password = document.getElementById("admin-password").value;
  if (password === adminPassword) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("analytics-section").style.display = "block";
    renderCharts();
    renderExistingProducts();
    loadOrders();
  } else {
    alert("Incorrect password. Please try again.");
  }
}

// Function to compute order analytics from backend
async function computeOrderAnalytics() {
  try {
    const response = await fetch("/api/orders");
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

  // Visits chart
  const visitsCtx = document.getElementById("visits-chart").getContext("2d");
  new Chart(visitsCtx, {
    type: "pie",
    data: {
      labels: ["Unique Visits", "Returning Visits"],
      datasets: [
        {
          data: [analyticsData.visits * 0.7, analyticsData.visits * 0.3],
          backgroundColor: ["#f9733e", "#e05a1a"],
        },
      ],
    },
  });

  // Sales chart
  const salesCtx = document.getElementById("sales-chart").getContext("2d");
  new Chart(salesCtx, {
    type: "pie",
    data: {
      labels: ["Completed Sales", "Pending Sales"],
      datasets: [
        {
          data: [analyticsData.sales * 0.8, analyticsData.sales * 0.2],
          backgroundColor: ["#f9733e", "#e05a1a"],
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
    const response = await fetch("/api/products", {
      method: "POST",
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
      <img src="./images/${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover;">
      <div>
        <strong>${product.name}</strong>
        <br>
        Price: $${product.price}
      </div>
    `;
    container.appendChild(productDiv);
  });
}

// Function to load and display orders
async function loadOrders() {
  try {
    const response = await fetch("/api/orders");
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
      }, ${order.shippingInfo.state} ${order.shippingInfo.zip}</p>
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

// Function to update order status
function updateOrderStatus(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders.find((o) => o.id == orderId);
  if (order) {
    order.status = newStatus;
    localStorage.setItem("orders", JSON.stringify(orders));
    alert(`Order #${orderId} status updated to: ${newStatus}`);
    loadOrders(); // Refresh the list
  }
}

// Event listeners
document.getElementById("login-btn").addEventListener("click", login);
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
