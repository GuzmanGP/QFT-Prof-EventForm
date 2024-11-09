// metadataFields.js

// Importa la función showAlert desde utils.js para mostrar alertas cuando sea necesario
import { showAlert } from './utils.js';

// Función para actualizar la cantidad de campos de metadatos en un contenedor específico
export function updateMetadataFields(container, count) {
    // Si container es una cadena, la convierte en el elemento HTML correspondiente
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }

    // Si el conteo deseado excede 20, muestra una alerta y sale de la función
    if (count > 20) {
        showAlert('warning', 'Maximum 20 metadata fields allowed');
        return;
    }

    // Obtiene los campos de metadatos actuales dentro del contenedor
    const currentFields = container.querySelectorAll('.input-group');

    // Si el nuevo conteo es mayor que el número actual de campos, añade campos adicionales
    if (count > currentFields.length) {
        for (let i = currentFields.length; i < count; i++) {
            addMetadataField(container);
        }
    } else {
        // Si el nuevo conteo es menor, elimina campos hasta que el número sea igual al conteo deseado
        while (container.children.length > count) {
            container.removeChild(container.lastChild);
        }
    }
}

// Función para agregar un nuevo campo de metadatos en el contenedor especificado
export function addMetadataField(container) {
    // Crea un nuevo div para el campo de metadatos y establece su clase
    const field = document.createElement('div');
    field.className = 'input-group mb-2';

    // Establece el contenido HTML del nuevo campo, incluyendo entradas para clave, valor y un botón de eliminación
    field.innerHTML = `
        <input type="text" class="form-control metadata-key" placeholder="Key">
        <input type="text" class="form-control metadata-value" placeholder="Value">
        <button type="button" class="btn btn-outline-danger remove-field">×</button>
    `;

    // Agrega el campo al contenedor de metadatos
    container.appendChild(field);
}

// Función para configurar los botones de incremento y decremento en un contador de metadatos
export function setupCounterButtons(buttons, container, display) {
    // Itera sobre cada botón y agrega un evento de clic
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Obtiene el conteo actual desde el elemento display
            const currentCount = parseInt(display.textContent);

            // Determina el nuevo conteo sumando o restando 1 dependiendo del botón clicado
            const newCount = this.classList.contains('increase-count') 
                ? currentCount + 1 
                : Math.max(0, currentCount - 1); // Asegura que el conteo no sea negativo

            // Actualiza los campos de metadatos según el nuevo conteo y actualiza el display
            updateMetadataFields(container, newCount);
            display.textContent = newCount;
        });
    });
}

// Función para validar el contenedor de metadatos, evitando claves duplicadas y valores en blanco
export function validateMetadataContainer(container, errors) {
    // Crea un conjunto para almacenar claves únicas de metadatos
    const keys = new Set();

    // Itera sobre cada grupo de entrada dentro del contenedor de metadatos
    container.querySelectorAll('.input-group').forEach(group => {
        const keyInput = group.querySelector('.metadata-key');   // Entrada de clave de metadatos
        const valueInput = group.querySelector('.metadata-value'); // Entrada de valor de metadatos
        const key = keyInput.value.trim();   // Obtiene la clave eliminando espacios
        const value = valueInput.value.trim(); // Obtiene el valor eliminando espacios

        // Si hay una clave pero el valor está vacío, muestra un error
        if (key && !value) {
            showFieldError(valueInput, 'Value is required when key is provided');
            errors.push('Metadata value is required when key is provided');
        }

        // Si la clave ya existe en el conjunto, muestra un error por clave duplicada
        if (key && keys.has(key)) {
            showFieldError(keyInput, 'Duplicate key found');
            errors.push(`Duplicate metadata key "${key}"`);
        }

        // Agrega la clave al conjunto para asegurar unicidad
        keys.add(key);
    });
}
