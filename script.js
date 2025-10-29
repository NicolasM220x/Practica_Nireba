document.addEventListener('DOMContentLoaded', () => {
    const productos = [
        { id: 1, nombre: 'Choquy', precio: 5000, img: 'choquy.jpeg' },
        { id: 2, nombre: 'Croquetas', precio: 12000, img: 'croquetas.jpeg' },
        { id: 3, nombre: 'Galletas', precio: 8000, img: 'galletas.jpeg' },
        { id: 4, nombre: 'Snack', precio: 3000, img: 'snack.jpeg' }
    ];

    const productsContainer = document.getElementById('products');
    const searchInput = document.getElementById('search');
    const suggestionsContainer = document.getElementById('suggestions');
    const totalSpan = document.getElementById('total');

    // Modales
    const modalCotizacion = document.getElementById('modalCotizacion');
    const modalDetalle = document.getElementById('cotizacion-detalle');
    const btnContinuar = document.getElementById('continuar');
    const btnEditar = document.getElementById('editar');
    const spanClose = document.querySelector('.close');

    const modalGuardado = document.getElementById('modalGuardado');
    const btnRegistrarPedido = document.getElementById('registrarPedido');
    const btnContinuarGuardado = document.getElementById('continuarGuardado');
    const spanCloseGuardado = document.querySelector('.close-guardado');

    let carrito = [];

    // --- Render carrito ---
    function renderCarrito() {
        productsContainer.innerHTML = '';
        let total = 0;

        carrito.forEach(producto => {
            total += producto.precio * producto.cantidad;

            const div = document.createElement('div');
            div.classList.add('product', 'added');

            // Imagen con badge
            const imgWrapper = document.createElement('div');
            imgWrapper.style.position = 'relative';
            const img = document.createElement('img');
            img.src = producto.img;
            imgWrapper.appendChild(img);

            const badge = document.createElement('span');
            badge.classList.add('quantity-badge');
            badge.textContent = producto.cantidad;
            imgWrapper.appendChild(badge);

            div.appendChild(imgWrapper);

            // Nombre
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('product-name');
            nameSpan.textContent = producto.nombre;
            div.appendChild(nameSpan);

            // Controles cantidad
            const controls = document.createElement('div');
            controls.classList.add('quantity-controls');

            const minusBtn = document.createElement('button');
            minusBtn.textContent = '-';
            const inputQty = document.createElement('input');
            inputQty.type = 'text';
            inputQty.value = producto.cantidad;
            inputQty.readOnly = true;
            const plusBtn = document.createElement('button');
            plusBtn.textContent = '+';

            controls.appendChild(minusBtn);
            controls.appendChild(inputQty);
            controls.appendChild(plusBtn);
            div.appendChild(controls);

            // Precio
            const priceSpan = document.createElement('span');
            priceSpan.textContent = `$${producto.precio * producto.cantidad}`;
            div.appendChild(priceSpan);

            // Animación pop
            setTimeout(() => div.classList.remove('added'), 200);

            // Eventos botones
            plusBtn.addEventListener('click', () => {
                producto.cantidad++;
                renderCarrito();
            });

            minusBtn.addEventListener('click', () => {
                if (producto.cantidad > 1) {
                    producto.cantidad--;
                } else {
                    carrito = carrito.filter(p => p.id !== producto.id);
                }
                renderCarrito();
            });

            productsContainer.appendChild(div);
        });

        totalSpan.textContent = `$${total}`;
    }

    // --- Agregar al carrito ---
    function agregarAlCarrito(producto) {
        const enCarrito = carrito.find(p => p.id === producto.id);
        if (enCarrito) {
            enCarrito.cantidad++;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        renderCarrito();
        searchInput.value = '';
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.classList.remove('show');
    }

    // --- Autocompletado ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        suggestionsContainer.innerHTML = '';

        if (!query) {
            suggestionsContainer.classList.remove('show');
            return;
        }

        const matches = productos.filter(p => p.nombre.toLowerCase().includes(query));

        matches.forEach(p => {
            const div = document.createElement('div');
            div.classList.add('suggestion-item');

            const img = document.createElement('img');
            img.src = p.img;
            div.appendChild(img);

            const span = document.createElement('span');
            span.textContent = p.nombre;
            div.appendChild(span);

            const price = document.createElement('span');
            price.classList.add('suggestion-price');
            price.textContent = `$${p.precio}`;
            div.appendChild(price);

            div.addEventListener('click', () => agregarAlCarrito(p));
            suggestionsContainer.appendChild(div);
        });

        suggestionsContainer.classList.add('show');
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim().toLowerCase();
            const producto = productos.find(p => p.nombre.toLowerCase() === query);
            if (producto) agregarAlCarrito(producto);
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('show');
        }
    });

    // --- Modal cotización ---
    document.querySelector('button.register').addEventListener('click', () => {
        if (carrito.length === 0) {
            alert('Agrega productos antes de registrar el pedido.');
            return;
        }

        let detalle = `<h2>Cotización guardada con éxito!</h2>`;
        detalle += `<p><strong>Cliente:</strong> ${document.getElementById('cliente').value || 'N/A'}</p>`;
        detalle += `<p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>`;
        detalle += `<p><strong>Productos:</strong></p><ul>`;

        carrito.forEach(p => {
            detalle += `<li>${p.nombre} - ${p.cantidad} unidad(es) - $${p.precio * p.cantidad}</li>`;
        });

        const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
        detalle += `</ul><p><strong>Total:</strong> $${total}</p>`;

        modalDetalle.innerHTML = detalle;
        modalCotizacion.style.display = 'block';
    });

    spanClose.onclick = () => modalCotizacion.style.display = 'none';
    btnEditar.onclick = () => modalCotizacion.style.display = 'none';
    btnContinuar.onclick = () => {
        modalCotizacion.style.display = 'none';
        carrito = [];
        renderCarrito();
    };

    window.onclick = (event) => {
        if (event.target === modalCotizacion) modalCotizacion.style.display = 'none';
        if (event.target === modalGuardado) modalGuardado.style.display = 'none';
    };

    // --- Modal Guardado Cotización ---
    document.querySelector('button.save').addEventListener('click', () => {
        if (carrito.length === 0) {
            alert('Agrega productos antes de guardar la cotización.');
            return;
        }
        modalGuardado.style.display = 'block';
    });

    spanCloseGuardado.onclick = () => modalGuardado.style.display = 'none';
    btnRegistrarPedido.onclick = () => {
        alert('Redirigiendo a registrar pedido...');
        modalGuardado.style.display = 'none';
    };
    btnContinuarGuardado.onclick = () => {
        modalGuardado.style.display = 'none';
        carrito = [];
        renderCarrito();
    };
});
