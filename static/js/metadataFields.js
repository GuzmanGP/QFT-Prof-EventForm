// metadataFields.js

import { showAlert } from './utils.js';
import { showFieldError, clearFieldError } from './validationUtils.js';

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
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const currentCount = parseInt(display.textContent);
            const isIncrease = button.classList.contains('increase-count');
            const newCount = isIncrease ? currentCount + 1 : Math.max(0, currentCount - 1);

            if (newCount <= 20) {
                updateMetadataFields(container, newCount);
                display.textContent = newCount;
            }
        });
    });
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
