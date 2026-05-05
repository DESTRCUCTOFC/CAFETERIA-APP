async function registrarEstudiante() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    if (!name || !email || !password) {
        message.innerText = "❌ Todos los campos son obligatorios";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            message.style.color = "green";
            message.innerText = "✅ Registro exitoso. Redirigiendo al login...";
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            message.innerText = "❌ " + data.message;
        }
    } catch (error) {
        message.innerText = "❌ Error de conexión.";
    }
}