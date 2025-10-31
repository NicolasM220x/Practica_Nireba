     // Elementos HTML
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginBtn = document.getElementById('loginBtn');
        const loginResult = document.getElementById('loginResult');
        const checkTokenBtn = document.getElementById('checkTokenBtn');
        const showTokenBtn = document.getElementById('showTokenBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const tokenResult = document.getElementById('tokenResult');

        // Función para simular login
        async function login(email, password) {
            try {
                // Buscar usuario en el servidor
                const response = await fetch(`http://localhost:3001/users?email=${email}`);
                const users = await response.json();
                
                if (users.length === 0) {
                    return { success: false, message: 'Usuario no encontrado' };
                }
                
                const user = users[0];
                
                // Verificar contraseña
                if (user.password !== password) {
                    return { success: false, message: 'Contraseña incorrecta' };
                }
                
                // Crear token simple
                const token = crearToken(user);
                return { success: true, token, user };
                
            } catch (error) {
                return { success: false, message: 'Error del servidor' };
            }
        }

        // Función para crear token simple
        function crearToken(user) {
            const datos = {
                userId: user.id,
                email: user.email,
                nombre: user.name,
                expira: Date.now() + 86400000 // 24 horas
            };
            
            // Convertir a string y codificar en base64
            return btoa(JSON.stringify(datos));
        }

        // Guardar token en el navegador
        function guardarToken(token) {
            localStorage.setItem('token', token);
        }

        // Verificar si hay token válido
        function tieneTokenValido() {
            const token = localStorage.getItem('token');
            if (!token) return false;
            
            try {
                const datos = JSON.parse(atob(token));
                return datos.expira > Date.now();
            } catch {
                return false;
            }
        }

        // Obtener datos del usuario del token
        function obtenerUsuario() {
            const token = localStorage.getItem('token');
            if (!token) return null;
            
            try {
                return JSON.parse(atob(token));
            } catch {
                return null;
            }
        }

        // Cerrar sesión
        function cerrarSesion() {
            localStorage.removeItem('token');
            mostrarMensaje(tokenResult, 'Sesión cerrada', 'success');
        }

        // Mostrar mensajes
        function mostrarMensaje(elemento, mensaje, tipo) {
            elemento.textContent = mensaje;
            elemento.className = `result ${tipo}`;
            elemento.style.display = 'block';
        }

        // Eventos de los botones
        loginBtn.addEventListener('click', async () => {
            const email = emailInput.value;
            const password = passwordInput.value;
            
            if (!email || !password) {
                mostrarMensaje(loginResult, 'Completa todos los campos', 'error');
                return;
            }
            
            const resultado = await login(email, password);
            
            if (resultado.success) {
                guardarToken(resultado.token);
                mostrarMensaje(loginResult, `¡Bienvenido ${resultado.user.name}!`, 'success');
            } else {
                mostrarMensaje(loginResult, resultado.message, 'error');
            }
        });

        checkTokenBtn.addEventListener('click', () => {
            if (tieneTokenValido()) {
                const usuario = obtenerUsuario();
                mostrarMensaje(tokenResult, `Token válido - Usuario: ${usuario.nombre}`, 'success');
            } else {
                mostrarMensaje(tokenResult, 'No hay sesión activa', 'error');
            }
        });

        showTokenBtn.addEventListener('click', () => {
            const token = localStorage.getItem('token');
            if (token) {
                tokenResult.innerHTML = `
                    <strong>Token:</strong><br>
                    <div style="background:#f8f9fa; padding:10px; border-radius:5px; font-family:monospace; word-break:break-all;">
                        ${token}
                    </div>
                `;
                tokenResult.className = 'result success';
                tokenResult.style.display = 'block';
            } else {
                mostrarMensaje(tokenResult, 'No hay token guardado', 'error');
            }
        });

        logoutBtn.addEventListener('click', cerrarSesion);