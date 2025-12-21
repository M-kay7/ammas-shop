/***********************
 * Amma’s Online Shop
 * Netlify + Google Apps Script
 * Compatible with current API JSON
 ***********************/

// 🔗 API URL (CONFIRMED WORKING)
const API_URL =
  "https://script.google.com/macros/s/AKfycbyD6I4POhttps://script.google.com/macros/s/AKfycby7mYXF5WyIgKjkTCjwnwxTReyiklE6GDJ1n5jVOMv3fC0argC0IxJrk124M2TktnpL/exec5YxyZmdtVA7C7q9YpDTquBhgk7BPFl5BXmQgqed7IdWXh5sx6udU6HiTiTm/exec?route=data";

// 🛒 App State
let PRODUCTS = [];
let COMBOS = [];
let COMBO_ITEMS = [];
let ALTERNATIVES = {};
let CART = [];

// 🧾 Site config
let SITE = {
  currency: "JPY",
  tax_rate: 0.1,
  whatsapp: ""
};

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", init);

function init() {
  fetchData();
  bindCartButtons();
}

/* =========================
   FETCH DATA
========================= */
function fetchData() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      console.log("API DATA:", data);

      SITE = data.site;
      PRODUCTS = data.products || [];
      COMBOS = data.combos || [];
      COMBO_ITEMS = data.comboItems || [];
      ALTERNATIVES = data.alternatives || {};

      renderCategories(PRODUCTS);
      renderProducts(PRODUCTS);
      renderCombos(COMBOS);
    })
    .catch(err => console.error("API ERROR:", err));
}

/* =========================
   CATEGORY RENDER
========================= */
function renderCategories(products) {
  const cats = [...new Set(products.map(p => p.category))];
  const catBox = document.getElementById("cats");
  if (!catBox) return;

  catBox.innerHTML = cats
    .map(
      c => `<button class="cat-btn" onclick="filterCategory('${c}')">${c}</button>`
    )
    .join("");
}

function filterCategory(cat) {
  renderProducts(PRODUCTS.filter(p => p.category === cat));
}

/* =========================
   PRODUCTS RENDER
========================= */
function renderProducts(products) {
  const box = document.getElementById("products");
  if (!box) return;

  box.innerHTML = products
    .map(
      p => `
      <div class="card">
        <h4>${p.name}</h4>
        <p class="muted">${p.unit}</p>
        <p class="price">¥${p.sell_price}</p>
        <button onclick="addToCart('${p.sku}', 'product')">Add</button>
      </div>
    `
    )
    .join("");
}

/* =========================
   COMBOS RENDER
========================= */
function renderCombos(combos) {
  const box = document.getElementById("combos");
  if (!box) return;

  box.innerHTML = combos
    .map(
      c => `
      <div class="card combo">
        <h4>${c.title}</h4>
        <p>${c.description}</p>
        <button onclick="addToCart('${c.combo_id}', 'combo')">
          Add Combo
        </button>
      </div>
    `
    )
    .join("");
}

/* =========================
   CART LOGIC
========================= */
function addToCart(id, type) {
  const existing = CART.find(i => i.id === id);

  if (existing) {
    existing.qty++;
  } else {
    CART.push({ id, type, qty: 1 });
  }

  updateCartUI();
}

function updateCartUI() {
  const count = CART.reduce((s, i) => s + i.qty, 0);
  const cartCount = document.getElementById("cartCount");
  if (cartCount) cartCount.innerText = count;

  renderCart();
}

function renderCart() {
  const box = document.getElementById("cartItems");
  if (!box) return;

  let subtotal = 0;

  box.innerHTML = CART.map(item => {
    let name = "";
    let price = 0;

    if (item.type === "product") {
      const p = PRODUCTS.find(x => x.sku === item.id);
      if (!p) return "";
      name = p.name;
      price = p.sell_price;
    } else {
      const c = COMBOS.find(x => x.combo_id === item.id);
      if (!c) return "";
      name = c.title;
      price = calculateComboPrice(c.combo_id);
    }

    subtotal += price * item.qty;

    return `
      <div class="row">
        <span>${name} × ${item.qty}</span>
        <span>¥${price * item.qty}</span>
      </div>
    `;
  }).join("");

  const tax = subtotal * SITE.tax_rate;
  const total = subtotal + tax;

  document.getElementById("subTotal").innerText = `¥${subtotal}`;
  document.getElementById("taxAmt").innerText = `¥${tax.toFixed(0)}`;
  document.getElementById("grandTotal").innerText = `¥${total.toFixed(0)}`;
}

/* =========================
   COMBO PRICE CALC
========================= */
function calculateComboPrice(comboId) {
  const items = COMBO_ITEMS.filter(i => i.combo_id === comboId);
  let total = 0;

  items.forEach(i => {
    const p = PRODUCTS.find(x => x.sku === i.sku);
    if (p) total += p.sell_price * i.qty;
  });

  const combo = COMBOS.find(c => c.combo_id === comboId);
  if (!combo) return total;

  if (combo.discount_type === "percent") {
    total -= total * (combo.discount_value / 100);
  }

  return Math.round(total);
}

/* =========================
   WHATSAPP ORDER
========================= */
function bindCartButtons() {
  const btn = document.getElementById("orderBtn");
  if (!btn) return;

  btn.onclick = () => {
    const name = document.getElementById("customerName").value;
    const addr = document.getElementById("customerAddress").value;

    let msg = `🛒 *Amma's Online Order*\n\n👤 ${name}\n📍 ${addr}\n\n`;

    CART.forEach(i => {
      msg += `• ${i.id} × ${i.qty}\n`;
    });

    const total = document.getElementById("grandTotal").innerText;
    msg += `\n💰 Total: ${total}`;

    const url = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };
}
