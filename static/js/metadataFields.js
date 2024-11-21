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
    // Add validation and debug logging
    if (!container || !display || !buttons || buttons.length === 0) {
        const error = 'Required counter elements not found';
        console.error(error, { container, display, buttons });
        throw new Error(error);
    }

    if (!container.id) {
        const error = 'Container must have an ID';
        console.error(error);
        throw new Error(error);
    }

    console.debug('Container children count:', container.children.length);
    console.log('Setting up counter for container:', container.id);

    // Log initial state
    console.log('Initial state:', {
        containerChildren: container.children.length,
        displayValue: display.textContent,
        buttonsCount: buttons.length
    });

    // Ensure counter display matches actual children count
    const actualCount = container.children.length;
    display.textContent = actualCount.toString();

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            try {
                const currentCount = parseInt(display.textContent);
                const actualChildren = container.children.length;
                console.debug('Current container children:', actualChildren);

                // Validate counter state
                if (currentCount !== actualChildren) {
                    console.warn('Counter state mismatch:', {
                        displayCount: currentCount,
                        actualChildren: actualChildren
                    });
                    display.textContent = actualChildren.toString();
                }

                const isIncrease = button.classList.contains('increase-count');
                console.log('Button clicked:', { 
                    isIncrease, 
                    currentCount,
                    containerId: container.id
                });

                if (isIncrease && currentCount < 20) {
                    addMetadataField(container);
                    const newCount = container.children.length;
                    display.textContent = newCount.toString();
                    console.debug('Field added:', { 
                        previousCount: currentCount,
                        newCount: newCount
                    });
                } else if (!isIncrease && currentCount > 0) {
                    removeLastField(container);
                    const newCount = container.children.length;
                    display.textContent = newCount.toString();
                    console.debug('Field removed:', {
                        previousCount: currentCount,
                        newCount: newCount
                    });
                } else if (isIncrease && currentCount >= 20) {
                    console.warn('Maximum field limit (20) reached');
                    showAlert('warning', 'Maximum number of fields reached (20)');
                }
            } catch (error) {
                console.error('Error handling counter button click:', error);
                showAlert('danger', 'Error updating metadata fields');
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
