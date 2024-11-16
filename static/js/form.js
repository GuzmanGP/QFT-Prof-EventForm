import { initializeForm } from './init.js';
import { validateForm } from './validation.js';
import { addQuestion } from './question.js';
import { updateMetadataFields } from './metadataFields.js';
import { showAlert, updateQuestionsList } from './utils.js';

document.addEventListener('DOMContentLoaded', initializeForm);
