// metadataFields.js
import { showAlert } from './utils.js';
import { showFieldError, clearFieldError } from './validationUtils.js';

const MAX_FIELDS = 20;

export function updateCounterDisplay(containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container not found: ${containerId}`);
            return;
        }

        const count = container.querySelectorAll('.input-group').length;
        const countDisplay = document.getElementById(`${containerId}Count`);
        const increaseButton = document.querySelector(`.increase-count[data-target="${containerId}"]`);
        
        if (countDisplay) {
            countDisplay.textContent = count.toString();
        }
        
        // Disable/enable increase button based on count
        if (increaseButton) {
            increaseButton.disabled = count >= MAX_FIELDS;
            if (count >= MAX_FIELDS) {
                increaseButton.classList.add('disabled');
            } else {
                increaseButton.classList.remove('disabled');
            }
        }

        // Update hidden input
        const hiddenInput = document.getElementById(`${containerId}Input`);
        if (hiddenInput) {
            const metadata = {};
            container.querySelectorAll('.input-group').forEach(group => {
                const key = group.querySelector('.metadata-key')?.value?.trim();
                const value = group.querySelector('.metadata-value')?.value?.trim();
                if (key && value) {
                    metadata[key] = value;
                }
            });
            hiddenInput.value = JSON.stringify(metadata);
        }
    } catch (error) {
        console.error('Error updating counter display:', error);
        showAlert('danger', 'Error updating metadata counter');
    }
}

export function addMetadataField(container) {
    console.group('Adding Metadata Field');
    
    try {
        if (!container?.id) {
            throw new Error('Invalid container for metadata field');
        }

        const currentCount = container.querySelectorAll('.input-group').length;
        if (currentCount >= MAX_FIELDS) {
            showAlert('warning', `Maximum number of fields (${MAX_FIELDS}) reached`);
            console.groupEnd();
            return;
        }

        console.log('Adding to container:', container.id);
        
        const field = document.createElement('div');
        field.className = 'input-group mb-2';
        field.classList.add('animate__animated', 'animate__fadeInRight');
        
        field.innerHTML = `
            <input type="text" class="form-control metadata-key" placeholder="Key" required>
            <input type="text" class="form-control metadata-value" placeholder="Value" required>
            <button type="button" class="btn btn-outline-danger remove-field">×</button>
            <div class="invalid-feedback"></div>
        `;

        // Add validation handlers with improved error handling
        const keyInput = field.querySelector('.metadata-key');
        const valueInput = field.querySelector('.metadata-value');
        
        const validateField = (input, otherInput) => {
            const value = input.value.trim();
            const otherValue = otherInput.value.trim();
            
            clearFieldError(input);
            
            if (!value && otherValue) {
                showFieldError(input, `${input.classList.contains('metadata-key') ? 'Key' : 'Value'} is required`);
                return false;
            }
            
            if (input.classList.contains('metadata-key')) {
                const existingKeys = Array.from(container.querySelectorAll('.metadata-key'))
                    .filter(k => k !== input)
                    .map(k => k.value.trim());
                
                if (existingKeys.includes(value)) {
                    showFieldError(input, 'Duplicate key');
                    return false;
                }
            }
            
            return true;
        };

        [keyInput, valueInput].forEach(input => {
            const otherInput = input.classList.contains('metadata-key') ? valueInput : keyInput;
            
            input.addEventListener('input', () => {
                validateField(input, otherInput);
                updateCounterDisplay(container.id);
            });
            
            input.addEventListener('blur', () => {
                validateField(input, otherInput);
                updateCounterDisplay(container.id);
            });
        });
    
    // Add remove button handler
    const removeButton = field.querySelector('.remove-field');
    removeButton.addEventListener('click', () => {
        field.classList.add('animate__fadeOutRight');
        setTimeout(() => {
            field.remove();
            updateCounterDisplay(container.id);
        }, 300);
    });
    
    container.appendChild(field);
    updateCounterDisplay(container.id);
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
    console.group('Setting up Counter Buttons');
    console.log('Initializing for container:', container?.id);

    // Enhanced validation for required elements
    if (!container?.id || !display || !buttons?.length) {
        const error = new Error('Invalid counter setup parameters');
        console.error('Setup failed:', {
            container: container?.id || 'Missing',
            display: display?.id || 'Missing',
            buttons: buttons?.length || 0
        });
        console.groupEnd();
        showAlert('danger', 'Failed to setup metadata counter buttons');
        throw error;
    }

    // Sync initial state
    try {
        updateCounterDisplay(container.id);
    } catch (error) {
        console.error('Error syncing initial state:', error);
        showAlert('warning', 'Error synchronizing metadata counter');
    }

    // Validate container state
    console.log('Initial state:', {
        containerChildren: container.children.length,
        displayValue: display.textContent,
        buttonsCount: buttons.length
    });

    // Initial counter synchronization
    updateCounterDisplay(container.id);

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            try {
                const currentCount = parseInt(display.textContent);
                const actualChildren = container.children.length;

                // Validate counter state
                if (currentCount !== actualChildren) {
                    console.warn('Counter state mismatch, synchronizing...');
                    updateCounterDisplay(container.id);
                }

                const isIncrease = button.classList.contains('increase-count');
                console.log('Button clicked:', { 
                    isIncrease, 
                    currentCount,
                    containerId: container.id
                });

                if (isIncrease && currentCount < 20) {
                    addMetadataField(container);
                } else if (!isIncrease && currentCount > 0) {
                    removeLastField(container);
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

    // Add mutation observer for DOM changes
    const observer = new MutationObserver(() => {
        updateCounterDisplay(container.id);
    });

    observer.observe(container, { childList: true, subtree: true });
    console.log('Counter buttons and observer setup completed successfully');
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
