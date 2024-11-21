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
            const lastChild = container.lastChild;
            if (lastChild && lastChild.parentNode === container) {
                container.removeChild(lastChild);
            }
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
    
    const removeButton = field.querySelector('.remove-field');
    removeButton.addEventListener('click', () => {
        const display = container.closest('.metadata-section').querySelector('.counter-display');
        const currentCount = parseInt(display.textContent);
        
        if (field.parentNode === container) {
            field.classList.add('animate__fadeOutRight');
            setTimeout(() => {
                if (field.parentNode === container) {
                    field.remove(); // Using remove() instead of removeChild
                    display.textContent = Math.max(0, currentCount - 1).toString();
                }
            }, 500);
        }
    });
    
    container.appendChild(field);
}

export function setupCounterButtons(buttons, container, display) {
    console.log('Setting up counter buttons:', { 
        buttonsCount: buttons?.length, 
        containerId: container?.id 
    });
    
    if (!buttons || !container || !display) {
        const error = 'Missing required elements for counter setup';
        console.error(error, { 
            hasButtons: !!buttons, 
            hasContainer: !!container, 
            hasDisplay: !!display 
        });
        throw new Error(error);
    }

    try {
        buttons.forEach((button, index) => {
            console.log(`Configuring button ${index + 1}`);
            button.addEventListener('click', () => {
                const currentCount = parseInt(display.textContent);
                const isIncrease = button.classList.contains('increase-count');
                
                console.log('Button clicked:', {
                    isIncrease,
                    currentCount,
                    containerChildren: container.children.length
                });
                
                if (isIncrease) {
                    if (currentCount >= 20) {
                        console.warn('Maximum field limit (20) reached');
                        showAlert('warning', 'Maximum number of fields reached (20)');
                        return;
                    }
                    console.log('Adding new metadata field');
                    addMetadataField(container);
                    display.textContent = (currentCount + 1).toString();
                } else if (currentCount > 0) {
                    console.log('Removing last metadata field');
                    const lastField = container.lastChild;
                    if (lastField) {
                        lastField.classList.add('animate__fadeOutRight');
                        setTimeout(() => {
                            lastField.remove();
                            display.textContent = (currentCount - 1).toString();
                            console.log('Field removed, new count:', currentCount - 1);
                        }, 300);
                    }
                }
            });
        });
        
        console.log('Counter buttons setup completed successfully');
    } catch (error) {
        console.error('Error in setupCounterButtons:', error);
        throw error;
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
