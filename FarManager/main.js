const components = {
  inventario: {
    html: '/src/componentes/inventario/inventario.html',
    css: '/src/componentes/inventario/styles.css',
    js: '/src/componentes/inventario/script.js'
  },
  ventas: {
    html: '/src/componentes/ventas/ventas.html',
    css: '/src/componentes/ventas/styles.css',
    js: '/src/componentes/ventas/script.js'
  },
  cuentas: {
    html: '/src/componentes/cuentas/cuentas.html',
    css: '/src/componentes/cuentas/styles.css',
    js: '/src/componentes/cuentas/script.js'
  },
  usuarios: {
    html: '/src/componentes/usuarios/usuarios.html',
    css: '/src/componentes/usuarios/styles.css',
    js: '/src/componentes/usuarios/script.js'
  }
};

// Función para cargar un componente dinámicamente
async function loadComponent(componentName) {
  const component = components[componentName];
  if (!component) {
    console.error(`Componente no encontrado: ${componentName}`);
    return;
  }

  try {
    // Limpiar estilos y scripts previos
    document.querySelectorAll('link[data-component]').forEach(link => link.remove());
    document.querySelectorAll('script[data-component]').forEach(script => script.remove());

    // Cargar HTML
    const htmlResponse = await fetch(component.html);
    const htmlContent = await htmlResponse.text();
    document.getElementById('content').innerHTML = htmlContent;

    // Cargar CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = component.css;
    cssLink.setAttribute('data-component', componentName);
    document.head.appendChild(cssLink);

    // Cargar JS
    const jsScript = document.createElement('script');
    jsScript.type = 'module';
    jsScript.src = component.js;
    jsScript.setAttribute('data-component', componentName);
    document.body.appendChild(jsScript);

    console.log(`Componente ${componentName} cargado correctamente.`);
  } catch (error) {
    console.error(`Error al cargar el componente ${componentName}:`, error);
  }
}

// Función para mostrar el formulario de login
function showLogin() {
  document.getElementById('content').innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="height: 80vh;">
      <div class="card shadow-lg p-4" style="width: 25rem;">
        <div class="card-body">
          <h3 class="card-title text-center mb-4">Iniciar Sesión</h3>
          <form id="loginForm">
            <div class="mb-3">
              <label for="username" class="form-label">Usuario</label>
              <input type="text" class="form-control" id="username" required>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Contraseña</label>
              <input type="password" class="form-control" id="password" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Acceder</button>
          </form>
          <div id="loginMessage" class="mt-3 text-center text-danger d-none">Usuario o contraseña incorrectos.</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

// Lógica de autenticación
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Credenciales de ejemplo para el administrador
  const adminUser = { username: 'junior', password: '0719', role: 'administrador' };

  if (username === adminUser.username && password === adminUser.password) {
    // Almacenar el rol del usuario (aquí se podría usar localStorage o una variable global)
    window.currentUserRole = adminUser.role;
    // Cargar la página principal con los botones
    showMainPage();
  } else {
    document.getElementById('loginMessage').classList.remove('d-none');
  }
}

// Función para mostrar la página principal con los botones
function showMainPage() {
  const isAdministrator = window.currentUserRole === 'administrador';
  
  let userManagementButton = '';
  if (isAdministrator) {
    userManagementButton = `
      <div class="card text-center mb-3 shadow-lg" style="width: 18rem;">
          <div class="card-body">
              <i class="fas fa-users-cog fa-4x text-info mb-3"></i>
              <h5 class="card-title">Gestión de Usuarios</h5>
              <p class="card-text">Administra roles y cuentas de usuarios.</p>
              <button class="btn btn-info btn-block" data-component="usuarios">Ir a Usuarios</button>
          </div>
      </div>
    `;
  }
  
  document.getElementById('content').innerHTML = `
    <div class="d-flex justify-content-around flex-wrap">
        <div class="card text-center mb-3 shadow-lg" style="width: 18rem;">
            <div class="card-body">
                <i class="fas fa-box-open fa-4x text-primary mb-3"></i>
                <h5 class="card-title">Inventario</h5>
                <p class="card-text">Gestiona los productos farmacéuticos.</p>
                <button class="btn btn-primary btn-block" data-component="inventario">Ir a Inventario</button>
            </div>
        </div>
        <div class="card text-center mb-3 shadow-lg" style="width: 18rem;">
            <div class="card-body">
                <i class="fas fa-cash-register fa-4x text-success mb-3"></i>
                <h5 class="card-title">Ventas</h5>
                <p class="card-text">Procesa ventas y genera facturas.</p>
                <button class="btn btn-success btn-block" data-component="ventas">Ir a Ventas</button>
            </div>
        </div>
        <div class="card text-center mb-3 shadow-lg" style="width: 18rem;">
            <div class="card-body">
                <i class="fas fa-file-invoice-dollar fa-4x text-warning mb-3"></i>
                <h5 class="card-title">Cuentas por Cobrar</h5>
                <p class="card-text">Administra las deudas de los clientes.</p>
                <button class="btn btn-warning btn-block" data-component="cuentas">Ir a Cuentas</button>
            </div>
        </div>
        ${userManagementButton}
    </div>
  `;
}

// Escuchar clics en los botones de navegación de la página principal
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-component]');
  if (button) {
    event.preventDefault();
    const componentName = button.getAttribute('data-component');
    loadComponent(componentName);
  }
});

// Cargar la vista de login al iniciar la aplicación
document.addEventListener('DOMContentLoaded', showLogin);