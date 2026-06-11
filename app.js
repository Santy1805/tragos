/* =============================================
   DRIP — Bebidas Premium | app.js
   ============================================= */

// =============================================
// DATOS: Catálogo de productos
// =============================================
const PRODUCTOS = [
  {
    id: 1,
    nombre: "Thunder Energy",
    categoria: "energizante",
    precio: 1200,
    emoji: "⚡",
    descripcion: "Energía máxima con taurina y vitamina B12. Sabor tropical.",
  },
  {
    id: 2,
    nombre: "Volt Zero",
    categoria: "energizante",
    precio: 1100,
    emoji: "🔋",
    descripcion: "Sin azúcar. Foco mental y rendimiento sin el bajón.",
  },
  {
    id: 3,
    nombre: "Naranja Pura",
    categoria: "jugos",
    precio: 900,
    emoji: "🍊",
    descripcion: "Jugo de naranja exprimido en frío. Sin conservantes.",
  },
  {
    id: 4,
    nombre: "Verde Vital",
    categoria: "jugos",
    precio: 1050,
    emoji: "🥝",
    descripcion: "Manzana, kiwi y espinaca. Antioxidante y refrescante.",
  },
  {
    id: 5,
    nombre: "Aqua Mineral",
    categoria: "agua",
    precio: 600,
    emoji: "💧",
    descripcion: "Agua mineral natural de manantial. Mineralización óptima.",
  },
  {
    id: 6,
    nombre: "Aqua Sparkling",
    categoria: "agua",
    precio: 700,
    emoji: "🫧",
    descripcion: "Agua mineral con gas premium. Burbujas finas y persistentes.",
  },
  {
    id: 7,
    nombre: "Cola Clásica",
    categoria: "gaseosa",
    precio: 850,
    emoji: "🥤",
    descripcion: "Gaseosa cola artesanal con extracto de cola real.",
  },
  {
    id: 8,
    nombre: "Limón Effervescente",
    categoria: "gaseosa",
    precio: 820,
    emoji: "🍋",
    descripcion: "Limonada con gas natural. Cítrica, seca y refrescante.",
  },
];

// =============================================
// ESTADO GLOBAL
// =============================================
let carrito = [];
let filtroActivo = "all";

// =============================================
// MÓDULO: Render de productos
// =============================================
function crearCardProducto(producto) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.dataset.categoria = producto.categoria;

  card.innerHTML = `
    <div class="product-card__glow"></div>
    <div class="product-card__image">${producto.emoji}</div>
    <div class="product-card__body">
      <p class="product-card__category">${producto.categoria}</p>
      <h3 class="product-card__name">${producto.nombre}</h3>
      <p class="product-card__desc">${producto.descripcion}</p>
      <div class="product-card__footer">
        <span class="product-card__price">$${producto.precio.toLocaleString()}</span>
        <div class="product-card__actions">
          <div class="product-card__qty-selector">
            <button class="qty-btn qty-btn--minus" aria-label="Reducir cantidad">−</button>
            <span class="qty-value">1</span>
            <button class="qty-btn qty-btn--plus" aria-label="Aumentar cantidad">+</button>
          </div>
          <button class="product-card__add" data-id="${producto.id}" aria-label="Agregar ${producto.nombre} al carrito">Agregar</button>
        </div>
      </div>
    </div>
  `;

  let cantidadSeleccionada = 1;
  const qtyDisplay = card.querySelector(".qty-value");

  card.querySelector(".qty-btn--minus").addEventListener("click", (e) => {
    e.stopPropagation();
    if (cantidadSeleccionada > 1) {
      cantidadSeleccionada--;
      qtyDisplay.textContent = cantidadSeleccionada;
    }
  });

  card.querySelector(".qty-btn--plus").addEventListener("click", (e) => {
    e.stopPropagation();
    cantidadSeleccionada++;
    qtyDisplay.textContent = cantidadSeleccionada;
  });

  card.querySelector(".product-card__add").addEventListener("click", (e) => {
    e.stopPropagation();
    agregarAlCarrito(producto.id, cantidadSeleccionada);
    cantidadSeleccionada = 1;
    qtyDisplay.textContent = 1;
  });

  return card;
}

function renderizarProductos(filtro = "all") {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";

  const filtrados = filtro === "all"
    ? PRODUCTOS
    : PRODUCTOS.filter((p) => p.categoria === filtro);

  filtrados.forEach((prod) => {
    const card = crearCardProducto(prod);
    grid.appendChild(card);
  });
}

// =============================================
// MÓDULO: Carrito
// =============================================
function agregarAlCarrito(productoId, cantidad = 1) {
  const producto = PRODUCTOS.find((p) => p.id === productoId);
  if (!producto) return;

  const itemExistente = carrito.find((i) => i.id === productoId);
  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }

  actualizarCarritoUI();
  mostrarToast(`${producto.emoji} ${producto.nombre} agregado`);
}

function cambiarCantidad(productoId, delta) {
  const item = carrito.find((i) => i.id === productoId);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter((i) => i.id !== productoId);
  }

  actualizarCarritoUI();
}

