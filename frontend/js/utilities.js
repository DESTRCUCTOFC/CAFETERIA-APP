
export function showAlert(texto, error = true) {
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