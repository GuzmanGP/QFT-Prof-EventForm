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
    console.log('Configuring counter buttons:', buttons);
    if (!buttons || !container || !display) {
        console.error('Missing required elements for counter setup:', { 
            hasButtons: !!buttons, 
            hasContainer: !!container, 
            hasDisplay: !!display 
        });
        return;
    }

    try {
        // Remove existing listeners to prevent duplicates
        buttons.forEach(button => {
            console.log('Replacing button to prevent duplicate listeners:', button);
            button.replaceWith(button.cloneNode(true));
        });
        
        // Get fresh references
        const metadataSection = container.closest('.metadata-section');
        if (!metadataSection) {
            throw new Error('Metadata section not found');
        }
        
        const newButtons = metadataSection.querySelectorAll('.counter-button');
        console.log('Found new counter buttons:', newButtons.length);
        
        newButtons.forEach((button, index) => {
            console.log(`Setting up button ${index + 1} listener`);
            button.addEventListener('click', () => {
                const currentCount = parseInt(display.textContent);
                const isIncrease = button.classList.contains('increase-count');
                console.log('Counter click:', { 
                    currentCount, 
                    isIncrease, 
                    containerChildren: container.children.length 
                });
                
                const newCount = isIncrease ? currentCount + 1 : Math.max(0, currentCount - 1);
                
                if (newCount <= 20) {
                    if (isIncrease && container.children.length < newCount) {
                        console.log('Adding new metadata field');
                        addMetadataField(container);
                        display.textContent = newCount;
                    } else if (!isIncrease && container.children.length > 0) {
                        console.log('Removing last metadata field');
                        const lastField = container.lastChild;
                        if (lastField && lastField.parentNode === container) {
                            lastField.classList.add('animate__fadeOutRight');
                            setTimeout(() => {
                                if (lastField && lastField.parentNode === container) {
                                    lastField.remove();
                                    display.textContent = newCount;
                                    console.log('Field removed, new count:', newCount);
                                }
                            }, 500);
                        }
                    }
                } else {
                    console.warn('Maximum field limit (20) reached');
                }
            });
        });
        console.log('Counter buttons setup completed successfully');
    } catch (error) {
        console.error('Error setting up counter buttons:', error);
        throw error;
    }
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
