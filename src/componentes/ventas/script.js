// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, query, setLogLevel, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Variables globales para la configuración de Firebase
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, db, auth, userId;
let authReady = false;

// Inicializar Firebase
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    setLogLevel('debug');
} catch (error) {
    console.error("Error al inicializar Firebase:", error);
}

// Autenticación de usuario y estado
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
    } else {
        try {
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                await signInAnonymously(auth);
            }
        } catch (error) {
            console.error("Error al autenticar:", error);
            document.getElementById('auth-status').innerHTML = '<div class="alert alert-danger">Error de autenticación.</div>';
        }
    }
    authReady = true;
    document.getElementById('user-info').innerHTML = `<p class="text-muted">ID de usuario: ${userId}</p>`;
    document.getElementById('auth-status').innerHTML = '<div class="alert alert-success alert-custom">Autenticación exitosa.</div>';
});

let productsRef, salesRef;
let allProducts = [];
let cart = [];
const TAX_RATE = 0.16;

auth.onAuthStateChanged(user => {
    if (user) {
        userId = user.uid;
        productsRef = collection(db, `artifacts/${appId}/users/${userId}/productos`);
        salesRef = collection(db, `artifacts/${appId}/users/${userId}/ventas`);
        loadProductsForSearch();
    }
});

const productSearchInput = document.getElementById('product-search');
const cartItemsContainer = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const processSaleBtn = document.getElementById('process-sale-btn');
const saleConfirmationModal = new bootstrap.Modal(document.getElementById('saleConfirmationModal'));

// Cargar todos los productos para la función de búsqueda
async function loadProductsForSearch() {
    if (!productsRef) return;
    try {
        const querySnapshot = await getDocs(query(productsRef));
        allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al cargar productos para la búsqueda:", error);
    }
}

// Lógica de búsqueda de productos
productSearchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const results = allProducts.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm) || p.codigo.toLowerCase().includes(searchTerm)
    );
    // Renderizar resultados de búsqueda
    // Esta es una implementación simple, se puede mejorar con un dropdown
    console.log(results);
    // Para simplificar, simplemente mostraremos los resultados en la consola por ahora.
    // La idea es que el usuario haga clic en un resultado para añadirlo al carrito.
});

// Añadir producto al carrito
function addProductToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    renderCart();
}

// Eliminar producto del carrito
window.removeProductFromCart = (productId) => {
    cart = cart.filter(item => item.id !== productId);
    renderCart();
};

// Renderizar el carrito de compras en la tabla
function renderCart() {
    cartItemsContainer.innerHTML = '';
    let currentSubtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<tr><td colspan="5" class="text-center text-muted">El carrito está vacío.</td></tr>';
        processSaleBtn.disabled = true;
    } else {
        processSaleBtn.disabled = false;
        cart.forEach(item => {
            const itemSubtotal = item.precio * item.quantity;
            currentSubtotal += itemSubtotal;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.nombre}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" class="form-control" style="width: 80px;" onchange="updateQuantity('${item.id}', this.value)">
                </td>
                <td>${item.precio.toFixed(2)}</td>
                <td>${itemSubtotal.toFixed(2)}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeProductFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></button></td>
            `;
            cartItemsContainer.appendChild(tr);
        });
    }

    const taxAmount = currentSubtotal * TAX_RATE;
    const totalAmount = currentSubtotal + taxAmount;

    subtotalEl.innerText = currentSubtotal.toFixed(2);
    taxEl.innerText = taxAmount.toFixed(2);
    totalEl.innerText = totalAmount.toFixed(2);
}

// Actualizar cantidad de un producto en el carrito
window.updateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = parseInt(newQuantity, 10);
    }
    renderCart();
};

// Lógica de búsqueda simplificada
productSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = e.target.value.toLowerCase();
        const foundProduct = allProducts.find(p => p.codigo.toLowerCase() === searchTerm || p.nombre.toLowerCase() === searchTerm);
        if (foundProduct) {
            addProductToCart(foundProduct);
            e.target.value = '';
        } else {
            console.warn("Producto no encontrado.");
            // Aquí podrías mostrar una notificación al usuario
        }
    }
});

// Procesar la venta
processSaleBtn.addEventListener('click', async () => {
    if (cart.length === 0) return;

    try {
        // 1. Guardar la venta en la colección 'ventas'
        const saleData = {
            date: new Date(),
            items: cart.map(item => ({
                productId: item.id,
                name: item.nombre,
                quantity: item.quantity,
                unitPrice: item.precio
            })),
            subtotal: parseFloat(subtotalEl.innerText),
            tax: parseFloat(taxEl.innerText),
            total: parseFloat(totalEl.innerText)
        };
        await addDoc(salesRef, saleData);

        // 2. Actualizar el stock en la colección 'productos'
        for (const item of cart) {
            const productDocRef = doc(db, `artifacts/${appId}/users/${userId}/productos`, item.id);
            const newStock = item.stock - item.quantity;
            await updateDoc(productDocRef, {
                stock: newStock
            });
        }
        
        // 3. Limpiar el carrito y mostrar confirmación
        cart = [];
        renderCart();
        saleConfirmationModal.show();
    } catch (error) {
        console.error("Error al procesar la venta:", error);
        // Aquí se podría mostrar una alerta de error al usuario
    }
});

// Iniciar la UI con un carrito vacío
renderCart();