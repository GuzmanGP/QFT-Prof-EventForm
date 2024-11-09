// validation.js

import { showAlert } from './utils.js';
import { validateMetadataContainer } from './metadataFields.js';

export function validateForm(form) {
    let isValid = true;
    const errors = [];
    clearAllErrors();

    const title = form.querySelector('#title');
    if (!title.value.trim()) {
        showFieldError(title, 'Title is required');
        errors.push('Title is required');
        isValid = false;
    }

    validateAllMetadata(errors);

    if (!isValid) {
        showErrorSummary(errors);
    }

    return isValid;
}

export function validateAllMetadata(errors) {
    ['categoryMetadata', 'subcategoryMetadata'].forEach(id => {
        validateMetadataContainer(document.getElementById(id), errors);
    });
}

export function showFieldError(field, message) {
    field.classList.add('is-invalid');
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    field.parentNode.insertBefore(feedback, field.nextSibling);
    field.classList.add('validation-shake');
    setTimeout(() => field.classList.remove('validation-shake'), 500);
}

export function clearAllErrors() {
    document.querySelectorAll('.is-invalid').forEach(field => {
        field.classList.remove('is-invalid');
        const feedback = field.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    });

    const errorSummary = document.querySelector('.error-summary');
    if (errorSummary) {
        errorSummary.remove();
    }
}

export function showErrorSummary(errors) {
    const summary = document.createElement('div');
    summary.className = 'error-summary';
    summary.innerHTML = `
        <h5>Please correct the following errors:</h5>
        <ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>
    `;
    const form = document.getElementById('formConfiguration');
    form.insertAdjacentElement('beforebegin', summary);
}
