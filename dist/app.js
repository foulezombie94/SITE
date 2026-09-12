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

const heroSlides = [
  {
    title: "Acier bleu.",
    accent: "Le temps en clair.",
    description: "Acier brossé, cadran bleu nuit et une ligne nette pensée pour chaque jour.",
    model: "Montre Ligne Azur",
    price: "149 €",
    oldPrice: "179 €",
    detail: "Acier · 38 mm · livraison offerte",
    note: "FOLKI LIGNE / AZUR"
  },
  {
    title: "Émeraude.",
    accent: "L’élégance juste.",
    description: "Or rose, cuir brun et cadran vert profond pour une présence plus chaleureuse.",
    model: "Montre Ligne Émeraude",
    price: "169 €",
    oldPrice: "199 €",
    detail: "Cuir · 38 mm · livraison offerte",
    note: "FOLKI LIGNE / ÉMERAUDE"
  },
  {
    title: "Minuit.",
    accent: "Le caractère net.",
    description: "Acier noir, cuir grainé et cadran bordeaux pour une silhouette plus affirmée.",
    model: "Montre Ligne Minuit",
    price: "159 €",
    oldPrice: "189 €",
    detail: "Cuir · 38 mm · livraison offerte",
    note: "FOLKI LIGNE / MINUIT"
  }
];

function renderProducts() {
  const visible = products.filter((p) => (activeFilter === "all" || p.category === activeFilter) && p.name.toLowerCase().includes(query.toLowerCase()));
  $("#product-grid").innerHTML = visible.length ? visible.map((p) => `
    <article class="product-card" data-category="${p.category}" style="--i:${visible.indexOf(p)}">
      <div class="product-visual" style="--accent:${p.accent}">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <span class="product-icon" aria-hidden="true">${p.icon}</span>
        <button class="quick-add" data-add="${p.id}" aria-label="Ajouter ${p.name} au panier">+</button>
      </div>
      <div class="product-info"><h3>${p.name}</h3><p>${p.detail}</p><span class="price">${euro.format(p.price)}</span></div>
    </article>`).join("") : `<div class="no-results"><img class="state-mascot state-mascot-error" src="assets/folki-mascot.svg" alt="" aria-hidden="true"><p>Aucun objet ne correspond à votre recherche.</p><button type="button" data-reset-search>Réinitialiser la recherche <span>↗</span></button></div>`;
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
  animateAddButton(id);
  showToast(`${products.find((p) => p.id === id).name} ajouté au panier`);
}

