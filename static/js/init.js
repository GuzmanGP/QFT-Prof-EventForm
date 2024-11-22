// init.js
import { validateForm } from './validation.js';
import { setupCounterButtons } from './metadataFields.js';
import { 
    showAlert, 
    toggleLoadingOverlay,
    setMetadataFields,
    showErrorState,
    loadForm 
} from './utils.js';

export async function initializeForm() {
    console.log('Initializing Form...');
    const form = document.getElementById('formConfiguration');
    const eventDatesContainer = document.getElementById('eventDates');
    const addDateButton = document.getElementById('addEventDate');

    if (!form || !eventDatesContainer || !addDateButton) {
        throw new Error('Required form elements not found');
    }

    // Initialize event dates
    console.log('Initializing Event Dates...');
    initializeEventDates();

    try {
        // Load initial form data if available
        if (window.initialFormData) {
            console.debug('Initial form data found:', window.initialFormData);
            await loadForm(window.initialFormData);
        } else {
            console.debug('Initializing new event form');
            console.log('Setting up event dates section...');
            const eventDatesSection = document.querySelector('#eventDates').parentElement;
            const eventDatesButtons = eventDatesSection.querySelectorAll('.counter-button');
            const eventDatesDisplay = eventDatesSection.querySelector('.counter-display');

            if (eventDatesSection && eventDatesButtons && eventDatesDisplay) {
                console.log('Found event dates elements:', {
                    buttons: eventDatesButtons.length,
                    display: eventDatesDisplay.id
                });
                setupCounterButtons(Array.from(eventDatesButtons), eventDatesSection, eventDatesDisplay);
            }
        }

        // Setup metadata counters with improved initialization and validation
        console.log('Starting metadata counters initialization...');
        
        // Ensure DOM is fully loaded
        if (document.readyState === 'loading') {
            console.log('DOM not fully loaded, waiting...');
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        console.log('DOM ready, setting up metadata counters...');
        const metadataSections = document.querySelectorAll('.metadata-section');
        console.log(`Found ${metadataSections.length} metadata sections`);
        
        if (metadataSections.length === 0) {
            console.warn('No metadata sections found in the document');
            return;
        }
        
        // Initialize all metadata sections with improved validation
        for (const section of metadataSections) {
            const container = section.querySelector('.metadata-container');
            const buttons = section.querySelectorAll('.counter-button');
            const display = section.querySelector('.counter-display');
            
            if (!container || !buttons.length || !display) {
                console.error('Required elements not found for section:', section);
                continue;
            }
            
            console.log('Setting up counter for:', {
                container: container.id,
                buttonCount: buttons.length,
                displayId: display.id
            });
            
            setupCounterButtons(Array.from(buttons), container, display);
        }

        // Form submission handler
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // Add reset button handler
        const resetButton = form?.querySelector('button[type="reset"]');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                console.debug('Form reset initiated');
                form.reset();
                // Reset all metadata fields
                document.querySelectorAll('.metadata-container').forEach(container => {
                    container.innerHTML = '';
                });
                // Reset all counters
                document.querySelectorAll('.counter-display').forEach(display => {
                    display.textContent = '0';
                });
            });
        }
    } catch (error) {
        console.error('Error in initializeForm:', error);
        showAlert('danger', `Error initializing form: ${error.message}`);
        throw error;
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm(e.target)) {
        return;
    }

    const form = e.target;
    
    try {
        // Get and validate metadata values
        const eventMetadata = validateAndGetMetadata('eventMetadata');
        const eventTypeMetadata = validateAndGetMetadata('eventTypeMetadata');
        
        if (!eventMetadata.isValid || !eventTypeMetadata.isValid) {
            showAlert('danger', 'Please fix metadata validation errors before submitting');
            return false;
        }
        
        // Update hidden inputs with validated metadata
        document.getElementById('eventMetadataInput').value = JSON.stringify(eventMetadata.data);
        document.getElementById('eventTypeMetadataInput').value = JSON.stringify(eventTypeMetadata.data);

        // Show loading state
        const saveButton = form.querySelector('#saveButton');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
        }

        // Submit form
        form.submit();
    } catch (error) {
        console.error('Error submitting form:', error);
        showAlert('danger', `Error submitting form: ${error.message}`);
        
        // Reset save button state
        const saveButton = form.querySelector('#saveButton');
        if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fas fa-save me-2"></i>Save';
        }
    }
}

function validateAndGetMetadata(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        return { isValid: false, data: {}, errors: ['Container not found'] };
    }

    const metadata = {};
    const errors = [];
    let isValid = true;

    const groups = container.querySelectorAll('.input-group');
    for (const group of groups) {
        const keyInput = group.querySelector('.metadata-key');
        const valueInput = group.querySelector('.metadata-value');
        
        if (!keyInput || !valueInput) continue;

        const key = keyInput.value.trim();
        const value = valueInput.value.trim();

        if (!key) {
            keyInput.classList.add('is-invalid');
            errors.push('Metadata key cannot be empty');
            isValid = false;
        }
        
        if (!value) {
            valueInput.classList.add('is-invalid');
            errors.push('Metadata value cannot be empty');
            isValid = false;
        }

        if (key && value) {
            metadata[key] = value;
        }
    }

    return { isValid, data: metadata, errors };
}