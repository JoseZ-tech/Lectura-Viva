// =================================================================
// CONFIGURACIÓN Y FUNCIONES BASE (REPETIDAS DEL index.js)
// Es importante que estas estén disponibles en esta página.
// =================================================================

const API_BASE_URL = 'mongodb://localhost:27017/';
const CARRO_KEY = 'lecturaViva_carrito';
const COSTO_ENVIO = 2000; // Costo de envío fijo, basado en tu HTML de ejemplo

function cargarCarrito() {
    try {
        const carritoJSON = localStorage.getItem(CARRO_KEY);
        return carritoJSON ? JSON.parse(carritoJSON) : [];
    } catch (e) {
        console.error("Error al cargar el carrito de LocalStorage:", e);
        return [];
    }
}

function guardarCarrito(carrito) {
    try {
        localStorage.setItem(CARRO_KEY, JSON.stringify(carrito));
    } catch (e) {
        console.error("Error al guardar el carrito en LocalStorage:", e);
    }
}

// =================================================================
// LÓGICA DE CÁLCULO Y RENDERIZADO
// =================================================================

/**
 * Renderiza la lista de productos en la columna de resumen.
 * @param {Array} carrito - Lista de ítems del carrito.
 */
function renderizarItems(carrito) {
    const listaItems = document.getElementById('lista-items-pedido');
    if (!listaItems) return;

    if (carrito.length === 0) {
        listaItems.innerHTML = '<li class="list-group-item bg-dark text-white text-center">El carrito está vacío.</li>';
        return;
    }

    listaItems.innerHTML = carrito.map(item => {
        const totalItem = item.precio_unitario * item.cantidad;
        return `
            <li class="list-group-item bg-secondary d-flex justify-content-between text-white align-items-center">
                <img src="${item.imagen_url || 'placeholder.webp'}" alt="Portada" class="rounded me-3 order-item-img" style="width: 60px; height: 90px; object-fit: cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-0">${item.titulo}</h6>
                    <small class="text-muted">Cantidad: ${item.cantidad}</small>
                </div>
                <span class="fw-bold">$${totalItem.toLocaleString('es-CL')}</span> 
            </li>
        `;
    }).join('');
}

/**
 * Calcula y renderiza el subtotal, envío y total.
 * @param {Array} carrito - Lista de ítems del carrito.
 * @returns {number} El monto total del pedido.
 */
function renderizarTotales(carrito) {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    const total = subtotal + COSTO_ENVIO;

    const subtotalEl = document.getElementById('resumen-subtotal');
    const envioEl = document.getElementById('resumen-envio');
    const totalEl = document.getElementById('resumen-total');
    const botonPagar = document.getElementById('boton-pagar');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString('es-CL')}`;
    if (envioEl) envioEl.textContent = `$${COSTO_ENVIO.toLocaleString('es-CL')}`;
    if (totalEl) totalEl.textContent = `$${total.toLocaleString('es-CL')}`;

    if (botonPagar) {
        botonPagar.textContent = `Confirmar y Pagar $${total.toLocaleString('es-CL')}`;
        botonPagar.disabled = carrito.length === 0;
    }

    return total;
}

// =================================================================
// LÓGICA DE ENVÍO A FASTAPI
// =================================================================

/**
 * Captura los datos del formulario y envía la solicitud POST a la API.
 */
async function confirmarPedido(event) {
    event.preventDefault();

    const carrito = cargarCarrito();
    if (carrito.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de confirmar.");
        return;
    }

    // 1. Obtener datos del formulario de envío
    const form = event.target;
    const direccion_envio = {
        nombre_completo: form.nombre_completo.value,
        email: form.email.value,
        direccion: form.direccion.value,
        ciudad: form.ciudad.value,
        region: form.region.value,
    };

    // 2. Calcular totales finales
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
    const total = subtotal + COSTO_ENVIO;

    // 3. Crear el objeto de Pedido (estructura PedidoBase)
    const pedidoPayload = {
        id_usuario: direccion_envio.email, // Usamos el email como ID de usuario por simplicidad
        subtotal: subtotal,
        costo_envio: COSTO_ENVIO,
        total: total,
        direccion_envio: direccion_envio,
        items: carrito.map(item => ({
            id_libro: item.id_libro,
            titulo: item.titulo,
            precio_unitario: item.precio_unitario,
            cantidad: item.cantidad
        }))
    };

    // Deshabilitar botón para evitar envíos duplicados
    const botonPagar = document.getElementById('boton-pagar');
    botonPagar.disabled = true;
    botonPagar.textContent = 'Procesando...';

    // 4. Enviar a FastAPI
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pedidoPayload)
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✅ ¡Pedido N° ${data.id_pedido} creado con éxito! Total: $${data.total.toLocaleString('es-CL')}.`);

            // Limpiar carrito después de un pedido exitoso
            guardarCarrito([]);

            // Redirigir al usuario a una página de confirmación o de inicio
            window.location.href = "User.html"; // Redirigir a "Mi Cuenta" o "Inicio"

        } else {
            // Manejo de errores de la API (ej. validación Pydantic)
            console.error("Error al crear el pedido:", data);
            alert(`❌ Error al confirmar el pedido: ${data.detail || 'Fallo de conexión o validación.'}`);
            botonPagar.disabled = false;
            botonPagar.textContent = `Confirmar y Pagar $${total.toLocaleString('es-CL')}`;
        }
    } catch (error) {
        console.error("Error de red al enviar el pedido:", error);
        alert("❌ Error de conexión: No se pudo contactar con el servidor de la API.");
        botonPagar.disabled = false;
        botonPagar.textContent = `Confirmar y Pagar $${total.toLocaleString('es-CL')}`;
    }
}

// =================================================================
// INICIALIZACIÓN
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    const carritoActual = cargarCarrito();

    // 1. Mostrar los items
    renderizarItems(carritoActual);

    // 2. Mostrar los totales
    const totalMonto = renderizarTotales(carritoActual);

    // 3. Vincular la función de confirmación al formulario
    const formularioPedido = document.getElementById('formulario-pedido');
    if (formularioPedido) {
        formularioPedido.addEventListener('submit', confirmarPedido);
    }
});

// Asegurar que la función de confirmación esté disponible globalmente (si se usa onclick en el botón)
window.confirmarPedido = confirmarPedido;