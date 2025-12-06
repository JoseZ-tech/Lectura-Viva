const API_BASE_URL = 'http://127.0.0.1:8000';


const CARRO_KEY = 'lecturaViva_carrito';




/**
 * Carga el carrito desde el LocalStorage. Si no existe, devuelve un arreglo vacío.
 * @returns {Array} Lista de items en el carrito.
 */
function cargarCarrito() {
    try {
        const carritoJSON = localStorage.getItem(CARRO_KEY);
        return carritoJSON ? JSON.parse(carritoJSON) : [];
    } catch (e) {
        console.error("Error al cargar el carrito de LocalStorage:", e);
        return [];
    }
}

/**
 * Guarda la lista de items del carrito en el LocalStorage.
 * @param {Array} carrito Lista de items.
 */
function guardarCarrito(carrito) {
    try {
        localStorage.setItem(CARRO_KEY, JSON.stringify(carrito));
        actualizarContadorCarrito(carrito);
    } catch (e) {
        console.error("Error al guardar el carrito en LocalStorage:", e);
    }
}

/**
 * Actualiza el contador visible del carrito en la navegación.
 * @param {Array} carrito Lista de items (opcional).
 */
function actualizarContadorCarrito(carrito = cargarCarrito()) {
    const contadorElemento = document.getElementById('carrito-contador');
    if (contadorElemento) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        contadorElemento.textContent = totalItems;
        contadorElemento.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

/**
 * Agrega un libro al carrito o incrementa su cantidad.
 * @param {object} libro Objeto del libro a agregar.
 */
function agregarAlCarrito(libro) {
    let carrito = cargarCarrito();
    const itemExistente = carrito.find(item => item.id_libro === libro.id);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id_libro: libro.id,
            titulo: libro.titulo,
            precio_unitario: libro.precio,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
    alert(`"${libro.titulo}" ha sido agregado al carrito.`);
}




/**
 * Obtiene la lista de libros desde el endpoint de FastAPI.
 * @returns {Promise<Array>} Promesa que resuelve en la lista de libros.
 */
async function obtenerLibros() {
    try {
        const response = await fetch(`${API_BASE_URL}/libros`);

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Fallo al obtener los libros de la API:", error);
        // Devuelve datos de ejemplo si la API falla
        return [
            { id: "660000000000000000000001", titulo: "Estudio en Escarlata (FALLBACK)", autor: "A. Conan Doyle", precio: 10990, imagen_url: "Sherlock.webp" },
            { id: "660000000000000000000002", titulo: "Romeo y Julieta (FALLBACK)", autor: "W. Shakespeare", precio: 5200, imagen_url: "Romeo.png" }
        ];
    }
}

/**
 * Crea el HTML de la tarjeta (card) de un libro.
 * @param {object} libro Objeto con los datos del libro.
 * @returns {string} Código HTML de la tarjeta.
 */
function crearCardLibro(libro) {
    const precioFormateado = `$${libro.precio.toLocaleString('es-CL')}`;

    return `
        <div class="col">
            <div class="card bg-secondary border-0 book-card text-white shadow-sm">
                <img src="${libro.imagen_url}" class="card-img-top book-img p-3" alt="${libro.titulo}">
                <div class="card-body d-flex flex-column text-center">
                    <h6 class="card-title fw-bold">${libro.titulo}</h6>
                    <p class="card-text small text-light">${libro.autor}</p>
                    <p class="mt-auto mb-1 fs-5 fw-bold text-white">${precioFormateado}</p>
                    <button 
                        class="fw-bold btn btn-primary btn-sm mt-2"
                        onclick='agregarAlCarrito(${JSON.stringify(libro)})'
                    >
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
}


async function renderizarCatalogo() {
    const contenedor = document.getElementById('catalogo-contenedor');
    if (!contenedor) return;

    const libros = await obtenerLibros();
    let htmlContent = '';

    libros.forEach(libro => {
        htmlContent += crearCardLibro(libro);
    });

    contenedor.innerHTML = htmlContent;
}





document.addEventListener('DOMContentLoaded', () => {

    renderizarCatalogo();


    actualizarContadorCarrito();


});


window.agregarAlCarrito = agregarAlCarrito;
window.actualizarContadorCarrito = actualizarContadorCarrito;