import { initializeForm } from './init.js';
import { validateForm } from './validation.js';
import { addQuestion, removeQuestion } from './question.js';
import { updateMetadataFields } from './metadataFields.js';
import { showAlert } from './utils.js';

document.addEventListener('DOMContentLoaded', initializeForm);
