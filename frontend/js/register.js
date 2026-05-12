const form = document.getElementById("registerForm");
const btnRegistro = document.getElementById("registerBtn");

function showAlert(texto, error = true) {
    const message = document.getElementById("message");
    if (!message) return;
    message.style.padding = "10px";
    message.style.borderRadius = "12px";
    message.style.fontWeight = "bold";
    message.style.textAlign = "center";
    message.style.marginTop = "15px";
    message.style.display = "block";
    if (error) {
        message.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        message.style.color = "white";
        message.innerText = texto;
    } else {
        // Estilo para éxito (verde translúcido o sólido)
        message.style.backgroundColor = "rgba(40, 167, 69, 0.2)";
        message.style.color = "#155724";
        message.innerText = texto;
    }
}

form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !email || !password || !confirmPassword) {
        showAlert("Todos los campos son obligatorios");
        return;
    }
    if (password !== confirmPassword) {
        showAlert("Las contraseñas deben ser iguales");
        return;
    }
    if (password.length < 6) {
        showAlert("La contraseña debe ser de al menos 6 caracteres");
        return;
    }

    try {
        btnRegistro.disabled = true;
        btnRegistro.innerText = "Cargando...";

        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            showAlert("Registro exitoso Redirigiendo al login", false);
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            showAlert(data?.message || "En respuesta del servidor");
            btnRegistro.disabled = false;
            btnRegistro.innerHTML =
                '<i class="bi bi-person-check me-2"></i> Crear cuenta';
        }
    } catch (error) {
        btnRegistro.disabled = false;
        btnRegistro.innerHTML =
            '<i class="bi bi-person-check me-2"></i> Crear cuenta';
        showAlert("Error de conexión");
    }
});
