// metadataFields.js

import { showAlert } from './utils.js';

// Function to show field-specific error
function showFieldError(inputElement, errorMessage) {
    inputElement.classList.add('is-invalid');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = errorMessage;
    inputElement.parentNode.appendChild(errorDiv);
}

export function updateMetadataFields(container, count) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }

    if (count > 20) {
        showAlert('warning', 'Maximum 20 metadata fields allowed');
        return;
    }

    const currentFields = container.querySelectorAll('.input-group');

    if (count > currentFields.length) {
        for (let i = currentFields.length; i < count; i++) {
            addMetadataField(container);
        }
    } else {
        while (container.children.length > count) {
            container.removeChild(container.lastChild);
        }
    }
}

export function addMetadataField(container) {
    const field = document.createElement('div');
    field.className = 'input-group mb-2';

    field.innerHTML = `
        <input type="text" class="form-control metadata-key" placeholder="Key">
        <input type="text" class="form-control metadata-value" placeholder="Value">
        <button type="button" class="btn btn-outline-danger remove-field">×</button>
    `;

    container.appendChild(field);
}

export function setupCounterButtons(buttons, container, display) {
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.addEventListener('click', function() {
            const currentCount = parseInt(display.textContent);
            const newCount = this.classList.contains('increase-count') 
                ? currentCount + 1 
                : Math.max(0, currentCount - 1);

            updateMetadataFields(container, newCount);
            display.textContent = newCount;
        });
    }
}

export function validateMetadataContainer(container, errors) {
    const keys = new Set();
    const groups = container.querySelectorAll('.input-group');
    
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const keyInput = group.querySelector('.metadata-key');
        const valueInput = group.querySelector('.metadata-value');
        const key = keyInput.value.trim();
        const value = valueInput.value.trim();
        
        if (key && !value) {
            showFieldError(valueInput, 'Value is required when key is provided');
            errors.push('Metadata value is required when key is provided');
        }
        
        if (key && keys.has(key)) {
            showFieldError(keyInput, 'Duplicate key found');
            errors.push(`Duplicate metadata key "${key}"`);
        }
        keys.add(key);
    }
}