// Archivo de lógica para el componente de Gestión de Usuarios

import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Inicializar Firestore y Auth
const firebaseConfig = JSON.parse(__firebase_config);
const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Referencias a elementos del DOM
const userForm = document.getElementById('userForm');
const usersTableBody = document.getElementById('usersTableBody');
const errorMessage = document.getElementById('errorMessage');

// Escuchar el envío del formulario
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = userForm.username.value;
    const password = userForm.password.value;
    const role = userForm.role.value;
    
    // Validar que no haya campos vacíos
    if (!username || !password || !role) {
        showError('Todos los campos son obligatorios.');
        return;
    }

    // Usar el nombre de usuario como parte del email para Firebase Auth
    const email = `${username}@${appId}.com`;
    
    try {
        // Crear el usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Agregar los datos del usuario a la colección de Firestore
        await addDoc(collection(db, "users"), {
            uid: user.uid,
            username: username,
            role: role
        });

        // Limpiar el formulario
        userForm.reset();
        
        // Recargar la tabla de usuarios
        loadUsers();

        showMessage('Usuario creado con éxito.', 'success');
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            showError('El nombre de usuario ya está en uso.');
        } else {
            console.error("Error creating user: ", error);
            showError('Hubo un error al crear el usuario. Inténtalo de nuevo.');
        }
    }
});

// Función para cargar usuarios desde Firestore y mostrarlos en la tabla
const loadUsers = async () => {
    usersTableBody.innerHTML = '';
    const usersCol = collection(db, "users");
    const userSnapshot = await getDocs(usersCol);
    
    if (userSnapshot.empty) {
        usersTableBody.innerHTML = '<tr><td colspan="3" class="text-center">No hay usuarios registrados.</td></tr>';
        return;
    }

    userSnapshot.forEach(doc => {
        const user = doc.data();
        const row = usersTableBody.insertRow();
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn btn-sm btn-danger delete-btn" data-id="${doc.id}" data-uid="${user.uid}">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>
            </td>
        `;
    });
};

// Escuchar clics en los botones de la tabla
usersTableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn') || e.target.parentElement.classList.contains('delete-btn')) {
        const btn = e.target.closest('.delete-btn');
        const docId = btn.dataset.id;
        const uid = btn.dataset.uid;
        
        const confirmDelete = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirmDelete.isConfirmed) {
            try {
                // Eliminar el documento de Firestore
                await deleteDoc(doc(db, "users", docId));
                
                // La eliminación del usuario en Auth no es trivial y requiere una llamada al servidor.
                // Por ahora, solo eliminamos el registro en Firestore para simplificar el ejemplo.
                // En un entorno de producción, esta operación debería ser gestionada en el backend.

                // Recargar la tabla de usuarios
                loadUsers();

                showMessage('Usuario eliminado con éxito.', 'success');

            } catch (error) {
                console.error("Error removing document: ", error);
                showError('Hubo un error al eliminar el usuario.');
            }
        }
    }
});

// Funciones de utilidad para mensajes
const showMessage = (message, type) => {
    Swal.fire({
        title: type === 'success' ? 'Éxito' : 'Error',
        text: message,
        icon: type,
        confirmButtonText: 'OK'
    });
};

const showError = (message) => {
    showMessage(message, 'error');
};

// Cargar los usuarios al cargar el componente
loadUsers();
