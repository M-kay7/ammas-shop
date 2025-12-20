/***********************
 * Amma's Shop - app.js
 * Works with Apps Script:
 *   ?route=data  -> returns { site, products, combos, comboItems, alternatives }
 ************************/

// ✅ CHANGE THIS ONLY if your Apps Script URL changes
const API_URL =
  "https://script.google.com/macros/s/AKfycbyD6I4PO5YxyZmdtVA7C7q9YpDTquBhgk7BPFl5BXmQgqed7IdWXh5sx6udU6HiTiTm/exec?route=data";

// Defaults (will be overwritten by API)
let SITE = {
  currency: "JPY",
  tax_rate: 0.1,
  whatsapp: "+8108099937224,
};

let PRODUCTS = [];
let COMBOS = [];
let COMBO_ITEMS = [];
let ALTERNATIVES = {};

// cart structure: { sku: qty }
let CART = {};
let CART_OPEN = true;

function $(id) {
  return document.getElementById(id);
}

function fmtMoney(n) {
  // show as integer yen by default
  try {
    return new Intl.NumberFormat("ja-JP").format(Math.round(n));
  } catch {
    return String(Math.round(n));
  }
}

function safeText(s) {
  return String(s ?? "").replace(/[<>&"]/g, (c) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
  }[c]));
}

function groupByCategory(products) {
  const map = {};
  for (const p of products) {
    const cat = p.category || "Others";
    if (!map[cat]) map[cat] = [];
    map[cat].push(p);
  }
  return map;
}

function getProductBySku(sku) {
  return PRODUCTS.find((p) => p.sku === sku) || null;
}

function getComboById(comboId) {
  return COMBOS.find((c) => c.combo_id === comboId) || null;
}

function calcLinePrice(prod, qty) {
  const unit = Number(prod.sell_price || 0);
  return unit * qty;
}

function calcTotals() {
  let subtotal = 0;

  // cart products
  for (const [sku, qty] of Object.entries(CART)) {
    const prod = getProductBySku(sku);
    if (!prod) continue;
    subtotal += calcLinePrice(prod, qty);
  }

  const handling = 0; // keep as 0 for now
  const taxRate = Number(SITE.tax_rate || 0);
  const tax = (subtotal + handling) * taxRate;
  const total = subtotal + handling + tax;

  return { subtotal, handling, tax, total };
}

function updateHeaderPills() {
  if ($("currencyPill")) $("currencyPill").textContent = SITE.currency || "JPY";
  if ($("taxPill")) $("taxPill").textContent = `Tax ${Math.round((SITE.tax_rate || 0) * 100)}%`;
}

function updateCartCount() {
  const count = Object.values(CART).reduce((a, b) => a + b, 0);
  if ($("cartCount")) $("cartCount").textContent = String(count);
}

function renderCombos() {
  const box = $("combos");
  if (!box) return;

  if (!COMBOS.length) {
    box.innerHTML = `<p class="muted small">No combos available.</p>`;
    return;
  }

  box.innerHTML = COMBOS.map((c) => {
    const title = safeText(c.title || c.combo_id);
    const desc = safeText(c.description || "");
    const dtype = c.discount_type || "";
    const dval = Number(c.discount_value || 0);

    return `
      <div class="prod">
        <h3>${title}</h3>
        <div class="muted small">${desc}</div>
        <div class="small muted">Discount: ${dtype === "percent" ? dval + "%" : fmtMoney(dval)}</div>
        <div class="btnRow">
          <button class="btn primary" data-add-combo="${safeText(c.combo_id)}">Add Combo</button>
        </div>
      </div>
    `;
  }).join("");

  // listeners
  box.querySelectorAll("[data-add-combo]").forEach((btn) => {
    btn.addEventListener("click", () => addComboToCart(btn.getAttribute("data-add-combo")));
  });
}

