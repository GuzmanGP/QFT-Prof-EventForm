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
    field.className = 'input-group mb-2 animate__animated animate__fadeInRight';

    field.innerHTML = `
        <input type="text" class="form-control metadata-key" placeholder="Key">
        <input type="text" class="form-control metadata-value" placeholder="Value">
        <button type="button" class="btn btn-outline-danger remove-field">×</button>
    `;

    // Add click handler for remove button
    const removeButton = field.querySelector('.remove-field');
    removeButton.addEventListener('click', () => {
        const display = container.closest('.metadata-section').querySelector('.counter-display');
        const currentCount = parseInt(display.textContent);
        
        // Remove the field with animation
        field.classList.add('animate__fadeOutRight');
        setTimeout(() => {
            field.remove();
            // Update the counter
            display.textContent = (currentCount - 1).toString();
            display.classList.add('animate__animated', 'animate__pulse');
            setTimeout(() => display.classList.remove('animate__animated', 'animate__pulse'), 1000);
        }, 500);
    });

    container.appendChild(field);
}

export function setupCounterButtons(buttons, container, display) {
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const currentCount = parseInt(display.textContent);
            const isIncrease = button.classList.contains('increase-count');
            const newCount = isIncrease ? currentCount + 1 : Math.max(0, currentCount - 1);
            
            if (newCount <= 20) {
                display.textContent = newCount;
                if (isIncrease) {
                    addMetadataField(container);
                } else if (container.children.length > 0) {
                    const lastField = container.lastChild;
                    lastField.classList.add('animate__fadeOutRight');
                    setTimeout(() => container.removeChild(lastField), 500);
                }
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
