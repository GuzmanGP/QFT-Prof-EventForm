// form.js
import { initializeForm } from './init.js';
import { 
    showAlert, 
    toggleLoadingOverlay,
    showErrorState
} from './utils.js';
import { validateForm } from './validation.js';
import { updateMetadataFields } from './metadataFields.js';
import { initializeEventDates, loadEventDates } from './eventDates.js';

// Initialize showAlert in eventDates.js context
window.showAlert = showAlert;

// Initialize form when DOM content is loaded with error recovery
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize form and event dates
        await initializeForm();
        await initializeEventDates();
    } catch (error) {
        console.error('Error initializing form:', error);
        const container = document.getElementById('questions');
        if (container) {
            // Show error state and provide retry mechanism
            showErrorState(container, error.message || 'Failed to initialize form');
            
            // Add retry button
            const retryButton = document.createElement('button');
            retryButton.className = 'btn btn-primary mt-3';
            retryButton.textContent = 'Retry Loading';
            retryButton.addEventListener('click', async () => {
                try {
                    // Clear previous error state
                    container.innerHTML = '';
                    toggleLoadingOverlay(true);
                    
                    // Attempt to reinitialize
                    await initializeForm();
                    
                    // Clear error message if successful
                    showAlert('success', 'Form loaded successfully');
                } catch (retryError) {
                    console.error('Error retrying form load:', retryError);
                    showErrorState(container, retryError.message || 'Failed to reload form');
                    showAlert('danger', 'Failed to reload form. Please try again.');
                } finally {
                    toggleLoadingOverlay(false);
                }
            });
            
            container.appendChild(retryButton);
            showAlert('danger', 'Failed to initialize form. You can try reloading using the Retry button.');
        }
    }
});

// Implement automatic recovery for network issues
window.addEventListener('online', async () => {
    const container = document.getElementById('questions');
    if (container && container.querySelector('.error-state')) {
        try {
            toggleLoadingOverlay(true);
            await initializeForm();
            showAlert('success', 'Connection restored. Form reloaded successfully.');
        } catch (error) {
            console.error('Error auto-recovering form:', error);
            showErrorState(container, error.message || 'Failed to recover form');
            showAlert('warning', 'Failed to automatically reload form. Please use the retry button.');
        } finally {
            toggleLoadingOverlay(false);
        }
    }
});