function animateAddButton(id) {
  const button = document.querySelector(`[data-add="${id}"]`);
  if (!button) return;
  const original = button.textContent;
  button.textContent = "✓";
  button.classList.add("added");
  window.setTimeout(() => { button.textContent = original; button.classList.remove("added"); }, 850);
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
  $("#cart-count").classList.remove("cart-count-pop");
  requestAnimationFrame(() => $("#cart-count").classList.add("cart-count-pop"));
  $("#drawer-count").textContent = count;
  $("#mascot-message").textContent = count
    ? `Votre sélection contient ${count} article${count > 1 ? "s" : ""}. On finalise ?`
    : "Je peux vous ramener vers la sélection.";
  $("#cart-empty").hidden = details.length > 0;
  $("#cart-summary").hidden = details.length === 0;
  $("#cart-items").innerHTML = details.map((item) => `
    <div class="cart-item"><div class="cart-item-icon">${item.icon}</div><div><h3>${item.name}</h3><p>${euro.format(item.price)}</p><div class="quantity"><button data-qty="-1" data-id="${item.id}" aria-label="Retirer une unité">−</button><span>${item.qty}</span><button data-qty="1" data-id="${item.id}" aria-label="Ajouter une unité">+</button></div></div><button class="remove" data-remove="${item.id}">Retirer</button></div>`).join("");
  const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 6.9;
  const total = subtotal + shipping;
  $("#subtotal").textContent = euro.format(subtotal);
  $("#shipping").textContent = shipping ? euro.format(shipping) : "Offerte";
  $("#review-shipping").textContent = shipping ? euro.format(shipping) : "Offerte";
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
  const itemCount = details.reduce((sum, item) => sum + item.qty, 0);
  $("#review-count").textContent = `${itemCount} article${itemCount > 1 ? "s" : ""}`;
  $("#checkout-progress").classList.remove("done");
  $("#checkout-progress").children[1].querySelector("span").textContent = "2";
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
  const resetSearch = event.target.closest("[data-reset-search]");
  if (add) addToCart(Number(add.dataset.add));
  if (qty) changeQuantity(Number(qty.dataset.id), Number(qty.dataset.qty));
  if (remove) { cart = cart.filter((item) => item.id !== Number(remove.dataset.remove)); saveCart(); }
  if (filter) {
    activeFilter = filter.dataset.filter;
    document.querySelectorAll(".filter").forEach((button) => button.classList.toggle("active", button === filter));
   renderProducts();
 }
  if (resetSearch) {
    query = "";
    $("#search-input").value = "";
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
const mascot = $("#folki-mascot");
const mascotToggle = $("#mascot-toggle");
const mascotBubble = $("#mascot-bubble");
function setMascotOpen(open) {
  mascot.classList.toggle("open", open);
  mascotBubble.hidden = !open;
  mascotToggle.setAttribute("aria-expanded", String(open));
  mascotToggle.setAttribute("aria-label", open ? "Fermer l’assistant FOLKI" : "Ouvrir l’assistant FOLKI");
}
mascotToggle.addEventListener("click", () => setMascotOpen(!mascot.classList.contains("open")));
$("#mascot-shop").addEventListener("click", () => { setMascotOpen(false); $("#collection").scrollIntoView({ behavior: "smooth" }); });
document.addEventListener("click", (event) => { if (!event.target.closest("#folki-mascot")) setMascotOpen(false); });
$("#checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const payButton = event.submitter;
  payButton.classList.add("processing");
  payButton.innerHTML = "Validation en cours";
  window.setTimeout(() => {
    $("#customer-name").textContent = data.get("firstname");
    $("#order-number").textContent = `FOL-${String(Date.now()).slice(-6)}`;
    $("#checkout-form-view").hidden = true;
    const success = $("#success-view");
    success.hidden = false;
    success.classList.remove("celebrate");
    createConfetti();
    requestAnimationFrame(() => success.classList.add("celebrate"));
    $("#checkout-progress").classList.add("done");
    $("#checkout-progress").children[1].querySelector("span").textContent = "✓";
    payButton.classList.remove("processing");
    payButton.innerHTML = `<span>Confirmer l’achat virtuel</span><strong id="pay-total">0,00 €</strong>`;
    cart = [];
    saveCart();
  }, 700);
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeCart(); closeCheckout(); $("#search-panel").classList.remove("open"); } });

renderProducts();
renderCart();

function createConfetti() {
  const container = $("#confetti");
  const colors = ["#1120ff", "#d7ff36", "#ff6334", "#08090b", "#39d5c3"];
  container.innerHTML = Array.from({ length: 28 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 28;
    const distance = 120 + (i % 5) * 26;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance + 70;
    return `<i style="--confetti:${colors[i % colors.length]};--x:${x.toFixed(0)}px;--y:${y.toFixed(0)}px;--r:${180 + i * 47}deg;--delay:${(i % 4) * 22}ms;--duration:${700 + (i % 6) * 55}ms"></i>`;
  }).join("");
}

