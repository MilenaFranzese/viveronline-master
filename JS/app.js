const header = document.querySelector("#header");
const contenedor = document.querySelector("#contenedor");
const body = document.querySelector("body");

window.addEventListener("scroll", function () {
    if (contenedor.getBoundingClientRect().top < 10) {
        header.classList.add("scroll");
    } else {
        header.classList.remove("scroll");
    }
});

const abrirCarrito = document.getElementById("botonCarrito");
const modal = document.getElementById("modal");
const listaCarrito = document.getElementById("listaCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const cuentaCarrito = document.getElementById("cuentacarrito");

const carrito = [];

abrirCarrito.addEventListener("click", abrirModal);

function abrirModal() {
    modal.style.display = "block";
    calcularTotal();
}

function cerrarModal() {
    modal.style.display = "none";
}

function agregarAlCarrito(nombreProducto, precioProducto) {
    const productoEnCarrito = carrito.find(producto => producto.nombre === nombreProducto);

    if (productoEnCarrito) {
        productoEnCarrito.cantidad++;
        productoEnCarrito.subtotal = productoEnCarrito.cantidad * precioProducto;
    } else {
        carrito.push({
            nombre: nombreProducto,
            precio: precioProducto,
            cantidad: 1,
            subtotal: precioProducto
        });
    }

    actualizarCarritoDOM();
    guardarCarritoEnLocalStorage();
}

function eliminarProducto(nombreProducto) {
    const indiceProducto = carrito.findIndex(producto => producto.nombre === nombreProducto);

    if (indiceProducto !== -1) {
        carrito.splice(indiceProducto, 1);
    }

    actualizarCarritoDOM();
    guardarCarritoEnLocalStorage();
}

function limpiarCarritoSinConfirmacion() {
    carrito.length = 0; 
    actualizarCarritoDOM();
    guardarCarritoEnLocalStorage();
}

function limpiarCarritoConConfirmacion() {
    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, vaciar carrito"
    }).then((result) => {
        if (result.isConfirmed) {
            limpiarCarritoSinConfirmacion();

            Swal.fire({
                title: "¡Vacío!",
                text: "Tu carrito ha sido vaciado.",
                icon: "success"
            });
        }
    });
}

function calcularTotal() {
    let total = 0;

    for (const producto of carrito) {
        total += producto.subtotal;
    }

    totalCarrito.textContent = `$${total.toFixed(2)}`;
}

function actualizarCarritoDOM() {
    listaCarrito.innerHTML = "";

    for (const producto of carrito) {
        const nuevoProducto = document.createElement("li");
        nuevoProducto.innerHTML = `
            <span class="cantidad">${producto.cantidad}</span> 
            ${producto.nombre} - 
            Subtotal: <span class="subtotal">$${producto.subtotal.toFixed(2)}</span>
            <i class="fa-solid fa-trash-can" onclick="eliminarProducto('${producto.nombre}')"></i>
        `;
        listaCarrito.appendChild(nuevoProducto);
    }

    if (carrito.length === 0) {
        totalCarrito.textContent = "$0.00";
    } else {
        calcularTotal();
    }

    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    let cantidadTotal = 0;

    for (const producto of carrito) {
        cantidadTotal += producto.cantidad;
    }

    cuentaCarrito.textContent = cantidadTotal.toString();
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function recuperarCarritoDesdeLocalStorage() {
    const carritoGuardado = localStorage.getItem("carrito");

    if (carritoGuardado) {
        carrito.length = 0;
        const carritoParseado = JSON.parse(carritoGuardado);
        carrito.push(...carritoParseado);
        actualizarCarritoDOM();
        calcularTotal();
    }
}

recuperarCarritoDesdeLocalStorage();

const botonesComprar = document.querySelectorAll(".card button");

botonesComprar.forEach((boton) => {
    boton.addEventListener("click", function () {
        const producto = this.parentNode;
        const nombreProducto = producto.querySelector("p").textContent;
        const precioProducto = parseFloat(producto.querySelector(".precio").textContent.replace("$", ""));

        agregarAlCarrito(nombreProducto, precioProducto);
    });
});

document.querySelector(".boton-comprar").addEventListener("click", async function () {
    console.log("Botón comprar clickeado");

    if (carrito.length === 0) {
        Swal.fire({
            icon: "info",
            title: "Carrito vacío",
            text: "Agrega productos al carrito antes de realizar la compra.",
        });
        return;
    }

    try {
        const email = await obtenerEmail();

        if (!email) {
            console.log("Email no proporcionado");
            return;
        }

        console.log("Email proporcionado:", email);

        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "¡Compra finalizada!",
            text: `Enviaremos la factura a tu mail (${email}) junto a los datos para que puedas abonar y las formas de envío o retiro.`,
            showConfirmButton: false,
            timer: 5000,
        });

        limpiarCarritoSinConfirmacion();
    } catch (error) {
        console.error("Error en el proceso de compra:", error);
    }
});

async function obtenerEmail() {
    const resultado = await Swal.fire({
        title: "Ingrese su email",
        input: "email",
        inputAttributes: {
            autocapitalize: "off",
            required: "true"
        },
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        showLoaderOnConfirm: true,
        preConfirm: async (email) => {
            if (!email) {
                Swal.showValidationMessage("Es necesario ingresar un email para continuar");
            } else {
                return email;
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
    });

    if (resultado.isConfirmed) {
        return resultado.value;
    }

    return null;
}

const listaComentarios = async () => {
    try {
        const respuesta = await fetch("https://jsonplaceholder.typicode.com/comments");
        const comentarios = await respuesta.json();

        const comentariosLimitados = comentarios.slice(0, 5);

        let tableBody = ``;
        comentariosLimitados.forEach((comentario, index) => {
            tableBody += `<tr>
                <td>${comentario.email}</td>
                <td>${comentario.body}</td>
            </tr>`;
        });

        document.getElementById("tableBody_comentarios").innerHTML = tableBody;
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
    }
};

window.addEventListener("load", function () {
    listaComentarios();
});
