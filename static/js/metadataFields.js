// metadataFields.js
import { showAlert } from './utils.js';
import { showFieldError, clearFieldError } from './validationUtils.js';

export function addMetadataField(container) {
    console.log('Adding new metadata field');
    const field = document.createElement('div');
    field.className = 'input-group mb-2 animate__animated animate__fadeInRight';
    field.innerHTML = `
        <input type="text" class="form-control metadata-key" placeholder="Key">
        <input type="text" class="form-control metadata-value" placeholder="Value">
        <button type="button" class="btn btn-outline-danger remove-field">×</button>
    `;
    
    // Add remove button handler
    const removeButton = field.querySelector('.remove-field');
    removeButton.addEventListener('click', () => {
        const display = container.closest('.metadata-section').querySelector('.counter-display');
        const currentCount = parseInt(display.textContent);
        
        field.classList.add('animate__fadeOutRight');
        setTimeout(() => {
            field.remove();
            display.textContent = (currentCount - 1).toString();
        }, 300);
    });
    
    container.appendChild(field);
}

function removeLastField(container) {
    console.log('Removing last metadata field');
    const lastField = container.lastChild;
    if (lastField) {
        lastField.classList.add('animate__fadeOutRight');
        setTimeout(() => lastField.remove(), 300);
    }
}

export function setupCounterButtons(buttons, container, display) {
    console.log('Setting up counter buttons:', { buttonsCount: buttons?.length, containerId: container?.id });
    
    if (!buttons || !container || !display) {
        const error = 'Missing required elements for counter setup';
        console.error(error, { hasButtons: !!buttons, hasContainer: !!container, hasDisplay: !!display });
        throw new Error(error);
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const currentCount = parseInt(display.textContent);
            const isIncrease = button.classList.contains('increase-count');
            
            console.log('Button clicked:', { isIncrease, currentCount });
            
            if (isIncrease && currentCount < 20) {
                addMetadataField(container);
                display.textContent = (currentCount + 1).toString();
            } else if (!isIncrease && currentCount > 0) {
                removeLastField(container);
                display.textContent = (currentCount - 1).toString();
            } else if (isIncrease && currentCount >= 20) {
                console.warn('Maximum field limit (20) reached');
                showAlert('warning', 'Maximum number of fields reached (20)');
            }
        });
    });
    
    console.log('Counter buttons setup completed successfully');
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