function actualizarCarritoUI() {
  const count = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  document.getElementById("cartCount").textContent = count;

  const totalPrecio = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  document.getElementById("cartTotal").textContent = `$${totalPrecio.toLocaleString()}`;

  const itemsContainer = document.getElementById("cartItems");

  if (carrito.length === 0) {
    itemsContainer.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
    return;
  }

  itemsContainer.innerHTML = "";
  carrito.forEach((item) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span class="cart-item__emoji">${item.emoji}</span>
      <div class="cart-item__info">
        <p class="cart-item__name">${item.nombre}</p>
        <p class="cart-item__price">$${(item.precio * item.cantidad).toLocaleString()}</p>
      </div>
      <div class="cart-item__qty">
        <button data-id="${item.id}" data-delta="-1">−</button>
        <span>${item.cantidad}</span>
        <button data-id="${item.id}" data-delta="1">+</button>
      </div>
    `;
    div.querySelectorAll("button[data-delta]").forEach((btn) => {
      btn.addEventListener("click", () => {
        cambiarCantidad(Number(btn.dataset.id), Number(btn.dataset.delta));
      });
    });
    itemsContainer.appendChild(div);
  });
}

// =============================================
// MÓDULO: Panel del carrito (abrir / cerrar)
// =============================================
function abrirCarrito() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("cartOverlay").classList.add("show");
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("show");
  document.body.style.overflow = "";
}

// =============================================
// MÓDULO: Toast de notificación
// =============================================
let toastTimer = null;

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

// =============================================
// MÓDULO: Filtro de categorías
// =============================================
function inicializarFiltros() {
  const botones = document.querySelectorAll(".cat-btn");
  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      botones.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filtroActivo = btn.dataset.filter;
      renderizarProductos(filtroActivo);
    });
  });
}

// =============================================
// MÓDULO: Navbar scrolled
// =============================================
function inicializarNavbar() {
  const nav = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });
}

// =============================================
// MÓDULO: Burbujas animadas en el hero (canvas)
// =============================================
function inicializarBurbujas() {
  const canvas = document.getElementById("bubbleCanvas");
  const ctx = canvas.getContext("2d");

  function redimensionar() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  redimensionar();
  window.addEventListener("resize", redimensionar);

  const burbujas = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radio: Math.random() * 4 + 1,
    velocidadY: Math.random() * 0.5 + 0.2,
    opacidad: Math.random() * 0.4 + 0.1,
  }));

  function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo gradiente
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#0D1B2A");
    grad.addColorStop(1, "#0a2540");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    burbujas.forEach((b) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 201, 255, ${b.opacidad})`;
      ctx.fill();

      b.y -= b.velocidadY;
      if (b.y + b.radio < 0) {
        b.y = canvas.height + b.radio;
        b.x = Math.random() * canvas.width;
      }
    });

    requestAnimationFrame(animar);
  }

  animar();
}

// =============================================
// MÓDULO: Checkout con formulario + WhatsApp
// =============================================

// Número de WhatsApp destino (formato internacional sin + ni espacios)
const WPP_NUMERO = "5491134903230"; // ← REEMPLAZÁ con tu número real

function enviarPedidoPorWpp() {
  const nombre = document.getElementById("clienteName").value.trim();
  const domicilio = document.getElementById("clienteDir").value.trim();
  const pagoInput = document.querySelector('input[name="payment"]:checked');

  if (carrito.length === 0) { mostrarToast("⚠️ Tu carrito está vacío"); return; }
  if (!nombre) { mostrarToast("⚠️ Ingresá tu nombre"); return; }
  if (!domicilio) { mostrarToast("⚠️ Ingresá tu domicilio"); return; }
  if (!pagoInput) { mostrarToast("⚠️ Elegí un método de pago"); return; }

  const pago = pagoInput.value;
  const totalPrecio = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const lineasProductos = carrito
    .map(i => `  • ${i.emoji} ${i.nombre} x${i.cantidad} — $${(i.precio * i.cantidad).toLocaleString()}`)
    .join("\n");

  const mensaje =
`🛒 *Nuevo pedido NOMBRE DEL LOCAL*

👤 *Cliente:* ${nombre}
📍 *Domicilio:* ${domicilio}
💳 *Pago:* ${pago}

*Productos:*
${lineasProductos}

💰 *Total: $${totalPrecio.toLocaleString()}*`;

  const url = `https://wa.me/${WPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");

  // Limpiar estado
  carrito = [];
  actualizarCarritoUI();
  document.getElementById("clienteName").value = "";
  document.getElementById("clienteDir").value = "";
  const checkedRadio = document.querySelector('input[name="payment"]:checked');
  if (checkedRadio) checkedRadio.checked = false;
  cerrarCarrito();
  mostrarToast("✅ ¡Pedido enviado por WhatsApp!");
}

function inicializarCheckout() {
  document.getElementById("sendOrderBtn").addEventListener("click", enviarPedidoPorWpp);
}

// =============================================
// INIT: arrancar todo al cargar la página
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarNavbar();
  inicializarBurbujas();
  renderizarProductos();
  inicializarFiltros();
  inicializarCheckout();

  document.getElementById("cartBtn").addEventListener("click", abrirCarrito);
  document.getElementById("closeCart").addEventListener("click", cerrarCarrito);
  document.getElementById("cartOverlay").addEventListener("click", cerrarCarrito);
});
