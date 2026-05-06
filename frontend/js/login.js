// FUNCIÓN : Para usuarios con cuenta ()
async function iniciarSesion() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

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
            
            // Redirección inteligente basada en el ROL que viene de la DB
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

// FUNCIÓN 2: Para el botón de "Seguir sin cuenta"

function entrarComoInvitado() {
    // 1. Creamos un objeto que simule ser un usuario de la base de datos
    const invitado = { 
        name: "Invitado", 
        role: "student", 
        isGuest: true 
    };

    // 2. Lo guardamos en el localStorage para que el Dashboard sepa quién entró
    localStorage.setItem('user', JSON.stringify(invitado));

    // 3. Redirigimos al archivo correspondiente
    window.location.href = 'dashboard-estudiante.html';
}

async function iniciarSesion() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));

            // REDIRECCIÓN AUTOMÁTICA 
            if (data.user.role === 'staff') {
                window.location.href = 'dashboard-staff.html';
            } else {
                window.location.href = 'dashboard-estudiante.html';
            }
        } else {
            document.getElementById('message').innerText = "❌ " + data.message;
        }
    } catch (error) {
        document.getElementById('message').innerText = "❌ Error de conexión.";
    }
}