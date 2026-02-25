/* ===================================== */
/* GLOBAL STATE */
/* ===================================== */

let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* ===================================== */
/* START APP */
/* ===================================== */

startApp();

function startApp() {
  fetch("products/products.json")
    .then(res => res.json())
    .then(data => {
      products = data.products || data;
      console.log("Products loaded:", products);
      updateCartBadge();
      routePage();
    })
    .catch(err => {
      console.error("Failed to load products:", err);
    });
}

/* ===================================== */
/* ROUTING */
/* ===================================== */

function routePage() {
  const path = window.location.pathname;

  if (path.includes("/shop.html")) {
    loadShop();
  } else if (path.includes("/cart.html")) {
    loadCart();
    setupWhatsAppCheckout(); // 🔥 ADD THIS
  } else if (path.includes("/product.html")) {
    loadProductDetail();
  }
}

/* ===================================== */
/* CART BADGE */
/* ===================================== */

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (!badge) return;

  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalQty;
}

/* ===================================== */
/* SHOP */
/* ===================================== */

function loadShop() {
  const container = document.getElementById("product-list");
  if (!container) return;

  if (!products.length) {
    container.innerHTML = "<p>No products available.</p>";
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" 
           onclick="openLightbox('${product.image}')">
      <div class="product-info">
        <h3 onclick="openProduct(${product.id})" style="cursor:pointer;">
          ${product.name}
        </h3>
        <p>₹${product.price}</p>
        <button onclick="addToCart(${product.id})">
          Add to Cart
        </button>
      </div>
    </div>
  `).join("");
}

/* ===================================== */
/* PRODUCT DETAIL */
/* ===================================== */

function openProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

function loadProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  const product = products.find(p => p.id === id);
  if (!product) {
    container.innerHTML = "<p>Product not found.</p>";
    return;
  }

  container.innerHTML = `
    <div class="product-card">
      <img src="${product.image}"
           onclick="openLightbox('${product.image}')">
      <div class="product-info">
        <h2>${product.name}</h2>
        <p>₹${product.price}</p>
        <button onclick="addToCart(${product.id})">
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

/* ===================================== */
/* WHATSAPP CHECKOUT */
/* ===================================== */

function setupWhatsAppCheckout() {
  const btn = document.getElementById("whatsapp-btn");
  if (!btn) return;

  btn.addEventListener("click", function () {
    if (!cart.length) {
      alert("Your cart is empty!");
      return;
    }

    let message = "Hello, I would like to order:\n\n";
    let total = 0;

    cart.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;

      const subtotal = product.price * item.qty;
      total += subtotal;

      message += `${product.name} × ${item.qty} - ₹${subtotal}\n`;
    });

    message += `\nTotal: ₹${total}`;

    const phone = "919876543210"; // 🔥 Replace with YOUR number (no +)

    const encodedMessage = encodeURIComponent(message);

    const whatsappURL = `https://wa.me/${phone}?text=${encodedMessage}`;

    window.location.href = whatsappURL;
  });
}

/* ===================================== */
/* CART */
/* ===================================== */

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveCart();
  updateCartBadge();
  showToast("Added to cart 🛒");
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const itemsDiv = document.getElementById("cart-items");
  const totalDiv = document.getElementById("cart-total");

  if (!itemsDiv) return;

  let total = 0;

  itemsDiv.innerHTML = cart.map((item, index) => {
    const product = products.find(p => p.id === item.id);
    if (!product) return "";

    const subtotal = product.price * item.qty;
    total += subtotal;

    return `
      <div class="cart-item">
        <h3>${product.name}</h3>
        <p>₹${product.price}</p>
        <div class="qty-controls">
          <button onclick="decreaseQty(${index})">-</button>
          <span>${item.qty}</span>
          <button onclick="increaseQty(${index})">+</button>
        </div>
        <p>Subtotal: ₹${subtotal}</p>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  }).join("");

  totalDiv.innerHTML = `<h3>Total: ₹${total}</h3>`;
}

function increaseQty(index) {
  cart[index].qty++;
  saveCart();
  updateCartBadge();
  loadCart();
}

function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty--;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartBadge();
  loadCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  loadCart();
}

/* ===================================== */
/* TOAST */
/* ===================================== */

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}


/* ===================================== */
/* LIGHTBOX */
/* ===================================== */

function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  if (!lightbox || !img) return;

  img.src = src;
  lightbox.style.display = "flex";
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    lightbox.style.display = "none";
  }
}