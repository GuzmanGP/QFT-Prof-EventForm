// form.js
import { initializeForm } from './init.js';
import { 
    updateQuestionCount, 
    showAlert, 
    updateQuestionsList,
    toggleLoadingOverlay,
    showErrorState
} from './utils.js';
import { validateForm } from './validation.js';
import { addQuestion } from './question.js';
import { updateMetadataFields } from './metadataFields.js';

// Initialize form when DOM content is loaded with error recovery
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize form
        await initializeForm();
    } catch (error) {
        console.error('Error initializing form:', error);
        const container = document.getElementById('questions');
        if (container) {
            showErrorState(container, error.message || 'Failed to initialize form');
            showAlert('danger', 'Failed to initialize form. Please try refreshing the page.');
        }
    }
});
