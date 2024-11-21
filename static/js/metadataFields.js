// metadataFields.js
import { showAlert } from './utils.js';
import { showFieldError, clearFieldError } from './validationUtils.js';
export function updateCounterDisplay(containerId) {
    const count = document.querySelectorAll(`#${containerId} .input-group`).length;
    const countDisplay = document.getElementById(`${containerId}Count`);
    if (countDisplay) {
        countDisplay.textContent = count.toString();
    }
}

export function addMetadataField(container) {
    console.group('Adding Metadata Field');
    
    try {
        if (!container?.id) {
            throw new Error('Invalid container for metadata field');
        }

        console.log('Adding to container:', container.id);
        
        const field = document.createElement('div');
        field.className = 'input-group mb-2';
        field.classList.add('animate__animated', 'animate__fadeInRight');
        
        field.innerHTML = `
            <input type="text" class="form-control metadata-key" placeholder="Key" required>
            <input type="text" class="form-control metadata-value" placeholder="Value" required>
            <button type="button" class="btn btn-outline-danger remove-field">×</button>
        `;

        // Add validation handlers
        const keyInput = field.querySelector('.metadata-key');
        const valueInput = field.querySelector('.metadata-value');
        
        [keyInput, valueInput].forEach(input => {
            input.addEventListener('input', () => validateMetadataField(field));
            input.addEventListener('blur', () => validateMetadataField(field));
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
        throw error;
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
