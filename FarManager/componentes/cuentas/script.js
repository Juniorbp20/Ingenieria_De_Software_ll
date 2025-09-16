// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, query, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

let accountsRef;
auth.onAuthStateChanged(user => {
    if (user) {
        userId = user.uid;
        accountsRef = collection(db, `artifacts/${appId}/users/${userId}/cuentas_por_cobrar`);
        loadAccounts();
    }
});

const accountForm = document.getElementById('accountForm');
const accountModal = new bootstrap.Modal(document.getElementById('accountModal'));
const paymentForm = document.getElementById('paymentForm');
const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));

// Cargar cuentas y escuchar cambios en tiempo real
function loadAccounts() {
    if (!accountsRef) return;
    onSnapshot(query(accountsRef), (snapshot) => {
        const accountsList = document.getElementById('accounts-list');
        accountsList.innerHTML = '';
        snapshot.forEach((doc) => {
            const account = doc.data();
            const tr = document.createElement('tr');
            const estado = account.saldoPendiente <= 0 ? '<span class="badge bg-success">Pagada</span>' : '<span class="badge bg-danger">Pendiente</span>';
            tr.innerHTML = `
                <td>${account.clientName}</td>
                <td>${account.totalAmount.toFixed(2)}</td>
                <td>${(account.totalAmount - account.saldoPendiente).toFixed(2)}</td>
                <td>${account.saldoPendiente.toFixed(2)}</td>
                <td>${estado}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-2" onclick="recordPayment('${doc.id}', '${account.clientName}', ${account.saldoPendiente}, event)"><i class="fas fa-money-bill-wave"></i> Pagar</button>
                </td>
            `;
            accountsList.appendChild(tr);
        });
    });
}

// Guardar nueva cuenta
accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const accountData = {
        clientName: document.getElementById('clientName').value,
        totalAmount: parseFloat(document.getElementById('totalAmount').value),
        saldoPendiente: parseFloat(document.getElementById('totalAmount').value)
    };

    try {
        await addDoc(accountsRef, accountData);
        accountForm.reset();
        accountModal.hide();
    } catch (error) {
        console.error("Error al guardar la cuenta:", error);
        document.getElementById('auth-status').innerHTML = `<div class="alert alert-danger alert-custom">Error al guardar: ${error.message}</div>`;
    }
});

// Llenar el modal de pago
window.recordPayment = (id, clientName, saldoPendiente) => {
    document.getElementById('paymentAccountId').value = id;
    document.getElementById('paymentClientName').innerText = clientName;
    document.getElementById('paymentPendingBalance').innerText = saldoPendiente.toFixed(2);
    document.getElementById('paymentAmount').max = saldoPendiente;
    paymentModal.show();
};

// Registrar un pago
paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const accountId = document.getElementById('paymentAccountId').value;
    const paymentAmount = parseFloat(document.getElementById('paymentAmount').value);
    const accountDocRef = doc(db, `artifacts/${appId}/users/${userId}/cuentas_por_cobrar`, accountId);
    
    try {
        const accountDoc = await getDoc(accountDocRef);
        if (accountDoc.exists()) {
            const currentSaldo = accountDoc.data().saldoPendiente;
            const newSaldo = currentSaldo - paymentAmount;
            
            await updateDoc(accountDocRef, {
                saldoPendiente: Math.max(0, newSaldo)
            });
            
            paymentForm.reset();
            paymentModal.hide();
        }
    } catch (error) {
        console.error("Error al registrar el pago:", error);
        document.getElementById('auth-status').innerHTML = `<div class="alert alert-danger alert-custom">Error al registrar pago: ${error.message}</div>`;
    }
});

// Limpiar el formulario cuando el modal se cierra
document.getElementById('accountModal').addEventListener('hidden.bs.modal', function () {
    accountForm.reset();
});

document.getElementById('paymentModal').addEventListener('hidden.bs.modal', function () {
    paymentForm.reset();
});