function addComboToCart(comboId) {
  // Add all items from comboItems list into cart
  const items = COMBO_ITEMS.filter((x) => x.combo_id === comboId);

  if (!items.length) {
    alert("This combo has no items configured.");
    return;
  }

  for (const it of items) {
    const sku = it.sku;
    const qty = Number(it.qty || 1);
    CART[sku] = (CART[sku] || 0) + qty;
  }

  updateCartCount();
  renderCart();
  openCart();
}

function renderCategoryTabs(catMap) {
  const tabs = $("cats");
  if (!tabs) return;

  const cats = Object.keys(catMap);
  if (!cats.length) {
    tabs.innerHTML = "";
    return;
  }

  // first category active by default
  const active = tabs.getAttribute("data-active") || cats[0];
  tabs.setAttribute("data-active", active);

  tabs.innerHTML = cats.map((c) => {
    const cls = c === active ? "tab active" : "tab";
    return `<button class="${cls}" data-cat="${safeText(c)}">${safeText(c)}</button>`;
  }).join("");

  tabs.querySelectorAll("[data-cat]").forEach((b) => {
    b.addEventListener("click", () => {
      tabs.setAttribute("data-active", b.getAttribute("data-cat"));
      renderProducts();
    });
  });
}

function renderProducts() {
  const grid = $("products");
  if (!grid) return;

  if (!PRODUCTS.length) {
    grid.innerHTML = `<p class="muted small">No products available.</p>`;
    return;
  }

  const catMap = groupByCategory(PRODUCTS);
  renderCategoryTabs(catMap);

  const tabs = $("cats");
  const activeCat = tabs ? (tabs.getAttribute("data-active") || Object.keys(catMap)[0]) : Object.keys(catMap)[0];
  const list = (catMap[activeCat] || []).slice();

  grid.innerHTML = list.map((p) => {
    const sku = safeText(p.sku);
    const name = safeText(p.name);
    const unit = safeText(p.unit || "");
    const price = Number(p.sell_price || 0);
    const stock = Number(p.stock ?? 0);

    return `
      <div class="prod">
        <h3>${name}</h3>
        <div class="muted small">${unit} • Stock: ${stock}</div>
        <div class="price">${SITE.currency} ${fmtMoney(price)}</div>
        <div class="btnRow">
          <button class="btn" data-sub="${sku}">-</button>
          <button class="btn primary" data-add="${sku}">Add</button>
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => addSku(b.getAttribute("data-add"))));
  grid.querySelectorAll("[data-sub]").forEach((b) => b.addEventListener("click", () => subSku(b.getAttribute("data-sub"))));
}

function addSku(sku) {
  const p = getProductBySku(sku);
  if (!p) return;

  const stock = Number(p.stock ?? 0);
  const current = CART[sku] || 0;

  if (stock > 0 && current + 1 > stock) {
    alert("Out of stock.");
    return;
  }

  CART[sku] = current + 1;
  updateCartCount();
  renderCart();
  openCart();
}

function subSku(sku) {
  if (!CART[sku]) return;
  CART[sku] -= 1;
  if (CART[sku] <= 0) delete CART[sku];
  updateCartCount();
  renderCart();
}

function renderCart() {
  const itemsBox = $("cartItems");
  if (!itemsBox) return;

  const skus = Object.keys(CART);

  if (!skus.length) {
    itemsBox.innerHTML = `<p class="muted small">Cart is empty.</p>`;
  } else {
    itemsBox.innerHTML = skus.map((sku) => {
      const p = getProductBySku(sku);
      if (!p) return "";
      const qty = CART[sku];
      const line = calcLinePrice(p, qty);

      return `
        <div class="cart-item">
          <div>
            <div><b>${safeText(p.name)}</b> <span class="muted small">(${safeText(p.unit || "")})</span></div>
            <div class="muted small">${SITE.currency} ${fmtMoney(p.sell_price)} × ${qty} = <b>${fmtMoney(line)}</b></div>
          </div>
          <div class="qty">
            <button class="btn" data-sub="${safeText(sku)}">-</button>
            <span>${qty}</span>
            <button class="btn" data-add="${safeText(sku)}">+</button>
          </div>
        </div>
      `;
    }).join("");

    itemsBox.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => addSku(b.getAttribute("data-add"))));
    itemsBox.querySelectorAll("[data-sub]").forEach((b) => b.addEventListener("click", () => subSku(b.getAttribute("data-sub"))));
  }

  const t = calcTotals();
  if ($("subTotal")) $("subTotal").textContent = fmtMoney(t.subtotal);
  if ($("handling")) $("handling").textContent = fmtMoney(t.handling);
  if ($("taxAmt")) $("taxAmt").textContent = fmtMoney(t.tax);
  if ($("grandTotal")) $("grandTotal").textContent = fmtMoney(t.total);
}

function openCart() {
  CART_OPEN = true;
  const panel = $("cartPanel");
  if (panel) panel.style.display = "block";
}
function closeCart() {
  CART_OPEN = false;
  const panel = $("cartPanel");
  if (panel) panel.style.display = "none";
}

function buildWhatsappMessage() {
  const name = ($("customerName")?.value || "").trim();
  const addr = ($("customerAddress")?.value || "").trim();

  const lines = [];
  lines.push("🛒 *Ammas.jp Order*");
  if (name) lines.push(`👤 Name: ${name}`);
  if (addr) lines.push(`📍 Address: ${addr}`);
  lines.push("");

  const skus = Object.keys(CART);
  if (!skus.length) {
    lines.push("Cart is empty.");
    return lines.join("\n");
  }

  lines.push("*Items:*");
  for (const sku of skus) {
    const p = getProductBySku(sku);
    if (!p) continue;
    const qty = CART[sku];
    const price = Number(p.sell_price || 0);
    lines.push(`- ${p.name} (${p.unit || ""}) × ${qty} = ${SITE.currency} ${fmtMoney(price * qty)}`);
  }

  const t = calcTotals();
  lines.push("");
  lines.push(`Subtotal: ${SITE.currency} ${fmtMoney(t.subtotal)}`);
  lines.push(`Tax: ${SITE.currency} ${fmtMoney(t.tax)}`);
  lines.push(`Total: ${SITE.currency} ${fmtMoney(t.total)}`);
  lines.push("");
  lines.push("✅ Please confirm availability & delivery time.");

  return lines.join("\n");
}

function orderViaWhatsApp() {
  const phone = String(SITE.whatsapp || "").replace(/\s/g, "");
  if (!phone || phone.includes("XXXX")) {
    alert("WhatsApp number is not configured in your API (site.whatsapp).");
    return;
  }

  const msg = buildWhatsappMessage();
  const url = `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

async function loadData() {
  updateHeaderPills();

  try {
    const res = await fetch(API_URL, { method: "GET" });
    const json = await res.json();

    SITE = json.site || SITE;
    PRODUCTS = json.products || [];
    COMBOS = json.combos || [];
    COMBO_ITEMS = json.comboItems || [];
    ALTERNATIVES = json.alternatives || {};

    updateHeaderPills();
    renderCombos();
    renderProducts();
    updateCartCount();
    renderCart();
  } catch (e) {
    console.error(e);
    const productsBox = $("products");
    if (productsBox) {
      productsBox.innerHTML = `<p class="muted small">❌ Failed to load data. Check API URL / CORS / Apps Script deploy.</p>`;
    }
  }
}

function bindUI() {
  $("cartToggle")?.addEventListener("click", () => {
    if (CART_OPEN) closeCart();
    else openCart();
  });

  $("cartClose")?.addEventListener("click", () => closeCart());

  $("orderBtn")?.addEventListener("click", orderViaWhatsApp);
}

// boot
document.addEventListener("DOMContentLoaded", () => {
  bindUI();
  openCart();
  loadData();
});
