const products = [
  { id: 1, name: "Casque Studio 01", detail: "Noir mat · Autonomie 40 h", price: 189, category: "tech", icon: "🎧", accent: "#1120ff", badge: "NOUVEAU" },
  { id: 2, name: "Montre Ligne", detail: "Acier brossé · 38 mm", price: 149, category: "style", icon: "⌚", accent: "#d7ff36", badge: "BEST-SELLER" },
  { id: 3, name: "Sac Forme", detail: "Écru · Cuir recyclé", price: 119, category: "style", icon: "👜", accent: "#ff6334" },
  { id: 4, name: "Lampe Halo", detail: "Aluminium · LED chaude", price: 79, category: "maison", icon: "💡", accent: "#ffc928", badge: "ÉDITION 01" },
  { id: 5, name: "Enceinte Bloc", detail: "Bleu · Bluetooth 5.3", price: 99, category: "tech", icon: "🔊", accent: "#7b59ff" },
  { id: 6, name: "Vase Onde", detail: "Verre soufflé · 24 cm", price: 64, category: "maison", icon: "🏺", accent: "#39d5c3" }
];

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
let cart = JSON.parse(localStorage.getItem("folki-cart") || "[]");
let activeFilter = "all";
let query = "";
const $ = (selector) => document.querySelector(selector);

function renderProducts() {
  const visible = products.filter((p) => (activeFilter === "all" || p.category === activeFilter) && p.name.toLowerCase().includes(query.toLowerCase()));
  $("#product-grid").innerHTML = visible.length ? visible.map((p) => `
    <article class="product-card" data-category="${p.category}">
      <div class="product-visual" style="--accent:${p.accent}">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <span class="product-icon" aria-hidden="true">${p.icon}</span>
        <button class="quick-add" data-add="${p.id}" aria-label="Ajouter ${p.name} au panier">+</button>
      </div>
      <div class="product-info"><h3>${p.name}</h3><p>${p.detail}</p><span class="price">${euro.format(p.price)}</span></div>
    </article>`).join("") : `<p class="no-results">Aucun objet ne correspond à votre recherche.</p>`;
}

function cartDetails() {
  return cart.map((entry) => ({ ...products.find((p) => p.id === entry.id), qty: entry.qty }));
}

function cartTotal() {
  return cartDetails().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function saveCart() {
  localStorage.setItem("folki-cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const line = cart.find((item) => item.id === id);
  if (line) line.qty += 1; else cart.push({ id, qty: 1 });
  saveCart();
  showToast(`${products.find((p) => p.id === id).name} ajouté au panier`);
}

function changeQuantity(id, delta) {
  const line = cart.find((item) => item.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter((item) => item.id !== id);
  saveCart();
}

function renderCart() {
  const details = cartDetails();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cartTotal();
  $("#cart-count").textContent = count;
  $("#drawer-count").textContent = count;
  $("#cart-empty").hidden = details.length > 0;
  $("#cart-summary").hidden = details.length === 0;
  $("#cart-items").innerHTML = details.map((item) => `
    <div class="cart-item"><div class="cart-item-icon">${item.icon}</div><div><h3>${item.name}</h3><p>${euro.format(item.price)}</p><div class="quantity"><button data-qty="-1" data-id="${item.id}" aria-label="Retirer une unité">−</button><span>${item.qty}</span><button data-qty="1" data-id="${item.id}" aria-label="Ajouter une unité">+</button></div></div><button class="remove" data-remove="${item.id}">Retirer</button></div>`).join("");
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 6.9;
  const total = subtotal + shipping;
  $("#subtotal").textContent = euro.format(subtotal);
  $("#shipping").textContent = shipping ? euro.format(shipping) : "Offerte";
  $("#total").textContent = euro.format(total);
  $("#pay-total").textContent = euro.format(total);
  $("#review-total").textContent = euro.format(total);
}

function openCart() {
  $("#cart-drawer").classList.add("open");
  $("#cart-drawer").setAttribute("aria-hidden", "false");
  $("#overlay").classList.add("open");
  document.body.style.overflow = "hidden";
  $("#cart-close").focus();
}

function closeCart() {
  $("#cart-drawer").classList.remove("open");
  $("#cart-drawer").setAttribute("aria-hidden", "true");
  $("#overlay").classList.remove("open");
  document.body.style.overflow = "";
}

function openCheckout() {
  closeCart();
  const details = cartDetails();
  $("#review-items").innerHTML = details.map((item) => `<div class="review-item"><span>${item.name} × ${item.qty}</span><strong>${euro.format(item.price * item.qty)}</strong></div>`).join("");
  renderCart();
  $("#checkout-form-view").hidden = false;
  $("#success-view").hidden = true;
  $("#checkout-modal").classList.add("open");
  $("#checkout-modal").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#checkout-close").focus();
}

function closeCheckout() {
  $("#checkout-modal").classList.remove("open");
  $("#checkout-modal").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

let toastTimer;
function showToast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2200);
}

document.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  const qty = event.target.closest("[data-qty]");
  const remove = event.target.closest("[data-remove]");
  const filter = event.target.closest("[data-filter]");
  if (add) addToCart(Number(add.dataset.add));
  if (qty) changeQuantity(Number(qty.dataset.id), Number(qty.dataset.qty));
  if (remove) { cart = cart.filter((item) => item.id !== Number(remove.dataset.remove)); saveCart(); }
  if (filter) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll(".filter").forEach((button) => button.classList.toggle("active", button === filter));
    renderProducts();
  }
  if (event.target.closest("[data-close-cart]")) closeCart();
});

