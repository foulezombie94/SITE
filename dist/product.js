const watches = {
  azur: {
    id: 2, name: "Montre Ligne Azur", tagline: "Le temps en clair.", image: "/assets/watch-azure.webp",
    price: 149, old: 179, accent: "#3d86ff", surface: "#0a2449", note: "ACIER BROSSÉ / CADRAN BLEU",
    description: "Acier brossé, cadran bleu nuit et proportions nettes : une montre précise et équilibrée, dessinée pour chaque jour.",
    specs: [["Boîtier", "Acier · 38 mm"], ["Bracelet", "Acier brossé"], ["Verre", "Minéral renforcé"], ["Étanchéité", "5 ATM"]]
  },
  emeraude: {
    id: 7, name: "Montre Ligne Émeraude", tagline: "L’élégance juste.", image: "/assets/watch-emerald.webp",
    price: 169, old: 199, accent: "#efb879", surface: "#12382b", note: "OR ROSE / CADRAN ÉMERAUDE",
    description: "Cadran vert profond, boîtier or rose et bracelet en cuir brun pour une présence chaleureuse sans excès.",
    specs: [["Boîtier", "Acier or rose · 38 mm"], ["Bracelet", "Cuir brun"], ["Verre", "Minéral renforcé"], ["Étanchéité", "5 ATM"]]
  },
  minuit: {
    id: 8, name: "Montre Ligne Minuit", tagline: "Le caractère net.", image: "/assets/watch-burgundy.webp",
    price: 159, old: 189, accent: "#ff758e", surface: "#3b111d", note: "ACIER NOIR / CADRAN BORDEAUX",
    description: "Acier noir, cuir grainé et cadran bordeaux composent une silhouette affirmée qui garde toute la sobriété de la Ligne.",
    specs: [["Boîtier", "Acier noir · 38 mm"], ["Bracelet", "Cuir noir grainé"], ["Verre", "Minéral renforcé"], ["Étanchéité", "5 ATM"]]
  }
};

const $ = (selector) => document.querySelector(selector);
const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let currentSlug = new URLSearchParams(location.search).get("watch") || "azur";
let currentWatch = watches[currentSlug] || watches.azur;
let changing = false;
let queuedSlug = null;

function renderWatch(slug, updateUrl = true) {
  currentSlug = watches[slug] ? slug : "azur";
  currentWatch = watches[currentSlug];
  document.title = `${currentWatch.name} — FOLKI`;
  document.documentElement.style.setProperty("--watch-accent", currentWatch.accent);
  document.documentElement.style.setProperty("--watch-surface", currentWatch.surface);
  $("#watch-name").textContent = currentWatch.name;
  $("#watch-tagline").textContent = currentWatch.tagline;
  $("#watch-description").textContent = currentWatch.description;
  $("#watch-image").src = currentWatch.image;
  $("#watch-image").alt = currentWatch.name;
  $("#watch-note").textContent = currentWatch.note;
  $("#watch-price").textContent = euro.format(currentWatch.price);
  $("#watch-old-price").textContent = euro.format(currentWatch.old);
  $("#watch-specs").innerHTML = currentWatch.specs.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
  document.querySelectorAll("[data-variant]").forEach((link) => {
    const active = link.dataset.variant === currentSlug;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "true"); else link.removeAttribute("aria-current");
  });
  const addButton = $("#watch-add");
  addButton.classList.remove("added");
  addButton.innerHTML = "Ajouter au panier <span>＋</span>";
  $("#watch-go-cart").classList.remove("visible");
  if (updateUrl) history.replaceState({ watch: currentSlug }, "", `/product.html?watch=${currentSlug}`);
}

async function changeWatch(slug) {
  if (!watches[slug] || slug === currentSlug) return;
  if (changing) { queuedSlug = slug; return; }
  changing = true;
  const image = $("#watch-image");
  const details = $(".watch-details");

  if (!reducedMotion) {
    await Promise.all([
      image.animate([
        { opacity: 1, transform: "translate3d(0,-18px,0) scale(1)" },
        { opacity: 0, transform: "translate3d(0,-72px,0) scale(.94)" }
      ], { duration: 210, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" }).finished,
      details.animate([
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-16px)" }
      ], { duration: 180, easing: "ease-in", fill: "forwards" }).finished
    ]);
  }

  renderWatch(slug);

  if (!reducedMotion) {
    await Promise.all([
      image.animate([
        { opacity: 0, transform: "translate3d(0,78px,0) scale(.92)" },
        { opacity: 1, transform: "translate3d(0,-18px,0) scale(1)" }
      ], { duration: 540, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }).finished,
      details.animate([
        { opacity: 0, transform: "translateY(22px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 440, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" }).finished
    ]);
  }

  image.getAnimations().forEach((animation) => animation.cancel());
  details.getAnimations().forEach((animation) => animation.cancel());
  changing = false;
  if (queuedSlug) {
    const nextSlug = queuedSlug;
    queuedSlug = null;
    changeWatch(nextSlug);
  }
}

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("folki-cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch { return []; }
}

function updateCount() {
  $("#watch-count").textContent = readCart().reduce((total, item) => total + Number(item.qty || 0), 0);
}

document.querySelectorAll("[data-variant]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  changeWatch(link.dataset.variant);
}));

$("#watch-add").addEventListener("click", (event) => {
  const cart = readCart();
  const line = cart.find((item) => item.id === currentWatch.id);
  if (line) line.qty += 1; else cart.push({ id: currentWatch.id, qty: 1 });
  localStorage.setItem("folki-cart", JSON.stringify(cart));
  updateCount();
  event.currentTarget.classList.add("added");
  event.currentTarget.innerHTML = "Ajoutée au panier <span>✓</span>";
  $("#watch-go-cart").classList.add("visible");
});

window.addEventListener("popstate", () => renderWatch(new URLSearchParams(location.search).get("watch") || "azur", false));
renderWatch(currentSlug, false);
updateCount();
