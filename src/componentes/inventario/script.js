// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

let productsRef;

auth.onAuthStateChanged(user => {
    if (user) {
        userId = user.uid;
        productsRef = collection(db, `artifacts/${appId}/users/${userId}/productos`);
        loadProducts();
    }
});

const productForm = document.getElementById('productForm');
const productModal = new bootstrap.Modal(document.getElementById('productModal'));
const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
const geminiModal = new bootstrap.Modal(document.getElementById('geminiModal'));
const geminiContentLoader = document.getElementById('gemini-content-loader');
const geminiContent = document.getElementById('gemini-content');

// Cargar productos y escuchar cambios en tiempo real
function loadProducts() {
    if (!productsRef) return;
    onSnapshot(query(productsRef), (snapshot) => {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';
        snapshot.forEach((doc) => {
            const product = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.codigo}</td>
                <td>${product.nombre}</td>
                <td>${product.stock}</td>
                <td>${product.precio}</td>
                <td>${product.caducidad}</td>
                <td>
                    <button class="btn btn-info btn-sm me-2" onclick="showProductDetails('${product.nombre}', event)">✨ Detalles</button>
                    <button class="btn btn-warning btn-sm me-2" onclick="editProduct('${doc.id}', event)"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${doc.id}', event)"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            productList.appendChild(tr);
        });
    });
}

// Guardar o actualizar producto
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productId = document.getElementById('productId').value;
    const productData = {
        codigo: document.getElementById('codigo').value,
        nombre: document.getElementById('nombre').value,
        stock: parseInt(document.getElementById('stock').value),
        precio: parseFloat(document.getElementById('precio').value),
        caducidad: document.getElementById('caducidad').value
    };

    try {
        if (productId) {
            const productDocRef = doc(db, `artifacts/${appId}/users/${userId}/productos`, productId);
            await updateDoc(productDocRef, productData);
        } else {
            await addDoc(productsRef, productData);
        }
        productForm.reset();
        productModal.hide();
    } catch (error) {
        console.error("Error al guardar el producto:", error);
        document.getElementById('auth-status').innerHTML = `<div class="alert alert-danger alert-custom">Error al guardar: ${error.message}</div>`;
    }
});

// Llenar el modal para editar un producto
window.editProduct = (id) => {
    const productDocRef = doc(db, `artifacts/${appId}/users/${userId}/productos`, id);
    onSnapshot(productDocRef, (doc) => {
        if (doc.exists()) {
            const product = doc.data();
            document.getElementById('productId').value = doc.id;
            document.getElementById('codigo').value = product.codigo;
            document.getElementById('nombre').value = product.nombre;
            document.getElementById('stock').value = product.stock;
            document.getElementById('precio').value = product.precio;
            document.getElementById('caducidad').value = product.caducidad;
            document.getElementById('productModalLabel').innerText = 'Editar Producto';
            productModal.show();
        }
    });
};

// Mostrar modal de confirmación
function showConfirmationModal(message, onConfirm) {
    document.getElementById('confirmationMessage').innerText = message;
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener('click', onConfirm);
    confirmationModal.show();
}

// Eliminar un producto
window.deleteProduct = (id) => {
    showConfirmationModal('¿Estás seguro de que deseas eliminar este producto?', async () => {
        try {
            const productDocRef = doc(db, `artifacts/${appId}/users/${userId}/productos`, id);
            await deleteDoc(productDocRef);
            confirmationModal.hide();
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
            document.getElementById('auth-status').innerHTML = `<div class="alert alert-danger alert-custom">Error al eliminar: ${error.message}</div>`;
        }
    });
};

// Limpiar el formulario cuando el modal se cierra
document.getElementById('productModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalLabel').innerText = 'Añadir Producto';
});

// Lógica para el botón de "Detalles" con la API de Gemini
window.showProductDetails = async (productName) => {
    geminiContentLoader.style.display = 'block';
    geminiContent.style.display = 'none';
    document.getElementById('geminiModalLabel').innerText = `Detalles de: ${productName}`;
    geminiModal.show();

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=`;
    const prompt = `Proporciona un resumen de los ingredientes activos, el uso principal y las precauciones más importantes para el producto farmacéutico o suplemento: '${productName}'. Responde de forma concisa y profesional.`;
    
    const payload = {
        contents: [{
            parts: [{ text: prompt }]
        }],
    };

    let response;
    try {
        response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const generatedText = result.candidates[0].content.parts[0].text;
        
        geminiContentLoader.style.display = 'none';
        geminiContent.innerText = generatedText;
        geminiContent.style.display = 'block';

    } catch (error) {
        console.error("Error al llamar a la API de Gemini:", error);
        geminiContentLoader.style.display = 'none';
        geminiContent.innerText = 'Error al generar los detalles. Por favor, inténtalo de nuevo.';
        geminiContent.style.display = 'block';
    }
};