function initHeroCarousel() {
  const carousel = $("[data-hero-carousel]");
  if (!carousel) return;

  const card = carousel.querySelector(".hero-card");
  const watches = [...carousel.querySelectorAll(".hero-watch")];
  const themes = [...carousel.querySelectorAll(".hero-theme-layer")];
  const copy = $("#hero-copy-details");
  const priceBlock = carousel.querySelector(".hero-price");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = 0;
  let busy = false;
  let autoplay;

  const setContent = (index) => {
    const slide = heroSlides[index];
    $("#hero-title").textContent = slide.title;
    $("#hero-title-accent").textContent = slide.accent;
    $("#hero-description").textContent = slide.description;
    priceBlock.querySelector("span").textContent = slide.model;
    priceBlock.querySelector("strong").textContent = slide.price;
    priceBlock.querySelector("del").textContent = slide.oldPrice;
    priceBlock.querySelector("small").textContent = slide.detail;
    $("#hero-note").textContent = slide.note;
    $("#hero-index").textContent = `${String(index + 1).padStart(2, "0")} / 03`;
  };

  const showSlide = (next, direction = "next") => {
    if (busy || next === current) return;
    busy = true;
    const previous = current;
    const sign = direction === "next" ? 1 : -1;
    const previousWatch = watches[previous];
    const nextWatch = watches[next];

    card.dataset.heroSlide = String(next);
    themes[previous].classList.remove("is-active");
    themes[next].classList.add("is-active");
    nextWatch.classList.add("is-active");
    nextWatch.style.zIndex = "3";
    previousWatch.style.zIndex = "2";

    if (reducedMotion) {
      previousWatch.classList.remove("is-active");
      previousWatch.style.zIndex = "";
      nextWatch.style.zIndex = "";
      setContent(next);
      current = next;
      busy = false;
      return;
    }

    const timing = { duration: 720, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" };
    previousWatch.animate([
      { opacity: 1, transform: "translate3d(0,0,0) scale(1) rotate(0deg)", filter: "blur(0) drop-shadow(0 28px 30px rgba(0,0,0,.34))" },
      { opacity: 0, transform: `translate3d(${-sign * 24}%,6px,0) scale(.84) rotate(${-sign * 6}deg)`, filter: "blur(12px) drop-shadow(0 18px 20px rgba(0,0,0,.18))" }
    ], timing);
    nextWatch.animate([
      { opacity: 0, transform: `translate3d(${sign * 24}%,18px,0) scale(.82) rotate(${sign * 6}deg)`, filter: "blur(14px) drop-shadow(0 18px 20px rgba(0,0,0,.18))" },
      { opacity: 1, transform: "translate3d(0,0,0) scale(1) rotate(0deg)", filter: "blur(0) drop-shadow(0 28px 30px rgba(0,0,0,.34))" }
    ], timing);
    [copy, priceBlock].forEach((element, offset) => element.animate([
      { opacity: 1, transform: "translateY(0)", filter: "blur(0)", offset: 0 },
      { opacity: 0, transform: `translateY(${-sign * 10}px)`, filter: "blur(6px)", offset: .34 },
      { opacity: 0, transform: `translateY(${sign * 10}px)`, filter: "blur(6px)", offset: .48 },
      { opacity: 1, transform: "translateY(0)", filter: "blur(0)", offset: 1 }
    ], { duration: 640 + offset * 60, easing: "cubic-bezier(.2,.8,.2,1)" }));

    window.setTimeout(() => setContent(next), 255);
    window.setTimeout(() => {
      previousWatch.classList.remove("is-active");
      previousWatch.getAnimations().forEach((animation) => animation.cancel());
      nextWatch.getAnimations().forEach((animation) => animation.cancel());
      previousWatch.style.zIndex = "";
      nextWatch.style.zIndex = "";
      current = next;
      busy = false;
    }, 740);
  };

  const move = (direction) => {
    const delta = direction === "next" ? 1 : -1;
    showSlide((current + delta + heroSlides.length) % heroSlides.length, direction);
  };

  const startAutoplay = () => {
    window.clearInterval(autoplay);
    if (reducedMotion) return;
    autoplay = window.setInterval(() => move("next"), 5600);
  };

  carousel.querySelectorAll("[data-hero-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      move(button.dataset.heroDirection);
      startAutoplay();
    });
  });
  carousel.addEventListener("pointerenter", () => window.clearInterval(autoplay));
  carousel.addEventListener("pointerleave", startAutoplay);
  carousel.addEventListener("focusin", () => window.clearInterval(autoplay));
  carousel.addEventListener("focusout", (event) => { if (!carousel.contains(event.relatedTarget)) startAutoplay(); });
  startAutoplay();
}

function initMotion() {
  requestAnimationFrame(() => document.body.classList.add("loaded"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(pointer: fine)").matches) {
    const hero = $(".hero");
    const visual = hero.querySelector(".hero-visual");
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      visual.style.setProperty("--hero-shift-x", `${(-x * 10).toFixed(1)}px`);
      visual.style.setProperty("--hero-shift-y", `${(-y * 8).toFixed(1)}px`);
    });
    hero.addEventListener("pointerleave", () => {
      visual.style.setProperty("--hero-shift-x", "0px");
      visual.style.setProperty("--hero-shift-y", "0px");
    });
  }
}

initHeroCarousel();
initMotion();

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
