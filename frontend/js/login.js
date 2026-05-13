// FUNCIÓN para usuarios con cuenta (staff o estudiante)
async function iniciarSesion() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    // Validación de campos vacíos
    if (!email || !password) {
        message.innerText = "😨 Por favor llena todos los campos";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirección según rol
            if (data.user.role === 'staff') {
                window.location.href = 'dashboard-staff.html';
            } else {
                window.location.href = 'dashboard-estudiante.html';
            }
        } else {
            message.innerText = "❌ " + data.message;
        }
    } catch (error) {
        message.innerText = "😩 Error de conexión con el servidor.";
    }
}

// FUNCIÓN para el botón de "Comprar sin iniciar sesión"
function entrarComoInvitado() {
    // Crear objeto usuario invitado
    const invitado = { 
        name: "Invitado", 
        role: "student", 
        isGuest: true 
    };
    // Guardar en localStorage
    localStorage.setItem('user', JSON.stringify(invitado));
    // Redirigir al dashboard de estudiante
    window.location.href = 'dashboard-estudiante.html';
}