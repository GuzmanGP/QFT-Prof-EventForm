// utils.js

// Función para mostrar alertas en la interfaz
export function showAlert(type, message) {
    // Obtiene el contenedor de alertas donde se insertará la alerta
    const alertContainer = document.querySelector('.alert-container');

    // Crea un nuevo elemento div para la alerta
    const alert = document.createElement('div');
    
    // Verifica si ya existe una alerta del mismo tipo y con el mismo mensaje para evitar duplicados
    const existingAlert = Array.from(alertContainer.children).find(alert => 
        alert.classList.contains(`alert-${type}`) && alert.textContent.includes(message)
    );

    // Si una alerta similar ya existe, sale de la función para no crear duplicados
    if (existingAlert) return;

    // Asigna la clase de tipo de alerta (success, warning, danger, etc.)
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message} <!-- Muestra el mensaje de alerta -->
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Añade la alerta al contenedor de alertas en la interfaz
    alertContainer.appendChild(alert);
    // Configura un temporizador para eliminar automáticamente la alerta después de 5 segundos
    setTimeout(() => alert.remove(), 5000);
}

// Función para actualizar el conteo de preguntas basado en el número de tarjetas de preguntas
export function updateQuestionCount() {
    const count = document.querySelectorAll('.question-card').length;
    const countDisplay = document.getElementById('questionCount');
    if (countDisplay) {
        countDisplay.textContent = count;
    }
    return count;
}

// Función para limpiar errores de campos de formulario
export function clearFieldError(field) {
    if (field.classList.contains('is-invalid')) {
        field.classList.remove('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }
}