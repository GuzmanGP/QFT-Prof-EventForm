import { 
    updateQuestionCount, 
    showAlert, 
    updateQuestionsList, 
    toggleLoadingOverlay
} from './utils.js';
import { validateForm } from './validation.js';
import { addQuestion } from './question.js';
import { updateMetadataFields } from './metadataFields.js';

document.addEventListener('DOMContentLoaded', initializeForm);
