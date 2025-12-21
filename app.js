/***********************
 * Ammas.jp Online Shop
 * Frontend (Netlify)
 ***********************/

const API_URL =
  "https://script.google.com/macros/s/AKfycby7mYXF5WyIgKjkTCjwnwxTReyiklE6GDJ1n5jVOMv3fC0argC0IxJrk124M2TktnpL/exec?route=data";

// STATE
let PRODUCTS = [];
let COMBOS = [];
let COMBO_ITEMS = [];
let CART = [];
let SITE = { currency: "JPY", tax_rate: 0.1, whatsapp: "" };

// SHORTCUT
const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", init);

async function init() {
  $("year").textContent = new Date().getFullYear();
  bindUI();
  await loadData();
  renderCategories();
  renderProducts();
  renderCombos();
}

function bindUI() {
  $("openCartBtn").onclick = () => $("cartPanel").classList.add("open");
  $("closeCartBtn").onclick = () => $("cartPanel").classList.remove("open");
  $("whatsBtn").onclick = sendWhatsAppOrder;
}

// LOAD API
async function loadData() {
  const res = await fetch(API_URL);
  const data = await res.json();

  SITE = data.site;
  PRODUCTS = data.products;
  COMBOS = data.combos;
  COMBO_ITEMS = data.comboItems;

  $("currencyPill").textContent = SITE.currency;
  $("taxPill").textContent = `Tax ${SITE.tax_rate * 100}%`;
}

// ---------- PRODUCTS ----------
function renderCategories() {
  const cats = [...new Set(PRODUCTS.map(p => p.category))];
  const el = $("categories");
  el.innerHTML = `<button onclick="filterCategory('all')">All</button>`;
  cats.forEach(c => {
    el.innerHTML += `<button onclick="filterCategory('${c}')">${c}</button>`;
  });
}

function filterCategory(cat) {
  renderProducts(cat);
}

function renderProducts(cat = "all") {
  const box = $("products");
  box.innerHTML = "";

  PRODUCTS
    .filter(p => cat === "all" || p.category === cat)
    .forEach(p => {
      box.innerHTML += `
        <div class="product">
          <b>${p.name}</b>
          <div>${p.unit}</div>
          <div>${SITE.currency} ${p.sell_price}</div>
          <button onclick="addToCart('${p.sku}')">Add</button>
        </div>`;
    });
}

// ---------- COMBOS ----------
function renderCombos() {
  const box = $("combos");
  box.innerHTML = "";

  COMBOS.forEach(c => {
    box.innerHTML += `
      <div class="combo">
        <b>${c.title}</b>
        <div>${c.description}</div>
        <button onclick="addCombo('${c.combo_id}')">Add Combo</button>
      </div>`;
  });
}

// ---------- CART ----------
function addToCart(sku) {
  const found = CART.find(i => i.sku === sku);
  if (found) found.qty++;
  else CART.push({ type: "sku", sku, qty: 1 });
  renderCart();
}

function addCombo(combo_id) {
  CART.push({ type: "combo", combo_id, qty: 1 });
  renderCart();
}

function renderCart() {
  const box = $("cartItems");
  box.innerHTML = "";
  $("cartEmpty").style.display = CART.length ? "none" : "block";

  let subtotal = 0;

  CART.forEach((i, idx) => {
    let label = "";
    let price = 0;

    if (i.type === "sku") {
      const p = PRODUCTS.find(x => x.sku === i.sku);
      label = p.name;
      price = p.sell_price * i.qty;
    } else {
      const c = COMBOS.find(x => x.combo_id === i.combo_id);
      label = c.title;
      price = 0;
    }

    subtotal += price;

    box.innerHTML += `
      <div class="row space">
        <span>${label} × ${i.qty}</span>
        <b>${SITE.currency} ${price}</b>
      </div>`;
  });

  const tax = subtotal * SITE.tax_rate;
  const total = subtotal + tax;

  $("subTotal").textContent = subtotal.toFixed(0);
  $("taxAmt").textContent = tax.toFixed(0);
  $("grandTotal").textContent = total.toFixed(0);
  $("cartCount").textContent = CART.length;
}

// ---------- WHATSAPP ----------
function sendWhatsAppOrder() {
  if (!CART.length) return alert("Cart is empty");

  const name = $("custName").value;
  const addr = $("custAddr").value;

  let msg = `🛒 *Ammas.jp Order*\n\n`;
  CART.forEach(i => {
    if (i.type === "sku") {
      const p = PRODUCTS.find(x => x.sku === i.sku);
      msg += `• ${p.name} x ${i.qty}\n`;
    } else {
      const c = COMBOS.find(x => x.combo_id === i.combo_id);
      msg += `• ${c.title}\n`;
    }
  });

  msg += `\n👤 ${name}\n🏠 ${addr}`;
  const url = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}
