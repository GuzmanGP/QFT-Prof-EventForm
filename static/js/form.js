// form.js
import { initializeForm } from './init.js';
import { 
    showAlert, 
    toggleLoadingOverlay 
} from './utils.js';
import { validateForm } from './validation.js';
import { initializeEventDates } from './eventDates.js';

// Initialize showAlert in eventDates.js context
window.showAlert = showAlert;

// Initialize form when DOM content is loaded with improved error recovery
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded, starting initialization sequence...');
    
    try {
        // Initialize form components in sequence
        console.log('Step 1: Initializing form components...');
        await initializeForm();
        console.log('Form components initialized successfully');
        
        console.log('Step 2: Initializing event dates functionality...');
        await initializeEventDates();
        console.log('Event dates initialized successfully');
        
        // Verify counter initialization
        console.log('Step 3: Verifying metadata counters...');
        const metadataCounters = document.querySelectorAll('.counter-group');
        console.log(`Found ${metadataCounters.length} metadata counters`);
        
        metadataCounters.forEach((counter, index) => {
            const display = counter.querySelector('.counter-display');
            const count = display ? display.textContent : 'N/A';
            console.log(`Metadata counter ${index + 1} initialized with count: ${count}`);
        });
        
        console.log('All event components initialized successfully');
    } catch (error) {
        console.error('Error initializing event form:', error);
        showAlert('danger', `Error: ${error.message}`);
        toggleLoadingOverlay(false);
    }
});

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm(event.target)) {
        return;
    }
    
    try {
        toggleLoadingOverlay(true, 'Saving event...');
        const form = event.target;
        const formData = new FormData(form);
        
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to save event');
        }
        
        showAlert('success', 'Event saved successfully');
        form.reset();
    } catch (error) {
        console.error('Error saving event:', error);
        showAlert('danger', `Failed to save event: ${error.message}`);
    } finally {
        toggleLoadingOverlay(false);
    }
}

// Implement automatic recovery for network issues
window.addEventListener('online', async () => {
    try {
        toggleLoadingOverlay(true);
        await initializeForm();
        showAlert('success', 'Connection restored. Event form reloaded successfully.');
    } catch (error) {
        console.error('Error auto-recovering form:', error);
        showAlert('warning', 'Failed to automatically reload event form.');
    } finally {
        toggleLoadingOverlay(false);
    }
});