$("#cart-toggle").addEventListener("click", openCart);
$("#cart-close").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
$("#checkout-button").addEventListener("click", openCheckout);
$("#checkout-close").addEventListener("click", closeCheckout);
$("#checkout-modal").addEventListener("click", (event) => { if (event.target === $("#checkout-modal")) closeCheckout(); });
$("#continue-button").addEventListener("click", () => { closeCheckout(); document.querySelector("#collection").scrollIntoView(); });
$("#search-toggle").addEventListener("click", () => {
  const open = $("#search-panel").classList.toggle("open");
  $("#search-panel").setAttribute("aria-hidden", String(!open));
  $("#search-toggle").setAttribute("aria-expanded", String(open));
  if (open) $("#search-input").focus();
});
$("#search-close").addEventListener("click", () => {
  $("#search-panel").classList.remove("open");
  $("#search-panel").setAttribute("aria-hidden", "true");
  $("#search-toggle").setAttribute("aria-expanded", "false");
});
$("#search-input").addEventListener("input", (event) => { query = event.target.value.trim(); renderProducts(); if (query) document.querySelector("#collection").scrollIntoView(); });
$("#checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  $("#customer-name").textContent = data.get("firstname");
  $("#order-number").textContent = `FOL-${String(Date.now()).slice(-6)}`;
  $("#checkout-form-view").hidden = true;
  $("#success-view").hidden = false;
  cart = [];
  saveCart();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeCart(); closeCheckout(); $("#search-panel").classList.remove("open"); } });

renderProducts();
renderCart();

function registerAgentTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const register = (tool) => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {});
  register({
    name: "list_products",
    title: "Lister les produits",
    description: "Retourne le catalogue FOLKI avec les prix et catégories disponibles.",
    inputSchema: { type: "object", properties: { category: { type: "string", enum: ["all", "tech", "style", "maison"] } }, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute(input = {}) {
      const category = input.category || "all";
      return products.filter((p) => category === "all" || p.category === category).map(({ id, name, detail, price, category: type }) => ({ id, name, detail, price_eur: price, category: type }));
    }
  });
  register({
    name: "add_cart_items",
    title: "Ajouter au panier",
    description: "Ajoute une ou plusieurs quantités d’un produit FOLKI au panier visible.",
    inputSchema: { type: "object", properties: { product_id: { type: "integer", minimum: 1 }, quantity: { type: "integer", minimum: 1, maximum: 20 } }, required: ["product_id", "quantity"], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      const product = products.find((p) => p.id === Number(input.product_id));
      const quantity = Number(input.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error("Produit ou quantité invalide.");
      for (let i = 0; i < quantity; i += 1) addToCart(product.id);
      return { added: { product_id: product.id, name: product.name, quantity }, cart_total_eur: cartTotal() };
    }
  });
  register({
    name: "start_virtual_checkout",
    title: "Ouvrir le paiement virtuel",
    description: "Ouvre le formulaire de commande simulée avec le panier actuel, sans débiter de carte réelle.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute() {
      if (!cart.length) throw new Error("Le panier est vide.");
      openCheckout();
      return { status: "checkout_open", item_count: cart.reduce((sum, item) => sum + item.qty, 0), total_eur: cartTotal() + (cartTotal() >= 100 ? 0 : 6.9) };
    }
  });
}

registerAgentTools();
