// event.js
import { initializeEvent } from './init.js';
import { 
    showAlert, 
    toggleLoadingOverlay 
} from './utils.js';
import { validateEvent } from './validation.js';

// Initialize showAlert in eventDates.js context
window.showAlert = showAlert;

// Initialize event when DOM content is loaded with improved error recovery
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM content loaded, starting initialization sequence...');
    
    try {
        // Initialize event components in sequence
        console.log('Step 1: Initializing event components...');
        await initializeEvent();
        console.log('Event components initialized successfully');
        
        // Verify counter initialization
        console.log('Step 2: Verifying event metadata counters...');
        const metadataContainers = ['eventMetadata', 'eventTypeMetadata'];
        
        for (const containerId of metadataContainers) {
            const container = document.getElementById(containerId);
            const buttons = container?.parentElement.querySelectorAll('.counter-button');
            const display = container?.parentElement.querySelector('.counter-display');
            
            console.log(`Checking ${containerId}:`, {
                containerExists: !!container,
                buttonCount: buttons?.length,
                displayExists: !!display
            });
            
            if (container && buttons?.length && display) {
                console.log(`Initializing counter for ${containerId}`);
            }
        }
        
        console.log('All event components initialized successfully');
    } catch (error) {
        console.error('Error initializing event:', error);
        showAlert('danger', `Error: ${error.message}`);
        toggleLoadingOverlay(false);
    }
});

// Handle event submission
async function handleEventSubmit(event) {
    event.preventDefault();
    
    if (!validateEvent(event.target)) {
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
        await initializeEvent();
        showAlert('success', 'Connection restored. Event reloaded successfully.');
    } catch (error) {
        console.error('Error auto-recovering event:', error);
        showAlert('warning', 'Failed to automatically reload event.');
    } finally {
        toggleLoadingOverlay(false);
    }
});
